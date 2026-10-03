"""
Routes for Visitor Records.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.visitor import VisitorCreate, VisitorUpdate, VisitorResponse
from app.services import visitor_service

router = APIRouter()


@router.get("/", response_model=List[VisitorResponse])
def list_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return visitor_service.get_all_records(db, skip=skip, limit=limit)


@router.get("/site/{site_id}", response_model=List[VisitorResponse])
def list_records_by_site(site_id: int, db: Session = Depends(get_db)):
    return visitor_service.get_records_by_site(db, site_id)


@router.get("/{record_id}", response_model=VisitorResponse)
def get_record(record_id: int, db: Session = Depends(get_db)):
    record = visitor_service.get_record_by_id(db, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor record not found.")
    return record


@router.post("/", response_model=VisitorResponse, status_code=status.HTTP_201_CREATED)
def create_record(payload: VisitorCreate, db: Session = Depends(get_db)):
    return visitor_service.create_record(db, payload)


@router.patch("/{record_id}", response_model=VisitorResponse)
def update_record(record_id: int, payload: VisitorUpdate, db: Session = Depends(get_db)):
    record = visitor_service.update_record(db, record_id, payload)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor record not found.")
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: int, db: Session = Depends(get_db)):
    deleted = visitor_service.delete_record(db, record_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor record not found.")
