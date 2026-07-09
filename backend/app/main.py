from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api import admin, auth, exercises, stats, workouts
from app.config import ADMIN_EMAIL
from app.database import AsyncSessionLocal, engine
from app.models.models import User

app = FastAPI(title="Strong Tracking - Fitness Tracker", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(exercises.router)
app.include_router(workouts.router)
app.include_router(stats.router)
app.include_router(admin.router)


@app.on_event("startup")
async def seed_admin():
    if not ADMIN_EMAIL:
        return
    async with AsyncSessionLocal() as db:
        r = await db.execute(select(User).where(User.email == ADMIN_EMAIL))
        user = r.scalar_one_or_none()
        if user and not user.is_admin:
            user.is_admin = True
            await db.commit()


@app.get("/api/health")
async def health():
    return {"status": "ok"}
