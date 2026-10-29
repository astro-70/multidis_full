from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ExamScholarshipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    type: str  # entrance_exam, scholarship, certification
    eligible_education: str
    description: str
    link: str
    deadline: Optional[datetime] = None
    frequency: str
    reward_or_seat_info: Optional[str] = None
    is_active: bool
