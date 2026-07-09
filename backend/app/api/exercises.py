import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.models import Exercise, User
from app.schemas.schemas import ExerciseCreate, ExerciseOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/exercises", tags=["exercises"])


# system preset exercises that cannot be deleted
PRESET_EXERCISES = [
    {"name": "卧推", "category": "胸部", "description": "杠铃卧推，锻炼胸大肌、三角肌前束、肱三头肌"},
    {"name": "深蹲", "category": "腿部", "description": "杠铃深蹲，锻炼股四头肌、臀大肌、腘绳肌"},
    {"name": "硬拉", "category": "背部", "description": "传统硬拉，锻炼竖脊肌、臀大肌、腘绳肌、斜方肌"},
    {"name": "肩推", "category": "肩部", "description": "杠铃/哑铃肩推，锻炼三角肌、肱三头肌"},
    {"name": "杠铃划船", "category": "背部", "description": "俯身杠铃划船，锻炼背阔肌、斜方肌、菱形肌"},
    {"name": "引体向上", "category": "背部", "description": "自重引体向上，锻炼背阔肌、肱二头肌"},
    {"name": "哑铃弯举", "category": "手臂", "description": "哑铃二头弯举，锻炼肱二头肌"},
    {"name": "三头臂屈伸", "category": "手臂", "description": "绳索/哑铃三头臂屈伸，锻炼肱三头肌"},
    {"name": "腿举", "category": "腿部", "description": "腿举机推举，锻炼股四头肌、臀大肌"},
    {"name": "罗马尼亚硬拉", "category": "腿部", "description": "罗马尼亚硬拉，锻炼腘绳肌、臀大肌"},
]


async def ensure_preset_exercises(db: AsyncSession):
    """Seed preset exercises if they don't exist."""
    r = await db.execute(select(Exercise).where(Exercise.user_id.is_(None)))
    existing = r.scalars().all()
    existing_names = {e.name for e in existing}
    for ex in PRESET_EXERCISES:
        if ex["name"] not in existing_names:
            db.add(Exercise(name=ex["name"], category=ex["category"], description=ex["description"], user_id=None))
    await db.commit()


@router.get("", response_model=list[ExerciseOut])
async def list_exercises(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await ensure_preset_exercises(db)
    r = await db.execute(
        select(Exercise).where(
            (Exercise.user_id.is_(None)) | (Exercise.user_id == current_user.id)
        ).order_by(Exercise.user_id.is_(None).desc(), Exercise.name)
    )
    return r.scalars().all()


@router.post("", response_model=ExerciseOut, status_code=201)
async def create_exercise(
    data: ExerciseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exercise = Exercise(
        name=data.name,
        category=data.category,
        description=data.description,
        user_id=current_user.id,
    )
    db.add(exercise)
    await db.commit()
    await db.refresh(exercise)
    return exercise


@router.delete("/{exercise_id}", status_code=204)
async def delete_exercise(
    exercise_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    r = await db.execute(select(Exercise).where(Exercise.id == exercise_id))
    exercise = r.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    if exercise.user_id is None:
        raise HTTPException(status_code=403, detail="Cannot delete system preset exercises")
    if exercise.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your exercise")
    await db.delete(exercise)
    await db.commit()
