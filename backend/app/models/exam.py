import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from app.database import Base

class ExamScholarship(Base):
    __tablename__ = "exams_scholarships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), unique=True, index=True, nullable=False)
    type = Column(String(50), index=True, nullable=False)  # entrance_exam, scholarship, certification
    eligible_education = Column(String(100), nullable=False)  # class_10, class_12, btech, all
    description = Column(Text, nullable=False)
    link = Column(String(500), nullable=False)
    deadline = Column(DateTime, nullable=True)
    frequency = Column(String(50), default="Annual", nullable=False)  # Annual, Bi-annual, Rolling
    reward_or_seat_info = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

