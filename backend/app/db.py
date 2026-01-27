from __future__ import annotations

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    DATABASE_URL: str = "sqlite:///./funeral_homes_unified.db"


@lru_cache
def get_settings() -> Settings:
    return Settings()


def make_engine():
    settings = get_settings()
    # For SQLite with FastAPI (multiple threads), this is important
    connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
    return create_engine(settings.DATABASE_URL, connect_args=connect_args, future=True)


engine = make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
