from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.user import UserResponse, ProfileUpdate, ProfileResponse, UserSkillCreate, UserSkillResponse
from app.repositories.user_repo import UserRepository
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users & Profile"])

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    req: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    profile = user_repo.update_profile(current_user.id, req.model_dump(exclude_unset=True))
    return profile

@router.post("/skills", response_model=UserSkillResponse)
def add_user_skill(
    req: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    user_skill = user_repo.add_or_update_skill(
        user_id=current_user.id,
        skill_name=req.skill_name,
        proficiency=req.proficiency_level,
        category=req.category or "technical",
        source="manual"
    )
    return UserSkillResponse(
        id=user_skill.id,
        skill_id=user_skill.skill_id,
        skill_name=user_skill.skill.name,
        category=user_skill.skill.category,
        proficiency_level=user_skill.proficiency_level,
        verified_source=user_skill.verified_source
    )

@router.get("/skills", response_model=List[UserSkillResponse])
def get_user_skills(
    current_user: User = Depends(get_current_user)
):
    return [
        UserSkillResponse(
            id=us.id,
            skill_id=us.skill.id,
            skill_name=us.skill.name,
            category=us.skill.category,
            proficiency_level=us.proficiency_level,
            verified_source=us.verified_source
        )
        for us in current_user.skills
    ]

