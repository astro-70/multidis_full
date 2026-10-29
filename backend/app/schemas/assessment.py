from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class QuestionOption(BaseModel):
    id: str
    text: str
    category_tag: str  # e.g., 'technical', 'creative', 'management', 'analytical', 'social'
    score_weight: int = 1

class AssessmentQuestion(BaseModel):
    id: int
    text: str
    category: str
    options: List[QuestionOption]

class AssessmentStartResponse(BaseModel):
    assessment_id: str
    total_questions: int
    current_question_index: int
    current_question: AssessmentQuestion
    status: str

class SubmitAnswerRequest(BaseModel):
    question_id: int
    selected_option_id: str
    question_text: str
    selected_option_text: str
    category_tag: str
    score_weight: int = 1

class AssessmentStateResponse(BaseModel):
    assessment_id: str
    current_question_index: int
    total_questions: int
    is_completed: bool
    next_question: Optional[AssessmentQuestion] = None
    status: str

