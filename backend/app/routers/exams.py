from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.exam import ExamScholarship
from app.schemas.exam import ExamScholarshipResponse
from app.services.calendar_service import calendar_service
from app.services.email_service import email_service
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/exams-scholarships", tags=["Exams & Scholarships"])

@router.get("", response_model=List[ExamScholarshipResponse])
def get_exams_and_scholarships(
    type: Optional[str] = None,
    eligible_education: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ExamScholarship).filter(ExamScholarship.is_active == True)
    if type:
        query = query.filter(ExamScholarship.type == type)
    if eligible_education:
        query = query.filter((ExamScholarship.eligible_education == eligible_education) | (ExamScholarship.eligible_education == "all"))
    return query.all()

@router.get("/{exam_id}/calendar-link")
def get_exam_calendar_link(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(ExamScholarship).filter(ExamScholarship.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    link = calendar_service.generate_calendar_link(
        title=f"PathFinder Deadline: {exam.title}",
        description=f"{exam.description}\nLink: {exam.link}",
        date_str="2026-11-15"
    )
    return {"calendar_url": link}

@router.post("/{exam_id}/remind-me")
def set_exam_reminder(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam = db.query(ExamScholarship).filter(ExamScholarship.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    email_service.send_exam_reminder(
        to_email=current_user.email,
        exam_title=exam.title,
        deadline=exam.frequency or "Upcoming Cycle"
    )
    return {"message": f"Reminder scheduled for {exam.title} to {current_user.email}"}

