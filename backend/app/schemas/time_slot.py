# Request/response shapes for a doctor's bookable time slots.

from datetime import date, time

from pydantic import BaseModel, field_validator


class TimeSlotCreateRequest(BaseModel):
    # What a doctor sends to POST /slots. The overlap check against
    # that doctor's other slots happens in slot_service.create_slot,
    # not here - this schema only validates the shape of one slot on
    # its own (end after start).
    date: date
    start_time: time
    end_time: time

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, value, info):
        start = info.data.get("start_time")
        if start is not None and value <= start:
            raise ValueError("end_time must be after start_time")
        return value


class TimeSlotOut(BaseModel):
    # What a slot looks like in a response - includes is_booked so the
    # frontend can grey out/hide slots that are already taken, even
    # though GET /doctors/{id}/slots already filters those out server-side.
    id: int
    doctor_id: int
    date: date
    start_time: time
    end_time: time
    is_booked: bool

    model_config = {"from_attributes": True}
