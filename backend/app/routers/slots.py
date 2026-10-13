# HTTP layer for a doctor managing their own calendar.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_doctor, get_db
from app.models.doctor import Doctor
from app.schemas.time_slot import TimeSlotCreateRequest, TimeSlotOut
from app.services import slot_service

router = APIRouter(prefix="/slots", tags=["slots"])


@router.post("", response_model=TimeSlotOut, status_code=status.HTTP_201_CREATED)
def create_slot(
    data: TimeSlotCreateRequest,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    # Doctor-only - this is the "clock/calendar UI" feature from the
    # brief where a doctor adds their own availability. doctor.id comes
    # from the JWT via get_current_doctor, never from the request body,
    # so a doctor can only ever create slots on their own calendar.
    try:
        return slot_service.create_slot(db, doctor.id, data)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
