from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.career import Career, CareerSkill
from app.models.skill import Skill

class CareerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, category: Optional[str] = None, limit: int = 100) -> List[Career]:
        query = self.db.query(Career).options(
            joinedload(Career.career_skills).joinedload(CareerSkill.skill)
        ).filter(Career.is_active == True)
        if category:
            query = query.filter(Career.category == category)
        return query.limit(limit).all()

    def get_by_id(self, career_id: str) -> Optional[Career]:
        return self.db.query(Career).options(
            joinedload(Career.career_skills).joinedload(CareerSkill.skill)
        ).filter(Career.id == career_id).first()

    def get_by_title(self, title: str) -> Optional[Career]:
        return self.db.query(Career).options(
            joinedload(Career.career_skills).joinedload(CareerSkill.skill)
        ).filter(Career.title.ilike(title)).first()

    def search(self, query_str: str) -> List[Career]:
        return self.db.query(Career).options(
            joinedload(Career.career_skills).joinedload(CareerSkill.skill)
        ).filter(
            (Career.title.ilike(f"%{query_str}%")) |
            (Career.description.ilike(f"%{query_str}%")) |
            (Career.category.ilike(f"%{query_str}%"))
        ).all()

