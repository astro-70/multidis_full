from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProfileBase(BaseModel):
    education_level: Optional[str] = "college"
    stream_or_major: Optional[str] = None
    target_domain: Optional[str] = None
    preferred_language: Optional[str] = "en"
    location: Optional[str] = None
    bio_and_goals: Optional[Dict[str, Any]] = {}
    career_clarity_score: Optional[int] = 50

class ProfileUpdate(ProfileBase):
    full_name: Optional[str] = None

class ProfileResponse(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

class UserSkillCreate(BaseModel):
    skill_name: str
    proficiency_level: int = 1
    category: Optional[str] = "technical"

class UserSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    skill_id: str
    skill_name: str
    category: str
    proficiency_level: int
    verified_source: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    profile: Optional[ProfileResponse] = None
    skills: List[UserSkillResponse] = []
