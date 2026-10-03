"""
Visitor service — database logic for visitor records.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.visitor import VisitorRecord
from app.schemas.visitor import VisitorCreate, VisitorUpdate


def get_all_records(db: Session, skip: int = 0, limit: int = 100) -> List[VisitorRecord]:
    return db.query(VisitorRecord).offset(skip).limit(limit).all()


def get_records_by_site(db: Session, site_id: int) -> List[VisitorRecord]:
    return db.query(VisitorRecord).filter(VisitorRecord.site_id == site_id).all()


def get_record_by_id(db: Session, record_id: int) -> Optional[VisitorRecord]:
    return db.query(VisitorRecord).filter(VisitorRecord.id == record_id).first()


def create_record(db: Session, payload: VisitorCreate) -> VisitorRecord:
    record = VisitorRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_record(db: Session, record_id: int, payload: VisitorUpdate) -> Optional[VisitorRecord]:
    record = get_record_by_id(db, record_id)
    if not record:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


def delete_record(db: Session, record_id: int) -> bool:
    record = get_record_by_id(db, record_id)
    if not record:
        return False
    db.delete(record)
    db.commit()
    return True
