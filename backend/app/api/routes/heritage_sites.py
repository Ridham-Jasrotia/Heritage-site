"""
Routes for Heritage Sites.
Routes are thin: validate input → call service → return response.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.heritage_site import HeritageSiteCreate, HeritageSiteUpdate, HeritageSiteResponse
from app.services import heritage_site_service

router = APIRouter()


@router.get("/", response_model=List[HeritageSiteResponse])
def list_sites(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Return all heritage sites."""
    return heritage_site_service.get_all_sites(db, skip=skip, limit=limit)


@router.get("/{site_id}", response_model=HeritageSiteResponse)
def get_site(site_id: int, db: Session = Depends(get_db)):
    """Return a single heritage site by ID."""
    site = heritage_site_service.get_site_by_id(db, site_id)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Heritage site not found.")
    return site


@router.post("/", response_model=HeritageSiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(payload: HeritageSiteCreate, db: Session = Depends(get_db)):
    """Create a new heritage site."""
    return heritage_site_service.create_site(db, payload)


@router.patch("/{site_id}", response_model=HeritageSiteResponse)
def update_site(site_id: int, payload: HeritageSiteUpdate, db: Session = Depends(get_db)):
    """Partially update a heritage site."""
    site = heritage_site_service.update_site(db, site_id, payload)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Heritage site not found.")
    return site


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(site_id: int, db: Session = Depends(get_db)):
    """Delete a heritage site."""
    deleted = heritage_site_service.delete_site(db, site_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Heritage site not found.")
