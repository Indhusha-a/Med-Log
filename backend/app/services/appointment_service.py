# The core of the app: every rule governing what can happen to an
# appointment and when. This is where the brief's "cannot delete an
# appointment before one hour" constraint actually lives (not in the
# frontend, not in a router) - see _assert_outside_lock_window below.
# Routers call these functions and turn a raised ValueError into the
# right HTTP status; nothing here knows about FastAPI.

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus, CancelledBy
from app.models.time_slot import TimeSlot
from app.schemas.appointment import (
    AppointmentCreateRequest,
    AppointmentFilterParams,
    AppointmentRescheduleRequest,
)


def _slot_datetime(slot: TimeSlot) -> datetime:
    # TimeSlot.date/start_time are plain local wall-clock values - whoever
    # creates the slot (the doctor) picks a time without sending a timezone,
    # and the frontend never will either. Combine them as a NAIVE datetime
    # and compare against naive datetime.now() everywhere below. Tagging
    # this tzinfo=utc while comparing against real UTC "now" silently shifts
    # every lock-window check by the server's UTC offset - that's exactly
    # the bug this comment is here to stop someone reintroducing. (Found by
    # running an integration check on a UTC+5:30 machine: a slot 30 minutes
    # away was reading as ~6 hours away, so the 1-hour lock never fired.)
    return datetime.combine(slot.date, slot.start_time)


def _assert_outside_lock_window(slot: TimeSlot) -> None:
    # The shared gate behind every "can I still change this appointment"
    # check: cancel (both sides) and reschedule all call this before
    # touching anything. Raises instead of returning a bool so callers
    # can't forget to check the result.
    lock_deadline = _slot_datetime(slot) - timedelta(hours=settings.CANCEL_LOCK_HOURS)
    if datetime.now() >= lock_deadline:
        raise ValueError(
            f"This appointment can no longer be changed - it is within "
            f"{settings.CANCEL_LOCK_HOURS} hour(s) of its scheduled time"
        )


def _lock_slot(db: Session, slot: TimeSlot) -> None:
    # Marks a slot as taken. Raises if it's already booked instead of
    # silently overwriting - this is what actually prevents two patients
    # booking the same slot in a race, on top of the DB-level unique
    # constraint on Appointment.slot_id.
    if slot.is_booked:
        raise ValueError("This time slot is already booked")
    slot.is_booked = True
    db.add(slot)


def _free_slot(db: Session, slot: TimeSlot) -> None:
    # The opposite of _lock_slot - called whenever an appointment stops
    # occupying a slot: patient cancel, doctor cancel, a successful
    # reschedule (frees the *old* slot), and resolving to
    # needs-rescheduling (frees the slot so it can be rebooked).
    slot.is_booked = False
    db.add(slot)


def create_appointment(db: Session, patient_id: int, data: AppointmentCreateRequest) -> Appointment:
    # The booking flow: patient picks a doctor, then a slot that doctor
    # actually owns, then confirms. Both checks below exist because the
    # request could claim a slot_id that belongs to a different doctor,
    # or a slot that's technically in the past by the time the request
    # arrives - neither should be trusted just because the frontend
    # wouldn't normally offer them.
    slot = db.get(TimeSlot, data.slot_id)
    if slot is None or slot.doctor_id != data.doctor_id:
        raise ValueError("Selected slot does not belong to the selected doctor")
    if _slot_datetime(slot) <= datetime.now():
        raise ValueError("Cannot book a slot in the past")

    _lock_slot(db, slot)

    appointment = Appointment(
        patient_id=patient_id,
        doctor_id=data.doctor_id,
        slot_id=slot.id,
        appointment_type=data.appointment_type,
        status=AppointmentStatus.SCHEDULED,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def _filtered_query(db: Session, filters: AppointmentFilterParams):
    # Shared by both list endpoints below - builds up a query by only
    # adding a .filter() for whichever AppointmentFilterParams fields
    # were actually supplied. The join to TimeSlot is needed purely so
    # date_from/date_to can filter on the slot's date.
    query = db.query(Appointment).join(TimeSlot, Appointment.slot_id == TimeSlot.id)
    if filters.status is not None:
        query = query.filter(Appointment.status == filters.status)
    if filters.appointment_type is not None:
        query = query.filter(Appointment.appointment_type == filters.appointment_type)
    if filters.doctor_id is not None:
        query = query.filter(Appointment.doctor_id == filters.doctor_id)
    if filters.date_from is not None:
        query = query.filter(TimeSlot.date >= filters.date_from)
    if filters.date_to is not None:
        query = query.filter(TimeSlot.date <= filters.date_to)
    return query.order_by(TimeSlot.date, TimeSlot.start_time)


def list_patient_appointments(db: Session, patient_id: int, filters: AppointmentFilterParams) -> list[Appointment]:
    # Backs GET /appointments/me - a patient's own booked-appointments
    # view (plus whatever filters were passed in the query string).
    return _filtered_query(db, filters).filter(Appointment.patient_id == patient_id).all()


def list_doctor_appointments(db: Session, doctor_id: int, filters: AppointmentFilterParams) -> list[Appointment]:
    # Backs GET /appointments/doctor/mine - same idea, for a doctor
    # looking at their own appointments instead.
    return _filtered_query(db, filters).filter(Appointment.doctor_id == doctor_id).all()


def get_owned_appointment(db: Session, appointment_id: int, patient_id: int) -> Appointment:
    # Loads an appointment *and* checks the calling patient actually
    # owns it, in one step. Deliberately returns the same "not found"
    # error whether the id doesn't exist or belongs to someone else -
    # don't reveal that an appointment id is valid but just not theirs.
    appointment = db.get(Appointment, appointment_id)
    if appointment is None or appointment.patient_id != patient_id:
        raise ValueError("Appointment not found")
    return appointment


def get_doctor_appointment(db: Session, appointment_id: int, doctor_id: int) -> Appointment:
    # Same ownership check as get_owned_appointment, from the doctor's side.
    appointment = db.get(Appointment, appointment_id)
    if appointment is None or appointment.doctor_id != doctor_id:
        raise ValueError("Appointment not found")
    return appointment


def reschedule_appointment(db: Session, appointment: Appointment, data: AppointmentRescheduleRequest) -> Appointment:
    # Handles the "edit an appointment" requirement: change doctor
    # and/or slot. Two different starting states can land here -
    # a normal SCHEDULED appointment the patient is moving themselves
    # (which the 1-hour lock still applies to), or one the doctor has
    # already marked NEEDS_RESCHEDULING (where the lock doesn't apply,
    # since the original slot is already gone and there's nothing left
    # to protect by blocking the move).
    reschedulable = {AppointmentStatus.SCHEDULED, AppointmentStatus.NEEDS_RESCHEDULING}
    if appointment.status not in reschedulable:
        raise ValueError("Only scheduled or needs-rescheduling appointments can be changed")

    old_slot = appointment.slot
    if appointment.status == AppointmentStatus.SCHEDULED:
        _assert_outside_lock_window(old_slot)

    new_slot = db.get(TimeSlot, data.slot_id)
    if new_slot is None or new_slot.doctor_id != data.doctor_id:
        raise ValueError("Selected slot does not belong to the selected doctor")
    if _slot_datetime(new_slot) <= datetime.now():
        raise ValueError("Cannot book a slot in the past")

    # Claim the new slot before releasing the old one, so a failure in
    # between never leaves the appointment with no slot booked at all.
    _lock_slot(db, new_slot)
    _free_slot(db, old_slot)

    appointment.doctor_id = data.doctor_id
    appointment.slot_id = new_slot.id
    appointment.status = AppointmentStatus.SCHEDULED
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def patient_cancel_appointment(db: Session, appointment: Appointment) -> Appointment:
    # The patient-side "delete an appointment" action. This is a soft
    # delete, not a row removal - status flips to CANCELLED so it still
    # shows up in the patient's history - deliberately, so cancelling
    # isn't indistinguishable from the appointment never having existed.
    if appointment.status != AppointmentStatus.SCHEDULED:
        raise ValueError("Only scheduled appointments can be cancelled")
    _assert_outside_lock_window(appointment.slot)

    _free_slot(db, appointment.slot)
    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_by = CancelledBy.PATIENT
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def doctor_cancel_appointment(db: Session, appointment: Appointment, reason: str) -> Appointment:
    # Same shape as patient_cancel_appointment, but requires a reason -
    # already validated as 10+ characters by
    # AppointmentCancelRequest before it ever reaches this function.
    if appointment.status != AppointmentStatus.SCHEDULED:
        raise ValueError("Only scheduled appointments can be cancelled")
    _assert_outside_lock_window(appointment.slot)

    _free_slot(db, appointment.slot)
    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_by = CancelledBy.DOCTOR
    appointment.cancellation_reason = reason
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def resolve_appointment(db: Session, appointment: Appointment, new_status: AppointmentStatus) -> Appointment:
    # The "what actually happened" step a doctor does after an
    # appointment's time has passed: mark it Completed, No-show, or
    # Needs Rescheduling. Deliberately manual rather than an automatic
    # status flip on a timer - only the doctor actually knows whether
    # the patient showed up.
    if appointment.status != AppointmentStatus.SCHEDULED:
        raise ValueError("Only scheduled appointments can be resolved")
    if _slot_datetime(appointment.slot) > datetime.now():
        raise ValueError("This appointment's time has not passed yet")

    if new_status == AppointmentStatus.NEEDS_RESCHEDULING:
        # The appointment didn't happen, so the slot it was holding
        # should go back to being bookable - by this doctor or another.
        _free_slot(db, appointment.slot)

    appointment.status = new_status
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment
