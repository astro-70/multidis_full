from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.career import Career
from app.schemas.recommendation import (
    RecommendationListResponse,
    RecommendationItem,
    SkillGapResponse,
    SkillGapItem
)
from app.schemas.career import CareerResponse, SkillBrief
from app.repositories.assessment_repo import AssessmentRepository
from app.repositories.career_repo import CareerRepository
from app.services.auth_service import get_current_user
from app.services.gemini_service import GeminiService
from app.routers.careers import _format_career_response

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])

@router.post("/generate", response_model=RecommendationListResponse)
def generate_recommendations(
    assessment_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assess_repo = AssessmentRepository(db)
    career_repo = CareerRepository(db)
    gemini_svc = GeminiService.get_instance()

    # Load assessment answers
    assessment = None
    answers_data = []
    if assessment_id:
        assessment = assess_repo.get_by_id(assessment_id)
    else:
        assessment = assess_repo.get_latest_user_assessment(current_user.id)

    if assessment:
        for ans in assessment.answers:
            answers_data.append({
                "question": ans.question_text,
                "selected": ans.selected_option,
                "category_tag": ans.category_tag,
                "score_weight": ans.score_weight
            })

    # Load available careers
    careers = career_repo.get_all(limit=50)
    careers_dict_list = [
        {
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "demand_level": c.demand_level,
            "salary_entry_inr": c.salary_entry_inr,
            "salary_senior_inr": c.salary_senior_inr
        }
        for c in careers
    ]

    profile_dict = {
        "education_level": current_user.profile.education_level if current_user.profile else "college",
        "stream_or_major": current_user.profile.stream_or_major if current_user.profile else "General",
        "target_domain": current_user.profile.target_domain if current_user.profile else "Tech"
    }

    # Generate via Gemini AI Service / Heuristic pipeline
    raw_recs = gemini_svc.generate_career_recommendations(
        user_profile=profile_dict,
        assessment_answers=answers_data,
        available_careers=careers_dict_list
    )

    # Save to database
    assess_id = assessment.id if assessment else None
    saved_recs = assess_repo.save_recommendations(
        user_id=current_user.id,
        assessment_id=assess_id,
        recommendations_data=raw_recs
    )

    # Build response
    rec_items = []
    for r in saved_recs:
        c = career_repo.get_by_id(r.career_id)
        if c:
            career_resp = _format_career_response(c)
            rec_items.append(RecommendationItem(
                id=r.id,
                career_id=r.career_id,
                career=career_resp,
                match_percentage=r.match_percentage,
                reasoning=r.reasoning,
                confidence_score=r.confidence_score,
                pros_and_cons=r.pros_and_cons or {"pros": [], "cons": []},
                created_at=r.created_at
            ))

    return RecommendationListResponse(
        assessment_id=assess_id,
        recommendations=rec_items
    )

@router.get("/my", response_model=RecommendationListResponse)
def get_my_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assess_repo = AssessmentRepository(db)
    career_repo = CareerRepository(db)
    recs = assess_repo.get_recommendations_for_user(current_user.id, limit=5)

    if not recs:
        # Auto-trigger first recommendation generation if not yet generated
        return generate_recommendations(current_user=current_user, db=db)

    rec_items = []
    for r in recs:
        c = career_repo.get_by_id(r.career_id)
        if c:
            career_resp = _format_career_response(c)
            rec_items.append(RecommendationItem(
                id=r.id,
                career_id=r.career_id,
                career=career_resp,
                match_percentage=r.match_percentage,
                reasoning=r.reasoning,
                confidence_score=r.confidence_score,
                pros_and_cons=r.pros_and_cons or {"pros": [], "cons": []},
                created_at=r.created_at
            ))

    return RecommendationListResponse(
        assessment_id=recs[0].assessment_id if recs else None,
        recommendations=rec_items
    )

@router.get("/{career_id}/skill-gap", response_model=SkillGapResponse)
def get_skill_gap_analysis(
    career_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    career_repo = CareerRepository(db)
    career = career_repo.get_by_id(career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")

    # Map current user's skills
    user_skill_map = {us.skill.name.lower(): us.proficiency_level for us in current_user.skills}

    gap_items = []
    total_required_prof = 0
    total_user_prof = 0

    for cs in career.career_skills:
        req_prof = cs.target_proficiency
        user_prof = user_skill_map.get(cs.skill.name.lower(), 0)
        gap = max(0, req_prof - user_prof)

        total_required_prof += req_prof
        total_user_prof += min(user_prof, req_prof)

        gap_items.append(SkillGapItem(
            skill_name=cs.skill.name,
            category=cs.skill.category,
            user_proficiency=user_prof,
            required_proficiency=req_prof,
            importance=cs.importance,
            gap=gap
        ))

    match_pct = round((total_user_prof / max(1, total_required_prof)) * 100, 1) if total_required_prof > 0 else 50.0
    if match_pct >= 75:
        readiness = "Ready for Entry Roles"
        summary = f"You possess strong baseline coverage across essential skills for {career.title}. Focus on capstone projects and interview prep."
    elif match_pct >= 40:
        readiness = "Needs Targeted Preparation"
        summary = f"You have solid foundational intuition, but key essential tools like {gap_items[0].skill_name if gap_items else 'core tools'} require focused practice."
    else:
        readiness = "Fundamental Upskilling Required"
        summary = f"Building deliberate proficiency in {career.title} core competencies will prepare you for top hiring bands."

    return SkillGapResponse(
        career_id=career.id,
        career_title=career.title,
        match_percentage=match_pct,
        skills=gap_items,
        readiness_level=readiness,
        summary=summary
    )

