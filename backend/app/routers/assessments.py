from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.user import User
from app.models.assessment import Assessment, AssessmentAnswer
from app.repositories.assessment_repo import AssessmentRepository
from app.services.auth_service import get_current_user
from app.schemas.assessment import (
    AssessmentStartResponse,
    SubmitAnswerRequest,
    AssessmentStateResponse,
    AssessmentQuestion,
    QuestionOption
)

router = APIRouter(prefix="/assessments", tags=["Career Assessment"])

# Comprehensive 18 adaptive questions covering RIASEC domains and Indian education streams
ASSESSMENT_QUESTIONS = [
    {
        "id": 1,
        "text": "When presented with a complex, unfamiliar problem, what is your instinctive approach?",
        "category": "analytical",
        "options": [
            {"id": "q1_a", "text": "Break it into code, logic algorithms, or mathematical formulas", "category_tag": "technical", "score_weight": 2},
            {"id": "q1_b", "text": "Brainstorm visual layouts, mind maps, or narrative concepts", "category_tag": "creative", "score_weight": 2},
            {"id": "q1_c", "text": "Coordinate a group discussion and distribute tasks strategically", "category_tag": "leadership", "score_weight": 2},
            {"id": "q1_d", "text": "Analyze spreadsheets, balance sheets, or trend charts", "category_tag": "analytical", "score_weight": 2}
        ]
    },
    {
        "id": 2,
        "text": "Which project activity excites you the most?",
        "category": "technical",
        "options": [
            {"id": "q2_a", "text": "Building an automated web tool, mobile app, or robot", "category_tag": "technical", "score_weight": 2},
            {"id": "q2_b", "text": "Designing a brand's visual identity, UI screens, or motion graphic", "category_tag": "creative", "score_weight": 2},
            {"id": "q2_c", "text": "Pitching a new business venture or marketing campaign", "category_tag": "leadership", "score_weight": 2},
            {"id": "q2_d", "text": "Investigating scientific data or biological/environmental samples", "category_tag": "research", "score_weight": 2}
        ]
    },
    {
        "id": 3,
        "text": "How do you prefer to spend your free learning time?",
        "category": "personality",
        "options": [
            {"id": "q3_a", "text": "Solving algorithmic challenges or tinkering with software tools", "category_tag": "technical", "score_weight": 2},
            {"id": "q3_b", "text": "Reading about economics, stock markets, or business models", "category_tag": "analytical", "score_weight": 2},
            {"id": "q3_c", "text": "Creating art, video editing, or writing blogs/fiction", "category_tag": "creative", "score_weight": 2},
            {"id": "q3_d", "text": "Debating public policies, ethics, or current global affairs", "category_tag": "leadership", "score_weight": 2}
        ]
    },
    {
        "id": 4,
        "text": "In a team college/hackathon project, what role do you naturally assume?",
        "category": "leadership",
        "options": [
            {"id": "q4_a", "text": "The Lead Architect writing the core logic and backend", "category_tag": "technical", "score_weight": 2},
            {"id": "q4_b", "text": "The UX/UI Designer crafting the user flow and slides", "category_tag": "creative", "score_weight": 2},
            {"id": "q4_c", "text": "The Project Manager coordinating deadlines and the pitch", "category_tag": "leadership", "score_weight": 2},
            {"id": "q4_d", "text": "The Researcher validating market stats and numbers", "category_tag": "analytical", "score_weight": 2}
        ]
    },
    {
        "id": 5,
        "text": "What type of work environment brings out your peak productivity?",
        "category": "environment",
        "options": [
            {"id": "q5_a", "text": "Deep, focused individual problem solving with headphones on", "category_tag": "technical", "score_weight": 2},
            {"id": "q5_b", "text": "Fast-paced collaborative environment with meetings and negotiations", "category_tag": "leadership", "score_weight": 2},
            {"id": "q5_c", "text": "Creative studio with fluid timelines and visual exploration", "category_tag": "creative", "score_weight": 2},
            {"id": "q5_d", "text": "Structured corporate setup analyzing audited data and processes", "category_tag": "analytical", "score_weight": 2}
        ]
    },
    {
        "id": 6,
        "text": "When you encounter a sudden bug or roadblock, how do you respond?",
        "category": "resilience",
        "options": [
            {"id": "q6_a", "text": "Read stack traces and debug systematically until resolved", "category_tag": "technical", "score_weight": 2},
            {"id": "q6_b", "text": "Explore completely alternative creative angles or pivots", "category_tag": "creative", "score_weight": 2},
            {"id": "q6_c", "text": "Consult mentors, peers, or pull in specialized help", "category_tag": "leadership", "score_weight": 2},
            {"id": "q6_d", "text": "Verify baseline assumptions against documented standards", "category_tag": "analytical", "score_weight": 2}
        ]
    },
    {
        "id": 7,
        "text": "Which metric of career success matters most to you?",
        "category": "values",
        "options": [
            {"id": "q7_a", "text": "Technical mastery and solving world-class engineering hurdles", "category_tag": "technical", "score_weight": 2},
            {"id": "q7_b", "text": "Financial compounding, high salary growth, and wealth building", "category_tag": "analytical", "score_weight": 2},
            {"id": "q7_c", "text": "Direct societal impact, governance, and helping communities", "category_tag": "leadership", "score_weight": 2},
            {"id": "q7_d", "text": "Creative autonomy and designing memorable human experiences", "category_tag": "creative", "score_weight": 2}
        ]
    },
    {
        "id": 8,
        "text": "How do you feel about working with mathematics, statistics, or data?",
        "category": "aptitude",
        "options": [
            {"id": "q8_a", "text": "I enjoy discovering hidden patterns and building models", "category_tag": "analytical", "score_weight": 2},
            {"id": "q8_b", "text": "I like using math when applied to programming and algorithms", "category_tag": "technical", "score_weight": 2},
            {"id": "q8_c", "text": "I prefer conceptual, verbal, and visual thinking over pure math", "category_tag": "creative", "score_weight": 2},
            {"id": "q8_d", "text": "I care about numbers mostly when measuring business ROI", "category_tag": "leadership", "score_weight": 2}
        ]
    },
    {
        "id": 9,
        "text": "If you were offered 10 Lakhs INR grant to launch an initiative, what would you build?",
        "category": "aspiration",
        "options": [
            {"id": "q9_a", "text": "An AI-powered SaaS product or consumer app", "category_tag": "technical", "score_weight": 2},
            {"id": "q9_b", "text": "An investment fund or profitable e-commerce brand", "category_tag": "analytical", "score_weight": 2},
            {"id": "q9_c", "text": "A design studio or creative media agency", "category_tag": "creative", "score_weight": 2},
            {"id": "q9_d", "text": "A grassroots public policy or rural education foundation", "category_tag": "leadership", "score_weight": 2}
        ]
    },
    {
        "id": 10,
        "text": "What subject did you consistently look forward to in school or college?",
        "category": "academics",
        "options": [
            {"id": "q10_a", "text": "Computer Science / Physics / Mechanics", "category_tag": "technical", "score_weight": 2},
            {"id": "q10_b", "text": "Mathematics / Economics / Accountancy", "category_tag": "analytical", "score_weight": 2},
            {"id": "q10_c", "text": "Literature / Fine Arts / Media Studies", "category_tag": "creative", "score_weight": 2},
            {"id": "q10_d", "text": "Social Sciences / History / Political Science / Biology", "category_tag": "research", "score_weight": 2}
        ]
    },
    {
        "id": 11,
        "text": "How do you prefer to communicate your thoughts to others?",
        "category": "communication",
        "options": [
            {"id": "q11_a", "text": "Through working prototypes, code, and technical diagrams", "category_tag": "technical", "score_weight": 2},
            {"id": "q11_b", "text": "Through persuasive storytelling, speeches, and presentations", "category_tag": "leadership", "score_weight": 2},
            {"id": "q11_c", "text": "Through concise charts, tables, and data summaries", "category_tag": "analytical", "score_weight": 2},
            {"id": "q11_d", "text": "Through interactive mockups, sketches, and visual metaphors", "category_tag": "creative", "score_weight": 2}
        ]
    },
    {
        "id": 12,
        "text": "What level of risk and uncertainty do you feel comfortable with?",
        "category": "risk",
        "options": [
            {"id": "q12_a", "text": "High risk for high upside (early startups, crypto, trading)", "category_tag": "analytical", "score_weight": 2},
            {"id": "q12_b", "text": "Moderate risk with clear growth steps (tech companies, product roles)", "category_tag": "technical", "score_weight": 2},
            {"id": "q12_c", "text": "Stable structured tenure with societal authority (PSUs, Civil Services)", "category_tag": "leadership", "score_weight": 2},
            {"id": "q12_d", "text": "Dynamic freelance or portfolio career across creative projects", "category_tag": "creative", "score_weight": 2}
        ]
    },
    {
        "id": 13,
        "text": "How do you prefer to solve user issues?",
        "category": "product_sense",
        "options": [
            {"id": "q13_a", "text": "Writing cleaner code and optimizing server latency", "category_tag": "technical", "score_weight": 2},
            {"id": "q13_b", "text": "Observing their behavior and redesigning confusing UI buttons", "category_tag": "creative", "score_weight": 2},
            {"id": "q13_c", "text": "Analyzing funnel drop-off metrics to find where they exit", "category_tag": "analytical", "score_weight": 2},
            {"id": "q13_d", "text": "Re-aligning the product roadmap with core customer pain points", "category_tag": "leadership", "score_weight": 2}
        ]
    },
    {
        "id": 14,
        "text": "Which hardware or physical system interests you most?",
        "category": "engineering_physical",
        "options": [
            {"id": "q14_a", "text": "Cloud server clusters, high-speed GPUs, and networks", "category_tag": "technical", "score_weight": 2},
            {"id": "q14_b", "text": "Electric vehicle battery packs and renewable solar inverters", "category_tag": "technical", "score_weight": 2},
            {"id": "q14_c", "text": "Bridges, metro transport tunnels, and smart city architecture", "category_tag": "analytical", "score_weight": 2},
            {"id": "q14_d", "text": "I focus strictly on software, finance, or people systems", "category_tag": "leadership", "score_weight": 2}
        ]
    },
    {
        "id": 15,
        "text": "What is your primary motivation right now?",
        "category": "urgency",
        "options": [
            {"id": "q15_a", "text": "Crack high-paying campus placements or entry-level software job", "category_tag": "technical", "score_weight": 2},
            {"id": "q15_b", "text": "Choose the right Class 11-12 stream or undergraduate college branch", "category_tag": "research", "score_weight": 2},
            {"id": "q15_c", "text": "Transition from non-tech/support into high-growth modern roles", "category_tag": "leadership", "score_weight": 2},
            {"id": "q15_d", "text": "Clear competitive exams like GATE, CAT, or UPSC", "category_tag": "analytical", "score_weight": 2}
        ]
    }
]

@router.post("/start", response_model=AssessmentStartResponse)
def start_assessment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = AssessmentRepository(db)
    # Check if there is an in-progress assessment to resume
    existing = repo.get_latest_user_assessment(current_user.id)
    if existing and existing.status == "in_progress" and existing.current_question_index < len(ASSESSMENT_QUESTIONS):
        idx = existing.current_question_index
        q = ASSESSMENT_QUESTIONS[idx]
        return AssessmentStartResponse(
            assessment_id=existing.id,
            total_questions=len(ASSESSMENT_QUESTIONS),
            current_question_index=idx,
            current_question=AssessmentQuestion(**q),
            status=existing.status
        )

    # Start new assessment
    assessment = repo.create_assessment(user_id=current_user.id, adaptive_state={"answers_count": 0})
    q = ASSESSMENT_QUESTIONS[0]
    return AssessmentStartResponse(
        assessment_id=assessment.id,
        total_questions=len(ASSESSMENT_QUESTIONS),
        current_question_index=0,
        current_question=AssessmentQuestion(**q),
        status="in_progress"
    )

@router.post("/{assessment_id}/answer", response_model=AssessmentStateResponse)
def submit_answer(
    assessment_id: str,
    req: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = AssessmentRepository(db)
    assessment = repo.get_by_id(assessment_id)
    if not assessment or assessment.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assessment session not found")

    # Record answer
    repo.record_answer(
        assessment_id=assessment.id,
        question_id=req.question_id,
        question_text=req.question_text,
        selected_option=req.selected_option_text,
        category_tag=req.category_tag,
        score_weight=req.score_weight
    )

    assessment.current_question_index += 1
    total_q = len(ASSESSMENT_QUESTIONS)

    if assessment.current_question_index >= total_q:
        assessment.status = "completed"
        db.commit()
        return AssessmentStateResponse(
            assessment_id=assessment.id,
            current_question_index=total_q,
            total_questions=total_q,
            is_completed=True,
            next_question=None,
            status="completed"
        )

    db.commit()
    next_q_data = ASSESSMENT_QUESTIONS[assessment.current_question_index]
    return AssessmentStateResponse(
        assessment_id=assessment.id,
        current_question_index=assessment.current_question_index,
        total_questions=total_q,
        is_completed=False,
        next_question=AssessmentQuestion(**next_q_data),
        status="in_progress"
    )

@router.get("/{assessment_id}/status", response_model=AssessmentStateResponse)
def get_assessment_status(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = AssessmentRepository(db)
    assessment = repo.get_by_id(assessment_id)
    if not assessment or assessment.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assessment not found")

    total_q = len(ASSESSMENT_QUESTIONS)
    is_completed = assessment.current_question_index >= total_q or assessment.status == "completed"
    next_q = None
    if not is_completed:
        next_q = AssessmentQuestion(**ASSESSMENT_QUESTIONS[assessment.current_question_index])

    return AssessmentStateResponse(
        assessment_id=assessment.id,
        current_question_index=assessment.current_question_index,
        total_questions=total_q,
        is_completed=is_completed,
        next_question=next_q,
        status=assessment.status
    )

