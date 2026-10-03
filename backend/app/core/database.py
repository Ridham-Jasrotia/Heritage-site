"""
Database configuration — engine, session factory, and declarative Base.
All models must import Base from here to be picked up by metadata.create_all().
"""

from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Resolve the database path relative to this file so it always lands at
# backend/heritage_site.db regardless of the working directory uvicorn
# is launched from.
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent  # …/backend/
_DB_PATH     = _BACKEND_DIR / "heritage_site.db"

DATABASE_URL = f"sqlite:///{_DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite + FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


# ---------------------------------------------------------------------------
# Dependency — yields a DB session and guarantees it is closed after use
# ---------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
