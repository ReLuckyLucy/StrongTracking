import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.models import Exercise, User, Workout, WorkoutSet
from app.schemas.schemas import WorkoutCreate, WorkoutListItem, WorkoutOut, WorkoutSetOut, WorkoutUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


@router.get("", response_model=list[WorkoutListItem])
async def list_workouts(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    date_from: date | None = None,
    date_to: date | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = (
        select(
            Workout.id,
            Workout.date,
            Workout.notes,
            Workout.duration_minutes,
            func.count(func.distinct(WorkoutSet.exercise_id)).label("exercise_count"),
        )
        .outerjoin(WorkoutSet, WorkoutSet.workout_id == Workout.id)
        .where(Workout.user_id == current_user.id)
        .group_by(Workout.id)
        .order_by(Workout.date.desc(), Workout.created_at.desc())
    )
    if date_from:
        q = q.where(Workout.date >= date_from)
    if date_to:
        q = q.where(Workout.date <= date_to)

    offset = (page - 1) * per_page
    q = q.offset(offset).limit(per_page)
    r = await db.execute(q)
    rows = r.all()
    return [WorkoutListItem(id=row[0], date=row[1], notes=row[2], duration_minutes=row[3], exercise_count=row[4]) for row in rows]


@router.get("/{workout_id}", response_model=WorkoutOut)
async def get_workout(
    workout_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    r = await db.execute(
        select(Workout)
        .where(Workout.id == workout_id, Workout.user_id == current_user.id)
        .options(selectinload(Workout.sets).selectinload(WorkoutSet.exercise))
    )
    workout = r.scalar_one_or_none()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    sets_out = [
        WorkoutSetOut(
            id=s.id,
            exercise_id=s.exercise_id,
            exercise_name=s.exercise.name if s.exercise else None,
            set_number=s.set_number,
            weight_kg=s.weight_kg,
            reps=s.reps,
        )
        for s in workout.sets
    ]
    return WorkoutOut(
        id=workout.id,
        date=workout.date,
        notes=workout.notes,
        duration_minutes=workout.duration_minutes,
        created_at=workout.created_at,
        sets=sets_out,
    )


@router.post("", response_model=WorkoutOut, status_code=201)
async def create_workout(
    data: WorkoutCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workout = Workout(
        user_id=current_user.id,
        date=data.date,
        notes=data.notes,
        duration_minutes=data.duration_minutes,
    )
    db.add(workout)
    await db.flush()  # get workout.id

    # verify exercises exist and add sets
    for s_data in data.sets:
        r = await db.execute(select(Exercise).where(Exercise.id == s_data.exercise_id))
        if not r.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Exercise {s_data.exercise_id} not found")
        db.add(WorkoutSet(
            workout_id=workout.id,
            exercise_id=s_data.exercise_id,
            set_number=s_data.set_number,
            weight_kg=s_data.weight_kg,
            reps=s_data.reps,
        ))

    await db.commit()
    await db.refresh(workout)
    # reload with relationships
    return await get_workout(workout.id, db, current_user)


@router.put("/{workout_id}", response_model=WorkoutOut)
async def update_workout(
    workout_id: uuid.UUID,
    data: WorkoutUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    r = await db.execute(
        select(Workout)
        .where(Workout.id == workout_id, Workout.user_id == current_user.id)
        .options(selectinload(Workout.sets))
    )
    workout = r.scalar_one_or_none()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    if data.date is not None:
        workout.date = data.date
    if data.notes is not None:
        workout.notes = data.notes
    if data.duration_minutes is not None:
        workout.duration_minutes = data.duration_minutes

    if data.sets is not None:
        # remove old sets
        await db.execute(delete(WorkoutSet).where(WorkoutSet.workout_id == workout.id))
        # add new sets
        for s_data in data.sets:
            r = await db.execute(select(Exercise).where(Exercise.id == s_data.exercise_id))
            if not r.scalar_one_or_none():
                raise HTTPException(status_code=400, detail=f"Exercise {s_data.exercise_id} not found")
            db.add(WorkoutSet(
                workout_id=workout.id,
                exercise_id=s_data.exercise_id,
                set_number=s_data.set_number,
                weight_kg=s_data.weight_kg,
                reps=s_data.reps,
            ))

    await db.commit()
    return await get_workout(workout.id, db, current_user)


@router.delete("/{workout_id}", status_code=204)
async def delete_workout(
    workout_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    r = await db.execute(
        select(Workout).where(Workout.id == workout_id, Workout.user_id == current_user.id)
    )
    workout = r.scalar_one_or_none()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    await db.delete(workout)
    await db.commit()
