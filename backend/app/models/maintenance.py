"""
SQLAlchemy ORM model for a Maintenance Record.
"""

from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from app.core.database import Base


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id          = Column(Integer, primary_key=True, index=True)
    site_id     = Column(Integer, ForeignKey("heritage_sites.id"), nullable=False, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status      = Column(String(50), nullable=False, default="Pending")  # Pending / In Progress / Completed
    priority    = Column(String(20), nullable=False, default="Medium")   # Low / Medium / High
    scheduled_date = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
