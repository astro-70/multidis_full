import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    ats_score = Column(Integer, default=0, nullable=False)  # 0 to 100
    section_scores = Column(JSON, default=dict, nullable=False)  # {"experience": 85, "skills": 70, ...}
    missing_keywords = Column(JSON, default=list, nullable=False)
    improvement_suggestions = Column(JSON, default=list, nullable=False)
    target_role = Column(String(150), nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="resumes")

