from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.schemas.roadmap import (
    RoadmapResponse,
    RoadmapStepResponse,
    UpdateStepProgressRequest,
    FreeResource,
    ProjectBrief
)
from app.repositories.roadmap_repo import RoadmapRepository
from app.repositories.career_repo import CareerRepository
from app.services.auth_service import get_current_user
from app.services.gemini_service import GeminiService
from app.services.youtube_service import youtube_service

router = APIRouter(prefix="/roadmaps", tags=["Personalized Roadmaps"])

def _format_roadmap_response(r) -> RoadmapResponse:
    steps = [
        RoadmapStepResponse(
            id=s.id,
            step_order=s.step_order,
            title=s.title,
            description=s.description,
            week_number=s.week_number,
            free_resources=[FreeResource(**res) for res in (s.free_resources or [])],
            project_brief=ProjectBrief(**s.project_brief) if s.project_brief else None,
            is_completed=s.is_completed,
            completed_at=s.completed_at
        )
        for s in r.steps
    ]
    return RoadmapResponse(
        id=r.id,
        career_id=r.career_id,
        career_title=r.career.title if r.career else "Target Career",
        title=r.title,
        total_duration_weeks=r.total_duration_weeks,
        progress_percentage=r.progress_percentage,
        is_active=r.is_active,
        created_at=r.created_at,
        steps=steps
    )

@router.get("/active", response_model=Optional[RoadmapResponse])
def get_active_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = RoadmapRepository(db)
    roadmap = repo.get_active_roadmap_for_user(current_user.id)
    if not roadmap:
        return None
    return _format_roadmap_response(roadmap)

@router.post("/generate/{career_id}", response_model=RoadmapResponse)
async def generate_career_roadmap(
    career_id: str,
    duration_weeks: int = 12,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    career_repo = CareerRepository(db)
    roadmap_repo = RoadmapRepository(db)
    gemini_svc = GeminiService.get_instance()

    career = career_repo.get_by_id(career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Target career not found")

    user_skills_list = [
        {"name": us.skill.name, "level": us.proficiency_level}
        for us in current_user.skills
    ]

    # Generate roadmap steps
    raw_steps = gemini_svc.generate_personalized_roadmap(
        career_title=career.title,
        user_skills=user_skills_list,
        duration_weeks=duration_weeks
    )

    # Enrich first step with fresh YouTube resources if needed
    if raw_steps and len(raw_steps) > 0:
        yt_vids = await youtube_service.fetch_learning_videos(f"{career.title} tutorial", max_results=2)
        if yt_vids:
            raw_steps[0]["free_resources"].extend(yt_vids)

    roadmap = roadmap_repo.create_roadmap(
        user_id=current_user.id,
        career_id=career.id,
        title=f"PathFinder 12-Week Roadmap: {career.title}",
        total_duration_weeks=duration_weeks,
        steps_data=raw_steps
    )

    return _format_roadmap_response(roadmap)

@router.patch("/steps/{step_id}/progress", response_model=RoadmapResponse)
def update_step_status(
    step_id: str,
    req: UpdateStepProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = RoadmapRepository(db)
    step = repo.toggle_step_completion(step_id, req.is_completed)
    if not step:
        raise HTTPException(status_code=404, detail="Roadmap step not found")

    roadmap = repo.get_by_id(step.roadmap_id)
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    return _format_roadmap_response(roadmap)

