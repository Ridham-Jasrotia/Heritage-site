"""
SQLAlchemy ORM model for a Heritage Site.
Imports Base from core.database — never defines its own metadata.
"""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class HeritageSite(Base):
    __tablename__ = "heritage_sites"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(200), nullable=False, index=True)
    location    = Column(String(300), nullable=False)
    category    = Column(String(100), nullable=False)       # e.g. "UNESCO", "National"
    description = Column(Text, nullable=True)
    year_established = Column(Integer, nullable=True)
    significance     = Column(Text, nullable=True)
    image_url        = Column(String(500), nullable=True)
    latitude         = Column(Float, nullable=True)
    longitude        = Column(Float, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())
