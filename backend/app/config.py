import os

DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://fituser:fitpass@localhost:5432/fitdb")
SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
