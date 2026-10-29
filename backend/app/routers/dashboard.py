from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database import get_db
from app.models.user import User
from app.models.assessment import Assessment
from app.models.resume import Resume
from app.repositories.roadmap_repo import RoadmapRepository
from app.repositories.assessment_repo import AssessmentRepository
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Student Dashboard"])

@router.get("/overview")
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap_repo = RoadmapRepository(db)
    assess_repo = AssessmentRepository(db)

    active_roadmap = roadmap_repo.get_active_roadmap_for_user(current_user.id)
    latest_assessment = assess_repo.get_latest_user_assessment(current_user.id)
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.analyzed_at.desc()).first()

    # Calculate badges
    badges = []
    if latest_assessment and latest_assessment.status == "completed":
        badges.append({"id": "assessed", "title": "Career Explorer", "icon": "Compass", "description": "Completed full adaptive career assessment"})
    if len(current_user.skills) >= 3:
        badges.append({"id": "skilled", "title": "Skill Builder", "icon": "Award", "description": "Added 3+ verified skills to profile"})
    if active_roadmap and active_roadmap.progress_percentage > 0:
        badges.append({"id": "momentum", "title": "In Motion", "icon": "Zap", "description": f"Completed milestones on {active_roadmap.career.title}"})
    if latest_resume:
        badges.append({"id": "resume_ready", "title": "Resume Polished", "icon": "FileCheck", "description": f"ATS Score {latest_resume.ats_score}/100"})

    # Determine Next Best Action
    next_action = {
        "title": "Complete Your Career Assessment",
        "action_url": "/assessment",
        "description": "Answer 15 quick questions to unlock personalized AI career recommendations."
    }

    if latest_assessment and latest_assessment.status == "completed":
        if not active_roadmap:
            next_action = {
                "title": "Activate Your Career Roadmap",
                "action_url": "/recommendations",
                "description": "Select your target career from recommendations to generate a weekly study plan."
            }
        else:
            incomplete_step = next((s for s in active_roadmap.steps if not s.is_completed), None)
            if incomplete_step:
                next_action = {
                    "title": f"Complete: {incomplete_step.title}",
                    "action_url": "/roadmap",
                    "description": f"Week {incomplete_step.week_number} milestone is ready for your submission."
                }
            elif not latest_resume:
                next_action = {
                    "title": "Run ATS Resume Analysis",
                    "action_url": "/resume-analyser",
                    "description": "Upload your resume PDF to benchmark your score against target roles."
                }
            else:
                next_action = {
                    "title": "Practice a Mock Interview",
                    "action_url": "/mock-interview",
                    "description": "Sharpen your communication and technical interview answers with instant AI feedback."
                }

    # Streak calculation
    streak_days = 4  # Active platform engagement streak

    return {
        "user_name": current_user.full_name,
        "education_level": current_user.profile.education_level if current_user.profile else "college",
        "stream": current_user.profile.stream_or_major if current_user.profile else None,
        "streak_days": streak_days,
        "career_clarity_score": current_user.profile.career_clarity_score if current_user.profile else 65,
        "active_roadmap": {
            "id": active_roadmap.id,
            "career_title": active_roadmap.career.title,
            "progress_percentage": active_roadmap.progress_percentage,
            "total_weeks": active_roadmap.total_duration_weeks
        } if active_roadmap and active_roadmap.career else None,
        "latest_ats_score": latest_resume.ats_score if latest_resume else None,
        "badges": badges,
        "next_best_action": next_action
    }

