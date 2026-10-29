from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.career import CareerResponse, SkillBrief, CareerComparisonRequest, CareerComparisonResponse, CareerComparisonItem
from app.repositories.career_repo import CareerRepository
from app.models.career import Career

router = APIRouter(prefix="/careers", tags=["Careers & Market Insights"])

def _format_career_response(c: Career) -> CareerResponse:
    skills = [
        SkillBrief(
            id=cs.skill.id,
            name=cs.skill.name,
            category=cs.skill.category,
            importance=cs.importance,
            target_proficiency=cs.target_proficiency
        )
        for cs in c.career_skills
    ]
    return CareerResponse(
        id=c.id,
        title=c.title,
        category=c.category,
        description=c.description,
        min_education=c.min_education,
        salary_entry_inr=c.salary_entry_inr,
        salary_mid_inr=c.salary_mid_inr,
        salary_senior_inr=c.salary_senior_inr,
        demand_level=c.demand_level,
        growth_outlook=c.growth_outlook,
        common_roles=c.common_roles or [],
        is_active=c.is_active,
        created_at=c.created_at,
        skills=skills
    )

@router.get("", response_model=List[CareerResponse])
def get_careers(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    repo = CareerRepository(db)
    if q:
        careers = repo.search(q)
    else:
        careers = repo.get_all(category=category)
    return [_format_career_response(c) for c in careers]

@router.get("/{career_id}", response_model=CareerResponse)
def get_career_by_id(career_id: str, db: Session = Depends(get_db)):
    repo = CareerRepository(db)
    career = repo.get_by_id(career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    return _format_career_response(career)

@router.post("/compare", response_model=CareerComparisonResponse)
def compare_careers(req: CareerComparisonRequest, db: Session = Depends(get_db)):
    if len(req.career_ids) < 2 or len(req.career_ids) > 4:
        raise HTTPException(status_code=400, detail="Please select between 2 and 4 careers to compare.")

    repo = CareerRepository(db)
    items = []
    for cid in req.career_ids:
        career = repo.get_by_id(cid)
        if career:
            top_skills = [cs.skill.name for cs in career.career_skills[:6]]
            items.append(CareerComparisonItem(
                id=career.id,
                title=career.title,
                category=career.category,
                salary_entry_inr=career.salary_entry_inr,
                salary_mid_inr=career.salary_mid_inr,
                salary_senior_inr=career.salary_senior_inr,
                demand_level=career.demand_level,
                growth_outlook=career.growth_outlook,
                min_education=career.min_education,
                top_skills=top_skills,
                common_roles=career.common_roles or []
            ))

    summary = f"Comparison of {len(items)} careers highlighting salary progression from entry to senior bands in INR, technical prerequisites, and Indian job market demand."
    return CareerComparisonResponse(careers=items, comparison_summary=summary)

