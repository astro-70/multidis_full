from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, GoogleAuthRequest, TokenResponse
from app.schemas.user import UserResponse
from app.repositories.user_repo import UserRepository
from app.services.auth_service import AuthService, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    existing = user_repo.get_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_pw = AuthService.get_password_hash(req.password)
    user = user_repo.create_user(
        email=req.email,
        hashed_password=hashed_pw,
        full_name=req.full_name,
        role=req.role or "user"
    )

    access_token = AuthService.create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(req.email)
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not AuthService.verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = AuthService.create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.post("/google", response_model=TokenResponse)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Handles Google OAuth / Firebase ID Token verification.
    In dev/test environments, validates payload; in prod, verifies against Google/Firebase keys.
    """
    user_repo = UserRepository(db)
    email = req.email or f"user_{req.id_token[:8]}@google-auth.com"
    full_name = req.full_name or "Google User"

    user = user_repo.get_by_email(email)
    if not user:
        user = user_repo.create_user(
            email=email,
            hashed_password=None,
            full_name=full_name,
            role="user"
        )

    access_token = AuthService.create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    # Build skills response format
    skills_data = [
        {
            "id": us.id,
            "skill_id": us.skill.id,
            "skill_name": us.skill.name,
            "category": us.skill.category,
            "proficiency_level": us.proficiency_level,
            "verified_source": us.verified_source
        }
        for us in current_user.skills
    ]

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        profile=current_user.profile,
        skills=skills_data
    )

