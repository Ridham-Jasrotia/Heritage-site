"""
Heritage Site service — all database interaction lives here, NOT in the route.
Routes call service functions; service functions call the ORM.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.heritage_site import HeritageSite
from app.schemas.heritage_site import HeritageSiteCreate, HeritageSiteUpdate


def get_all_sites(db: Session, skip: int = 0, limit: int = 100) -> List[HeritageSite]:
    return db.query(HeritageSite).offset(skip).limit(limit).all()


def get_site_by_id(db: Session, site_id: int) -> Optional[HeritageSite]:
    return db.query(HeritageSite).filter(HeritageSite.id == site_id).first()


def create_site(db: Session, payload: HeritageSiteCreate) -> HeritageSite:
    site = HeritageSite(**payload.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


def update_site(db: Session, site_id: int, payload: HeritageSiteUpdate) -> Optional[HeritageSite]:
    site = get_site_by_id(db, site_id)
    if not site:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(site, field, value)
    db.commit()
    db.refresh(site)
    return site


def delete_site(db: Session, site_id: int) -> bool:
    site = get_site_by_id(db, site_id)
    if not site:
        return False
    db.delete(site)
    db.commit()
    return True
