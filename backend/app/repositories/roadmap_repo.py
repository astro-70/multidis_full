from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from app.models.roadmap import Roadmap, RoadmapStep
from app.models.career import Career

class RoadmapRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, roadmap_id: str) -> Optional[Roadmap]:
        return self.db.query(Roadmap).options(
            joinedload(Roadmap.career),
            joinedload(Roadmap.steps)
        ).filter(Roadmap.id == roadmap_id).first()

    def get_active_roadmap_for_user(self, user_id: str) -> Optional[Roadmap]:
        return self.db.query(Roadmap).options(
            joinedload(Roadmap.career),
            joinedload(Roadmap.steps)
        ).filter(Roadmap.user_id == user_id, Roadmap.is_active == True).order_by(Roadmap.created_at.desc()).first()

    def create_roadmap(self, user_id: str, career_id: str, title: str, total_duration_weeks: int, steps_data: List[dict]) -> Roadmap:
        # Deactivate existing roadmaps
        self.db.query(Roadmap).filter(Roadmap.user_id == user_id).update({"is_active": False})

        roadmap = Roadmap(
            user_id=user_id,
            career_id=career_id,
            title=title,
            total_duration_weeks=total_duration_weeks,
            progress_percentage=0,
            is_active=True
        )
        self.db.add(roadmap)
        self.db.flush()

        for idx, step_item in enumerate(steps_data):
            step = RoadmapStep(
                roadmap_id=roadmap.id,
                step_order=idx + 1,
                title=step_item["title"],
                description=step_item["description"],
                week_number=step_item.get("week_number", idx + 1),
                free_resources=step_item.get("free_resources", []),
                project_brief=step_item.get("project_brief", {})
            )
            self.db.add(step)

        self.db.commit()
        self.db.refresh(roadmap)
        return roadmap

    def toggle_step_completion(self, step_id: str, is_completed: bool) -> Optional[RoadmapStep]:
        step = self.db.query(RoadmapStep).filter(RoadmapStep.id == step_id).first()
        if not step:
            return None
        step.is_completed = is_completed
        step.completed_at = datetime.utcnow() if is_completed else None
        self.db.flush()

        # Recalculate roadmap progress
        total_steps = self.db.query(RoadmapStep).filter(RoadmapStep.roadmap_id == step.roadmap_id).count()
        completed_steps = self.db.query(RoadmapStep).filter(
            RoadmapStep.roadmap_id == step.roadmap_id,
            RoadmapStep.is_completed == True
        ).count()

        roadmap = self.db.query(Roadmap).filter(Roadmap.id == step.roadmap_id).first()
        if roadmap and total_steps > 0:
            roadmap.progress_percentage = int((completed_steps / total_steps) * 100)

        self.db.commit()
        self.db.refresh(step)
        return step

