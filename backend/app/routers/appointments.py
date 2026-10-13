# HTTP layer for every appointment action - the busiest router in the
# app, split into a patient-facing half and a doctor-facing half. Every
# handler here just loads the right appointment (via get_owned_appointment/
# get_doctor_appointment, which also double as the ownership check) and
# hands off to appointment_service for the actual rule enforcement.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_doctor, get_current_patient, get_db
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.schemas.appointment import (
    AppointmentCancelRequest,
    AppointmentCreateRequest,
    AppointmentFilterParams,
    AppointmentOut,
    AppointmentRescheduleRequest,
    AppointmentResolveRequest,
)
from app.services import appointment_service

router = APIRouter(prefix="/appointments", tags=["appointments"])


# ---- patient-facing ----

@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(
    data: AppointmentCreateRequest,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    # The "confirm" step at the end of the booking flow.
    try:
        return appointment_service.create_appointment(db, patient.id, data)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.get("/me", response_model=list[AppointmentOut])
def list_my_appointments(
    filters: AppointmentFilterParams = Depends(),
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    # Backs both "upcoming appointments" on the dashboard and the full
    # "booked-appointments" page - the frontend decides which subset to
    # show by passing (or not passing) filters like status=scheduled.
    return appointment_service.list_patient_appointments(db, patient.id, filters)


@router.patch("/{appointment_id}", response_model=AppointmentOut)
def reschedule_my_appointment(
    appointment_id: int,
    data: AppointmentRescheduleRequest,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    # The "edit an appointment" / "change doctor" action, subject to
    # the 1-hour lock inside appointment_service.reschedule_appointment.
    try:
        appointment = appointment_service.get_owned_appointment(db, appointment_id, patient.id)
        return appointment_service.reschedule_appointment(db, appointment, data)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.delete("/{appointment_id}", response_model=AppointmentOut)
def cancel_my_appointment(
    appointment_id: int,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    # The "delete an appointment" requirement - implemented as a soft
    # delete (status -> cancelled), see
    # appointment_service.patient_cancel_appointment for why.
    try:
        appointment = appointment_service.get_owned_appointment(db, appointment_id, patient.id)
        return appointment_service.patient_cancel_appointment(db, appointment)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


# ---- doctor-facing ----

@router.get("/doctor/mine", response_model=list[AppointmentOut])
def list_doctor_appointments(
    filters: AppointmentFilterParams = Depends(),
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    # Backs the doctor's "today's appointments" dashboard view and the
    # full "all appointments" page, same filtering pattern as
    # list_my_appointments above.
    return appointment_service.list_doctor_appointments(db, doctor.id, filters)


@router.post("/{appointment_id}/cancel", response_model=AppointmentOut)
def doctor_cancel_appointment(
    appointment_id: int,
    data: AppointmentCancelRequest,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    # Doctor-initiated cancel, with a mandatory reason - already
    # checked to be 10+ characters by AppointmentCancelRequest before
    # this handler ever runs.
    try:
        appointment = appointment_service.get_doctor_appointment(db, appointment_id, doctor.id)
        return appointment_service.doctor_cancel_appointment(db, appointment, data.reason)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.post("/{appointment_id}/resolve", response_model=AppointmentOut)
def resolve_appointment(
    appointment_id: int,
    data: AppointmentResolveRequest,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    # The "mark this past appointment as..." step - completed, no-show,
    # or needs-rescheduling. Only valid once the slot's time has passed;
    # see appointment_service.resolve_appointment for that check.
    try:
        appointment = appointment_service.get_doctor_appointment(db, appointment_id, doctor.id)
        return appointment_service.resolve_appointment(db, appointment, data.status)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
