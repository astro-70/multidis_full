from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    file_name: str
    target_role: Optional[str]
    ats_score: int
    section_scores: Dict[str, int]
    missing_keywords: List[str]
    improvement_suggestions: List[str]
    extracted_skills: List[str]
    analyzed_at: datetime
    disclaimer: str = "ATS scores and keyword analyses are simulated against industry recruitment benchmarks and serve as optimization guidance."
