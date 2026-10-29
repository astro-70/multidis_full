from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User, Profile
from app.models.skill import UserSkill, Skill

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, email: str, hashed_password: Optional[str], full_name: str, role: str = "user") -> User:
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role=role
        )
        self.db.add(user)
        self.db.flush()
        # Create default empty profile
        profile = Profile(
            user_id=user.id,
            education_level="college",
            preferred_language="en",
            bio_and_goals={"dream_roles": [], "interests": []}
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_profile(self, user_id: str, profile_data: dict) -> Profile:
        profile = self.db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            profile = Profile(user_id=user_id, **profile_data)
            self.db.add(profile)
        else:
            for key, val in profile_data.items():
                if hasattr(profile, key) and val is not None:
                    setattr(profile, key, val)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def add_or_update_skill(self, user_id: str, skill_name: str, proficiency: int, category: str = "technical", source: str = "manual") -> UserSkill:
        # Find or create skill
        skill = self.db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
        if not skill:
            skill = Skill(name=skill_name, category=category)
            self.db.add(skill)
            self.db.flush()

        user_skill = self.db.query(UserSkill).filter(
            UserSkill.user_id == user_id,
            UserSkill.skill_id == skill.id
        ).first()

        if user_skill:
            user_skill.proficiency_level = proficiency
            user_skill.verified_source = source
        else:
            user_skill = UserSkill(
                user_id=user_id,
                skill_id=skill.id,
                proficiency_level=proficiency,
                verified_source=source
            )
            self.db.add(user_skill)

        self.db.commit()
        self.db.refresh(user_skill)
        return user_skill

