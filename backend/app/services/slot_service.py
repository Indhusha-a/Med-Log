# Business logic for a doctor's own calendar: creating new bookable
# slots and listing the ones still open.

from datetime import date as date_

from sqlalchemy.orm import Session

from app.models.time_slot import TimeSlot
from app.schemas.time_slot import TimeSlotCreateRequest


def create_slot(db: Session, doctor_id: int, data: TimeSlotCreateRequest) -> TimeSlot:
    # Rejects a new slot that overlaps any existing slot for the same
    # doctor on the same day. The condition is the standard "two ranges
    # overlap" check (new.start < existing.end AND new.end > existing.start) -
    # written the way it is so it also catches a slot fully inside
    # another one, not just a partial overlap at one edge.
    overlap = (
        db.query(TimeSlot)
        .filter(
            TimeSlot.doctor_id == doctor_id,
            TimeSlot.date == data.date,
            TimeSlot.start_time < data.end_time,
            TimeSlot.end_time > data.start_time,
        )
        .first()
    )
    if overlap is not None:
        raise ValueError("This slot overlaps with an existing slot for this doctor")

    slot = TimeSlot(
        doctor_id=doctor_id,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


def list_available_slots(db: Session, doctor_id: int, on_date: date_ | None = None) -> list[TimeSlot]:
    # Backs GET /doctors/{id}/slots - what a patient sees once they've
    # picked a doctor. Only returns slots that are still open
    # (is_booked=False); a booked slot simply doesn't show up here,
    # rather than showing up disabled.
    query = db.query(TimeSlot).filter(TimeSlot.doctor_id == doctor_id, TimeSlot.is_booked.is_(False))
    if on_date is not None:
        query = query.filter(TimeSlot.date == on_date)
    return query.order_by(TimeSlot.date, TimeSlot.start_time).all()
