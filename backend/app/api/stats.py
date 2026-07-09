import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.models import Exercise, User, Workout, WorkoutSet
from app.schemas.schemas import ExercisePR, HeatmapPoint, OverviewOut, ProgressPoint
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/progress/{exercise_id}", response_model=list[ProgressPoint])
async def exercise_progress(
    exercise_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return per-day max & avg weight for a given exercise."""
    # verify exercise exists
    r = await db.execute(select(Exercise).where(Exercise.id == exercise_id))
    if not r.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Exercise not found")

    q = (
        select(
            Workout.date,
            func.max(WorkoutSet.weight_kg),
            func.avg(WorkoutSet.weight_kg),
        )
        .join(WorkoutSet, WorkoutSet.workout_id == Workout.id)
        .where(
            Workout.user_id == current_user.id,
            WorkoutSet.exercise_id == exercise_id,
        )
        .group_by(Workout.date)
        .order_by(Workout.date)
    )
    r = await db.execute(q)
    rows = r.all()
    return [
        ProgressPoint(date=row[0], max_weight=round(float(row[1]), 1), avg_weight=round(float(row[2]), 1))
        for row in rows
    ]


@router.get("/heatmap", response_model=list[HeatmapPoint])
async def heatmap(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return count of workouts per day for the past year."""
    q = (
        select(Workout.date, func.count(Workout.id))
        .where(Workout.user_id == current_user.id)
        .group_by(Workout.date)
        .order_by(Workout.date)
    )
    r = await db.execute(q)
    rows = r.all()
    return [HeatmapPoint(date=row[0], count=row[1]) for row in rows]


@router.get("/overview", response_model=OverviewOut)
async def overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # total workouts
    r = await db.execute(
        select(func.count(Workout.id)).where(Workout.user_id == current_user.id)
    )
    total_workouts = r.scalar() or 0

    # current streak
    r = await db.execute(
        select(Workout.date)
        .where(Workout.user_id == current_user.id)
        .distinct()
        .order_by(Workout.date.desc())
    )
    dates = [row[0] for row in r.all()]
    current_streak = 0
    longest_streak = 0
    streak = 0
    today = date.today()
    for i, d in enumerate(dates):
        if i == 0:
            expected = d
        else:
            delta = (expected - d).days
            if delta == 1:
                streak += 1
            else:
                streak = 0
            expected = d
        if streak == 0:
            streak = 1
        if streak > longest_streak:
            longest_streak = streak
    # check if streak is still active (latest workout is today or yesterday)
    if dates:
        if (today - dates[0]).days <= 1:
            current_streak = 1
            for i in range(1, len(dates)):
                if (dates[i - 1] - dates[i]).days == 1:
                    current_streak += 1
                else:
                    break

    # per-exercise PRs
    # subquery: for each (exercise_id, date), get max weight
    sub = (
        select(
            WorkoutSet.exercise_id,
            Workout.date,
            func.max(WorkoutSet.weight_kg).label("max_w"),
        )
        .join(Workout, Workout.id == WorkoutSet.workout_id)
        .where(Workout.user_id == current_user.id)
        .group_by(WorkoutSet.exercise_id, Workout.date)
        .subquery()
    )
    # get exercise with its all-time max weight
    r = await db.execute(
        select(
            sub.c.exercise_id,
            Exercise.name,
            func.max(sub.c.max_w),
        )
        .join(Exercise, Exercise.id == sub.c.exercise_id)
        .group_by(sub.c.exercise_id, Exercise.name)
        .order_by(func.max(sub.c.max_w).desc())
    )
    pr_rows = r.all()

    exercise_prs = []
    for pr_row in pr_rows:
        # find the date of the max weight
        r2 = await db.execute(
            select(sub.c.date)
            .where(sub.c.exercise_id == pr_row[0], sub.c.max_w == pr_row[2])
            .order_by(sub.c.date.desc())
            .limit(1)
        )
        pr_date = r2.scalar_one()
        exercise_prs.append(ExercisePR(
            exercise_id=pr_row[0],
            exercise_name=pr_row[1],
            max_weight=round(float(pr_row[2]), 1),
            max_weight_date=pr_date,
        ))

    return OverviewOut(
        total_workouts=total_workouts,
        current_streak=current_streak,
        longest_streak=longest_streak,
        exercise_prs=exercise_prs,
    )
