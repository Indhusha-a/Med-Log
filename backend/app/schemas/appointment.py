# Request/response shapes for every appointment action: create, list/
# filter, reschedule, both cancel paths, and the doctor's resolve step.
# The business rules themselves (the 1-hour lock, slot booking, etc.)
# live in services/appointment_service.py - this file only shapes and
# validates the data going in and out.

from datetime import date, datetime

from pydantic import BaseModel, field_validator

from app.models.enums import AppointmentStatus, AppointmentType, CancelledBy
from app.schemas.doctor import DoctorOut
from app.schemas.patient import PatientOut
from app.schemas.time_slot import TimeSlotOut


class AppointmentCreateRequest(BaseModel):
    # What a patient sends to POST /appointments. Patient name/phone
    # aren't part of this - they come from whoever the JWT says is
    # calling, not from the request body, so there's no way to book an
    # appointment "as" someone else by just changing a field.
    doctor_id: int
    slot_id: int
    appointment_type: AppointmentType


class AppointmentRescheduleRequest(BaseModel):
    # What a patient sends to PATCH /appointments/{id} to move to a
    # different doctor and/or slot. Same doctor, different slot works
    # too - just pass the same doctor_id with a new slot_id.
    doctor_id: int
    slot_id: int


class AppointmentCancelRequest(BaseModel):
    # Doctor-initiated cancel only (POST /appointments/{id}/cancel) - a
    # patient's own cancel (DELETE /appointments/{id}) takes no body at
    # all, since the brief only requires a reason on the doctor side.
    reason: str

    @field_validator("reason")
    @classmethod
    def reason_min_length(cls, value: str) -> str:
        if len(value.strip()) < 10:
            raise ValueError("Cancellation reason must be at least 10 characters")
        return value


class AppointmentResolveRequest(BaseModel):
    # What a doctor sends to mark a past appointment as resolved. Reuses
    # AppointmentStatus rather than a separate enum, but restricts which
    # of its values are actually valid *here* - a doctor can't "resolve"
    # something to SCHEDULED or CANCELLED through this endpoint.
    status: AppointmentStatus

    @field_validator("status")
    @classmethod
    def allowed_resolution(cls, value: AppointmentStatus) -> AppointmentStatus:
        allowed = {
            AppointmentStatus.COMPLETED,
            AppointmentStatus.NO_SHOW,
            AppointmentStatus.NEEDS_RESCHEDULING,
        }
        if value not in allowed:
            raise ValueError("status must be one of completed, no_show, needs_rescheduling")
        return value


class AppointmentOut(BaseModel):
    # The full response shape for an appointment - nests the patient,
    # doctor, and slot it's attached to, so the frontend gets everything
    # it needs to render a card/row in one call instead of three.
    id: int
    appointment_type: AppointmentType
    status: AppointmentStatus
    cancelled_by: CancelledBy | None
    cancellation_reason: str | None
    created_at: datetime
    patient: PatientOut
    doctor: DoctorOut
    slot: TimeSlotOut

    model_config = {"from_attributes": True}


class AppointmentFilterParams(BaseModel):
    # Every field here is an optional query parameter on the two list
    # endpoints (GET /appointments/me and GET /appointments/doctor/mine) -
    # this is the "search or filter appointments" requirement from the
    # brief. FastAPI turns each field into its own ?query=param
    # automatically because it's passed as `= Depends()` in the router,
    # not because of anything special in this class itself.
    status: AppointmentStatus | None = None
    appointment_type: AppointmentType | None = None
    doctor_id: int | None = None
    date_from: date | None = None
    date_to: date | None = None
