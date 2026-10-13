# HTTP layer for the doctor directory, a doctor's own account, and
# looking up one doctor's open slots.

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_doctor, get_db
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorOut, DoctorUpdateRequest
from app.schemas.time_slot import TimeSlotOut
from app.services import doctor_service, slot_service

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("", response_model=list[DoctorOut])
def list_all_doctors(db: Session = Depends(get_db)):
    # Intentionally public (no auth dependency) - this is the dropdown
    # a patient sees before they've committed to anything, and there's
    # nothing sensitive in a doctor's public listing.
    return doctor_service.list_doctors(db)


@router.get("/me", response_model=DoctorOut)
def get_me(doctor: Doctor = Depends(get_current_doctor)):
    return doctor


@router.patch("/me", response_model=DoctorOut)
def update_me(
    data: DoctorUpdateRequest,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    # Name/password only - see schemas/doctor.py for why the request
    # body can't contain anything else.
    return doctor_service.update_doctor(db, doctor, data)


# NOTE: path param below is the doctor's internal numeric id (Doctor.id),
# not the login string Doctor.doctor_id. GET /doctors returns both so the
# frontend can show doctor_id to humans while using id for this call.
@router.get("/{doctor_id}/slots", response_model=list[TimeSlotOut])
def get_available_slots(doctor_id: int, on_date: date | None = None, db: Session = Depends(get_db)):
    # Also public - this is what fills in "available time-slots" after
    # a patient picks a doctor, before they've logged any intent to book.
    return slot_service.list_available_slots(db, doctor_id, on_date)
