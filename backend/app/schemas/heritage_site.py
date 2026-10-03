"""
Pydantic schemas for Heritage Site — completely separate from the ORM model.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class HeritageSiteBase(BaseModel):
    name:             str = Field(..., min_length=2, max_length=200)
    location:         str = Field(..., min_length=2, max_length=300)
    category:         str = Field(..., min_length=2, max_length=100)
    description:      Optional[str]  = None
    year_established: Optional[int]  = None
    significance:     Optional[str]  = None
    image_url:        Optional[str]  = None
    latitude:         Optional[float] = None
    longitude:        Optional[float] = None


class HeritageSiteCreate(HeritageSiteBase):
    """Schema used when creating a new site (POST body)."""
    pass


class HeritageSiteUpdate(BaseModel):
    """Schema used when partially updating a site (PATCH body)."""
    name:             Optional[str]   = None
    location:         Optional[str]   = None
    category:         Optional[str]   = None
    description:      Optional[str]   = None
    year_established: Optional[int]   = None
    significance:     Optional[str]   = None
    image_url:        Optional[str]   = None
    latitude:         Optional[float] = None
    longitude:        Optional[float] = None


class HeritageSiteResponse(HeritageSiteBase):
    """Schema returned to the client."""
    id:         int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
