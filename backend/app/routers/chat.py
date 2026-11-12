from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatSessionResponse, ChatMessageCreate, ChatMessageResponse
from app.services.auth_service import get_current_user
from app.services.gemini_service import GeminiService
from app.repositories.roadmap_repo import RoadmapRepository

router = APIRouter(prefix="/chat", tags=["AI Career Chatbot"])

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.updated_at.desc()).all()
    res = []
    user_first_name = current_user.full_name.split()[0] if current_user.full_name else "Astro"
    for s in sessions:
        msgs = []
        for m in s.messages:
            content = m.content
            if "Arjun" in content:
                content = content.replace("Arjun", user_first_name)
            msgs.append(
                ChatMessageResponse(
                    id=m.id,
                    sender=m.sender,
                    content=content,
                    context_metadata=m.context_metadata or {},
                    created_at=m.created_at
                )
            )
        res.append(ChatSessionResponse(
            id=s.id,
            title=s.title,
            created_at=s.created_at,
            updated_at=s.updated_at,
            messages=msgs
        ))
    return res

@router.post("/sessions", response_model=ChatSessionResponse)
def create_chat_session(
    title: str = "Career Guidance Session",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = ChatSession(user_id=current_user.id, title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return ChatSessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages=[]
    )

@router.post("/sessions/{session_id}/message", response_model=ChatMessageResponse)
def send_chat_message(
    session_id: str,
    req: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Check if user requested a name change
    clean_content = req.content.strip()
    upper_content = clean_content.upper()
    if any(phrase in upper_content for phrase in ["CHANGE MY NAME", "MY NAME IS", "CALL ME", "NAME ASTRO"]):
        new_name = None
        if "TO " in upper_content:
            new_name = clean_content[upper_content.rfind("TO ") + 3:].strip(" .!?,")
        elif "NAME " in upper_content:
            new_name = clean_content[upper_content.rfind("NAME ") + 5:].strip(" .!?,")
        elif "IS " in upper_content:
            new_name = clean_content[upper_content.rfind("IS ") + 3:].strip(" .!?,")
        elif "CALL ME " in upper_content:
            new_name = clean_content[upper_content.rfind("CALL ME ") + 8:].strip(" .!?,")
        elif "ASTRO" in upper_content:
            new_name = "Astro"

        if new_name:
            new_name = " ".join(w.capitalize() for w in new_name.split())
            current_user.full_name = new_name
            db.add(current_user)
            db.commit()
            db.refresh(current_user)

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        sender="user",
        content=req.content,
        context_metadata=req.context_metadata or {}
    )
    db.add(user_msg)
    db.commit()

    # Load context
    roadmap_repo = RoadmapRepository(db)
    active_roadmap = roadmap_repo.get_active_roadmap_for_user(current_user.id)
    target_role = active_roadmap.career.title if active_roadmap and active_roadmap.career else "Full Stack Web Developer"

    context = {
        "user_name": current_user.full_name,
        "education_level": current_user.profile.education_level if current_user.profile else "college",
        "stream": current_user.profile.stream_or_major if current_user.profile else "Computer Science",
        "target_role": target_role,
        "roadmap_progress": active_roadmap.progress_percentage if active_roadmap else 0
    }

    # Fetch past messages in session
    past_msgs = [
        {"role": "user" if m.sender == "user" else "assistant", "content": m.content}
        for m in session.messages[-8:]
    ]

    # Generate response instantly
    gemini_svc = GeminiService.get_instance()
    reply_text = gemini_svc.chat_response(
        user_message=req.content,
        user_context=context,
        history=past_msgs
    )

    # Save assistant message
    bot_msg = ChatMessage(
        session_id=session.id,
        sender="assistant",
        content=reply_text,
        context_metadata={"target_role": target_role}
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return ChatMessageResponse(
        id=bot_msg.id,
        sender=bot_msg.sender,
        content=bot_msg.content,
        context_metadata=bot_msg.context_metadata or {},
        created_at=bot_msg.created_at
    )

