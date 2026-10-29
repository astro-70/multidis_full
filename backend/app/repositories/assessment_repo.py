from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.assessment import Assessment, AssessmentAnswer, Recommendation
from app.models.career import Career

class AssessmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_assessment(self, user_id: str, adaptive_state: dict = None) -> Assessment:
        assessment = Assessment(
            user_id=user_id,
            status="in_progress",
            current_question_index=0,
            adaptive_state=adaptive_state or {}
        )
        self.db.add(assessment)
        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def get_by_id(self, assessment_id: str) -> Optional[Assessment]:
        return self.db.query(Assessment).options(
            joinedload(Assessment.answers)
        ).filter(Assessment.id == assessment_id).first()

    def get_latest_user_assessment(self, user_id: str) -> Optional[Assessment]:
        return self.db.query(Assessment).options(
            joinedload(Assessment.answers)
        ).filter(Assessment.user_id == user_id).order_by(Assessment.created_at.desc()).first()

    def record_answer(self, assessment_id: str, question_id: int, question_text: str, selected_option: str, category_tag: str, score_weight: int = 1) -> AssessmentAnswer:
        answer = AssessmentAnswer(
            assessment_id=assessment_id,
            question_id=question_id,
            question_text=question_text,
            selected_option=selected_option,
            category_tag=category_tag,
            score_weight=score_weight
        )
        self.db.add(answer)
        self.db.commit()
        self.db.refresh(answer)
        return answer

    def save_recommendations(self, user_id: str, assessment_id: Optional[str], recommendations_data: List[dict]) -> List[Recommendation]:
        recs = []
        for item in recommendations_data:
            rec = Recommendation(
                user_id=user_id,
                assessment_id=assessment_id,
                career_id=item["career_id"],
                match_percentage=item["match_percentage"],
                reasoning=item["reasoning"],
                confidence_score=item.get("confidence_score", 0.9),
                pros_and_cons=item.get("pros_and_cons", {"pros": [], "cons": []})
            )
            self.db.add(rec)
            recs.append(rec)
        self.db.commit()
        return recs

    def get_recommendations_for_user(self, user_id: str, limit: int = 5) -> List[Recommendation]:
        return self.db.query(Recommendation).options(
            joinedload(Recommendation.career)
        ).filter(Recommendation.user_id == user_id).order_by(Recommendation.match_percentage.desc(), Recommendation.created_at.desc()).limit(limit).all()

