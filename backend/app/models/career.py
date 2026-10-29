import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Career(Base):
    __tablename__ = "careers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(150), unique=True, index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False)  # engineering, management, design, commerce, science, healthcare
    description = Column(Text, nullable=False)
    min_education = Column(String(100), nullable=False)
    salary_entry_inr = Column(String(50), nullable=False)  # e.g. "4-7 LPA"
    salary_mid_inr = Column(String(50), nullable=False)    # e.g. "12-20 LPA"
    salary_senior_inr = Column(String(50), nullable=False) # e.g. "30-50+ LPA"
    demand_level = Column(String(30), default="high", nullable=False)  # moderate, high, very_high
    growth_outlook = Column(String(100), default="18% growth over next 5 years", nullable=False)
    common_roles = Column(JSON, default=list, nullable=False)  # list of titles/specializations
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    career_skills = relationship("CareerSkill", back_populates="career", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="career", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="career")


class CareerSkill(Base):
    __tablename__ = "career_skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    importance = Column(String(30), default="essential", nullable=False)  # critical, essential, nice_to_have
    target_proficiency = Column(Integer, default=3, nullable=False)  # 1 to 5

    # Relationships
    career = relationship("Career", back_populates="career_skills")
    skill = relationship("Skill", back_populates="career_skills")

