from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.mock_interview import (
    InterviewStartRequest,
    InterviewQuestion,
    InterviewAnswerRequest,
    InterviewEvaluationResponse
)
from app.services.auth_service import get_current_user
from app.services.gemini_service import GeminiService
from app.repositories.career_repo import CareerRepository

router = APIRouter(prefix="/mock-interview", tags=["Mock Interview Practice"])

QUESTION_BANK = {
    "Full Stack Web Developer": [
        {
            "question_id": 1,
            "question": "Explain how Next.js Server Components differ from standard React Client Components and when you would choose one over the other.",
            "category": "technical",
            "expected_key_points": ["Bundle size reduction", "Zero client JavaScript", "Direct database access on server", "Interactivity requires client boundary"]
        },
        {
            "question_id": 2,
            "question": "Walk me through how you optimize an API query in PostgreSQL when query latency starts spiking under heavy traffic.",
            "category": "technical",
            "expected_key_points": ["EXPLAIN ANALYZE", "B-tree and composite indexing", "N+1 query resolution", "Connection pooling & caching"]
        },
        {
            "question_id": 3,
            "question": "Tell me about a time you faced a critical production bug right before a major product demo or release. How did you triage and resolve it?",
            "category": "behavioral",
            "expected_key_points": ["Calm triage", "Root cause reproduction", "Rollback vs hotfix strategy", "Post-mortem documentation"]
        }
    ],
    "Data Scientist & Machine Learning Engineer": [
        {
            "question_id": 1,
            "question": "How do you detect and handle severe class imbalance when training a high-stakes credit fraud or disease detection model?",
            "category": "technical",
            "expected_key_points": ["SMOTE / resynthesis", "Precision-Recall AUC vs ROC AUC", "Cost-sensitive focal loss", "Stratified sampling"]
        },
        {
            "question_id": 2,
            "question": "Explain the difference between Fine-Tuning, LoRA, and Retrieval-Augmented Generation (RAG) when deploying LLMs for enterprise use.",
            "category": "technical",
            "expected_key_points": ["Knowledge freshness vs style adaptation", "Compute cost & parameter efficiency", "Hallucination mitigation via vector databases"]
        }
    ],
    "General": [
        {
            "question_id": 1,
            "question": "Why are you interested in pursuing this career path, and what specific steps have you taken over the past six months to prepare?",
            "category": "behavioral",
            "expected_key_points": ["Clear motivation", "Concrete projects built", "Curiosity & self-driven learning"]
        },
        {
            "question_id": 2,
            "question": "Describe a challenging technical or collaborative project you worked on. What was your specific contribution and what was the outcome?",
            "category": "situational",
            "expected_key_points": ["STAR methodology", "Clear role definition", "Quantifiable positive impact"]
        }
    ]
}

@router.post("/questions", response_model=List[InterviewQuestion])
def get_interview_questions(
    req: InterviewStartRequest,
    current_user: User = Depends(get_current_user)
):
    questions = QUESTION_BANK.get(req.role_title)
    if not questions:
        questions = QUESTION_BANK.get("General")
    return [InterviewQuestion(**q) for q in questions]

@router.post("/evaluate", response_model=InterviewEvaluationResponse)
def evaluate_interview_response(
    req: InterviewAnswerRequest,
    current_user: User = Depends(get_current_user)
):
    gemini_svc = GeminiService.get_instance()
    evaluation = gemini_svc.evaluate_interview_answer(
        role_title=req.role_title,
        question=req.question_text,
        user_answer=req.user_answer
    )
    return InterviewEvaluationResponse(**evaluation)

