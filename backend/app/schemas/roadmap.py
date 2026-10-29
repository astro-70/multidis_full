from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class FreeResource(BaseModel):
    title: str
    url: str
    type: str  # video, article, course, docs
    source: str  # YouTube, freeCodeCamp, MDN, NPTEL, etc.
    duration: Optional[str] = None

class ProjectBrief(BaseModel):
    title: str
    description: str
    deliverables: List[str]
    suggested_tech: List[str]

class RoadmapStepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    step_order: int
    title: str
    description: str
    week_number: int
    free_resources: List[FreeResource] = []
    project_brief: Optional[ProjectBrief] = None
    is_completed: bool
    completed_at: Optional[datetime] = None

class RoadmapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    career_id: str
    career_title: str
    title: str
    total_duration_weeks: int
    progress_percentage: int
    is_active: bool
    created_at: datetime
    steps: List[RoadmapStepResponse] = []

class UpdateStepProgressRequest(BaseModel):
    is_completed: bool
