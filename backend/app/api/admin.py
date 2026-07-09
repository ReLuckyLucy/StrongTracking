import uuid
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.models import Exercise, User, Workout
from app.schemas.schemas import AdminResetPassword, AdminStatsOut, UserAdminOut, UserListOut
from app.services.auth import get_current_admin, hash_password

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsOut)
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    r = await db.execute(select(func.count(User.id)))
    total_users = r.scalar() or 0

    r = await db.execute(select(func.count(Workout.id)))
    total_workouts = r.scalar() or 0

    r = await db.execute(select(func.count(Exercise.id)))
    total_exercises = r.scalar() or 0

    r = await db.execute(
        select(func.count(User.id)).where(User.created_at >= week_ago)
    )
    new_users_this_week = r.scalar() or 0

    r = await db.execute(
        select(func.count(func.distinct(Workout.user_id))).where(
            Workout.date >= week_ago.date()
        )
    )
    active_users_this_week = r.scalar() or 0

    return AdminStatsOut(
        total_users=total_users,
        total_workouts=total_workouts,
        total_exercises=total_exercises,
        new_users_this_week=new_users_this_week,
        active_users_this_week=active_users_this_week,
    )


@router.get("/users", response_model=UserListOut)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    base = select(User)
    count_base = select(func.count(User.id))

    if search:
        filt = or_(User.username.ilike(f"%{search}%"), User.email.ilike(f"%{search}%"))
        base = base.where(filt)
        count_base = count_base.where(filt)

    # total count
    r = await db.execute(count_base)
    total = r.scalar() or 0

    # paginated users
    r = await db.execute(
        base.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    )
    users = r.scalars().all()

    items = []
    for u in users:
        r = await db.execute(
            select(func.count(Workout.id)).where(Workout.user_id == u.id)
        )
        workout_count = r.scalar() or 0

        r = await db.execute(
            select(func.count(Exercise.id)).where(Exercise.user_id == u.id)
        )
        exercise_count = r.scalar() or 0

        r = await db.execute(
            select(func.max(Workout.date)).where(Workout.user_id == u.id)
        )
        last_workout_date = r.scalar()

        items.append(
            UserAdminOut(
                id=u.id,
                username=u.username,
                email=u.email,
                is_admin=u.is_admin,
                created_at=u.created_at,
                workout_count=workout_count,
                exercise_count=exercise_count,
                last_workout_date=last_workout_date,
            )
        )

    return UserListOut(users=items, total=total, page=page, page_size=page_size)


@router.get("/users/{user_id}", response_model=UserAdminOut)
async def get_user_detail(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    r = await db.execute(select(User).where(User.id == user_id))
    u = r.scalar_one_or_none()
    if u is None:
        raise HTTPException(status_code=404, detail="User not found")

    r = await db.execute(
        select(func.count(Workout.id)).where(Workout.user_id == u.id)
    )
    workout_count = r.scalar() or 0

    r = await db.execute(
        select(func.count(Exercise.id)).where(Exercise.user_id == u.id)
    )
    exercise_count = r.scalar() or 0

    r = await db.execute(
        select(func.max(Workout.date)).where(Workout.user_id == u.id)
    )
    last_workout_date = r.scalar()

    return UserAdminOut(
        id=u.id,
        username=u.username,
        email=u.email,
        is_admin=u.is_admin,
        created_at=u.created_at,
        workout_count=workout_count,
        exercise_count=exercise_count,
        last_workout_date=last_workout_date,
    )


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    r = await db.execute(select(User).where(User.id == user_id))
    u = r.scalar_one_or_none()
    if u is None:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(u)
    await db.commit()
    return None


@router.put("/users/{user_id}/password", status_code=200)
async def reset_user_password(
    user_id: uuid.UUID,
    data: AdminResetPassword,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    r = await db.execute(select(User).where(User.id == user_id))
    u = r.scalar_one_or_none()
    if u is None:
        raise HTTPException(status_code=404, detail="User not found")

    u.hashed_password = hash_password(data.password)
    await db.commit()
    return {"detail": "Password updated"}
