from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Auth ──
class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    username: str
    email: str
    is_admin: bool
    created_at: datetime


# ── Exercise ──
class ExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=50)
    description: str | None = None


class ExerciseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    category: str
    description: str | None
    user_id: uuid.UUID | None


# ── Workout Set ──
class WorkoutSetCreate(BaseModel):
    exercise_id: uuid.UUID
    set_number: int = Field(ge=1)
    weight_kg: float = Field(ge=0)
    reps: int = Field(ge=0)


class WorkoutSetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    exercise_id: uuid.UUID
    exercise_name: str | None = None
    set_number: int
    weight_kg: float
    reps: int


# ── Workout ──
class WorkoutCreate(BaseModel):
    date: date
    notes: str | None = None
    duration_minutes: int | None = None
    sets: list[WorkoutSetCreate]


class WorkoutUpdate(BaseModel):
    date: Optional[date] = None
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None
    sets: Optional[list[WorkoutSetCreate]] = None


class WorkoutOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    date: date
    notes: str | None
    duration_minutes: int | None
    created_at: datetime
    sets: list[WorkoutSetOut] = []


class WorkoutListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    date: date
    notes: str | None
    duration_minutes: int | None
    exercise_count: int = 0  # calculated


# ── Stats ──
class ProgressPoint(BaseModel):
    date: date
    max_weight: float  # max weight lifted that day
    avg_weight: float  # avg weight across all sets that day


class HeatmapPoint(BaseModel):
    date: date
    count: int  # number of workouts that day


class ExercisePR(BaseModel):
    exercise_id: uuid.UUID
    exercise_name: str
    max_weight: float
    max_weight_date: date


class OverviewOut(BaseModel):
    total_workouts: int
    current_streak: int
    longest_streak: int
    exercise_prs: list[ExercisePR]


# ── Admin ──
class UserAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    username: str
    email: str
    is_admin: bool
    created_at: datetime
    workout_count: int = 0
    exercise_count: int = 0
    last_workout_date: date | None = None


class UserListOut(BaseModel):
    users: list[UserAdminOut]
    total: int
    page: int
    page_size: int


class AdminStatsOut(BaseModel):
    total_users: int
    total_workouts: int
    total_exercises: int
    new_users_this_week: int
    active_users_this_week: int


class AdminResetPassword(BaseModel):
    password: str = Field(min_length=6, max_length=128)
