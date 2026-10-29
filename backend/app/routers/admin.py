from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database import get_db
from app.models.user import User
from app.models.career import Career
from app.models.assessment import Assessment
from app.models.resume import Resume
from app.models.exam import ExamScholarship
from app.services.auth_service import require_admin
from app.schemas.career import CareerBase, CareerResponse
from app.routers.careers import _format_career_response

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/metrics")
def get_admin_metrics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_assessments = db.query(Assessment).count()
    completed_assessments = db.query(Assessment).filter(Assessment.status == "completed").count()
    total_resumes_analyzed = db.query(Resume).count()
    total_careers = db.query(Career).count()
    total_exams = db.query(ExamScholarship).count()

    return {
        "total_users": total_users,
        "total_assessments_started": total_assessments,
        "completed_assessments": completed_assessments,
        "completion_rate_pct": round((completed_assessments / max(1, total_assessments)) * 100, 1),
        "total_resumes_analyzed": total_resumes_analyzed,
        "total_careers": total_careers,
        "total_exams_scholarships": total_exams
    }

@router.post("/careers", response_model=CareerResponse)
def create_career(
    req: CareerBase,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Career).filter(Career.title.ilike(req.title)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Career with this title already exists")

    career = Career(
        title=req.title,
        category=req.category,
        description=req.description,
        min_education=req.min_education,
        salary_entry_inr=req.salary_entry_inr,
        salary_mid_inr=req.salary_mid_inr,
        salary_senior_inr=req.salary_senior_inr,
        demand_level=req.demand_level,
        growth_outlook=req.growth_outlook,
        common_roles=req.common_roles,
        is_active=True
    )
    db.add(career)
    db.commit()
    db.refresh(career)
    return _format_career_response(career)

