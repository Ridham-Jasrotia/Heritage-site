"""
SQLAlchemy ORM model for a Visitor Record.
"""

from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from app.core.database import Base


class VisitorRecord(Base):
    __tablename__ = "visitor_records"

    id          = Column(Integer, primary_key=True, index=True)
    site_id     = Column(Integer, ForeignKey("heritage_sites.id"), nullable=False, index=True)
    visit_date  = Column(Date, nullable=False)
    visitor_count = Column(Integer, nullable=False, default=0)
    visitor_type  = Column(String(100), nullable=True)    # e.g. Domestic / Foreign / Student
    notes         = Column(String(500), nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
