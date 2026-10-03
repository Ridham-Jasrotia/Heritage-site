"""
Pydantic schemas for Maintenance Records.
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class MaintenanceBase(BaseModel):
    site_id:        int
    title:          str   = Field(..., min_length=2, max_length=200)
    description:    Optional[str]  = None
    status:         str   = Field(default="Pending")
    priority:       str   = Field(default="Medium")
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    title:          Optional[str]  = None
    description:    Optional[str]  = None
    status:         Optional[str]  = None
    priority:       Optional[str]  = None
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None


class MaintenanceResponse(MaintenanceBase):
    id:         int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
