from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.career import CareerResponse

class RecommendationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    career_id: str
    career: CareerResponse
    match_percentage: float
    reasoning: str
    confidence_score: float
    pros_and_cons: Dict[str, List[str]]
    created_at: datetime

class RecommendationListResponse(BaseModel):
    assessment_id: Optional[str] = None
    recommendations: List[RecommendationItem]
    ai_disclaimer: str = "Recommendations are algorithmic guidance based on your responses and Indian market patterns. They do not constitute absolute career guarantees."

class SkillGapItem(BaseModel):
    skill_name: str
    category: str
    user_proficiency: int  # 0 to 5
    required_proficiency: int  # 1 to 5
    importance: str  # critical, essential, nice_to_have
    gap: int  # required - user

class SkillGapResponse(BaseModel):
    career_id: str
    career_title: str
    match_percentage: float
    skills: List[SkillGapItem]
    readiness_level: str  # "Ready", "Needs Preparation", "Fundamental Upskilling Required"
    summary: str
