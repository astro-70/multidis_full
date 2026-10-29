from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class InterviewStartRequest(BaseModel):
    career_id: Optional[str] = None
    role_title: str
    difficulty_level: Optional[str] = "entry"  # entry, mid, senior

class InterviewQuestion(BaseModel):
    question_id: int
    question: str
    category: str  # technical, behavioral, situational
    expected_key_points: List[str]

class InterviewAnswerRequest(BaseModel):
    role_title: str
    question_text: str
    user_answer: str

class InterviewEvaluationResponse(BaseModel):
    score: int  # 0 to 100
    strengths: List[str]
    areas_for_improvement: List[str]
    model_answer: str
    actionable_tip: str

