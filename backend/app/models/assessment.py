import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), default="in_progress", nullable=False)  # in_progress, completed, abandoned
    current_question_index = Column(Integer, default=0, nullable=False)
    adaptive_state = Column(JSON, default=dict, nullable=False)  # tracks traits, streams, RIASEC scores
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="assessments")
    answers = relationship("AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, nullable=False)
    question_text = Column(String(500), nullable=False)
    selected_option = Column(String(255), nullable=False)
    score_weight = Column(Integer, default=1, nullable=False)
    category_tag = Column(String(50), nullable=False)  # analytical, creative, social, realistic, etc.
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    assessment = relationship("Assessment", back_populates="answers")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True, index=True)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    match_percentage = Column(Float, nullable=False)  # 0 to 100
    reasoning = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.9, nullable=False)
    pros_and_cons = Column(JSON, default=dict, nullable=False)  # {"pros": [...], "cons": [...]}
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="recommendations")
    assessment = relationship("Assessment", back_populates="recommendations")
    career = relationship("Career", back_populates="recommendations")

