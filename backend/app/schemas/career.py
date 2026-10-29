from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class SkillBrief(BaseModel):
    id: str
    name: str
    category: str
    importance: str
    target_proficiency: int

class CareerBase(BaseModel):
    title: str
    category: str
    description: str
    min_education: str
    salary_entry_inr: str
    salary_mid_inr: str
    salary_senior_inr: str
    demand_level: str
    growth_outlook: str
    common_roles: List[str] = []

class CareerResponse(CareerBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_active: bool
    created_at: datetime
    skills: List[SkillBrief] = []

class CareerComparisonRequest(BaseModel):
    career_ids: List[str]

class CareerComparisonItem(BaseModel):
    id: str
    title: str
    category: str
    salary_entry_inr: str
    salary_mid_inr: str
    salary_senior_inr: str
    demand_level: str
    growth_outlook: str
    min_education: str
    top_skills: List[str]
    common_roles: List[str]

class CareerComparisonResponse(BaseModel):
    careers: List[CareerComparisonItem]
    comparison_summary: str
