"""
Pydantic schemas for Visitor Records.
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class VisitorBase(BaseModel):
    site_id:       int
    visit_date:    date
    visitor_count: int  = Field(..., ge=0)
    visitor_type:  Optional[str] = None
    notes:         Optional[str] = None


class VisitorCreate(VisitorBase):
    pass


class VisitorUpdate(BaseModel):
    visit_date:    Optional[date] = None
    visitor_count: Optional[int]  = None
    visitor_type:  Optional[str]  = None
    notes:         Optional[str]  = None


class VisitorResponse(VisitorBase):
    id:         int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
