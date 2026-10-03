"""
Routes for Maintenance Records.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from app.services import maintenance_service

router = APIRouter()


@router.get("/", response_model=List[MaintenanceResponse])
def list_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return maintenance_service.get_all_records(db, skip=skip, limit=limit)


@router.get("/site/{site_id}", response_model=List[MaintenanceResponse])
def list_records_by_site(site_id: int, db: Session = Depends(get_db)):
    return maintenance_service.get_records_by_site(db, site_id)


@router.get("/{record_id}", response_model=MaintenanceResponse)
def get_record(record_id: int, db: Session = Depends(get_db)):
    record = maintenance_service.get_record_by_id(db, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance record not found.")
    return record


@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_record(payload: MaintenanceCreate, db: Session = Depends(get_db)):
    return maintenance_service.create_record(db, payload)


@router.patch("/{record_id}", response_model=MaintenanceResponse)
def update_record(record_id: int, payload: MaintenanceUpdate, db: Session = Depends(get_db)):
    record = maintenance_service.update_record(db, record_id, payload)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance record not found.")
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: int, db: Session = Depends(get_db)):
    deleted = maintenance_service.delete_record(db, record_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance record not found.")
