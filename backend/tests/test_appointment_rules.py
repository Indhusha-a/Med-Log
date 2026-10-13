# Tests for the two rules most worth pinning down with an automated
# test rather than trusting the UI to "look" correct: double-booking
# and the 1-hour cancellation lock. Everything here goes straight at
# appointment_service, skipping HTTP entirely, since these are rules
# about data, not about routing.

from datetime import datetime, timedelta

import pytest

from app.core.security import hash_password
from app.models.doctor import Doctor
from app.models.enums import AppointmentType, UserRole
from app.models.patient import Patient
from app.models.time_slot import TimeSlot
from app.models.user import User
from app.schemas.appointment import AppointmentCreateRequest
from app.services import appointment_service


def _make_patient(db):
    # Minimal valid patient for a test to book an appointment as.
    user = User(role=UserRole.PATIENT, password_hash=hash_password("Pass#123"))
    db.add(user)
    db.flush()
    patient = Patient(id=user.id, first_name="Jane", last_name="Doe", email="jane@test.com", phone="0711234567")
    db.add(patient)
    db.commit()
    return patient


def _make_doctor(db):
    # Minimal valid doctor for a test to book an appointment with.
    user = User(role=UserRole.DOCTOR, password_hash=hash_password("Doc#123"))
    db.add(user)
    db.flush()
    doctor = Doctor(
        id=user.id, doctor_id="DOC01", first_name="Amara", last_name="Fernando",
        email="amara@test.com", phone="0722222222", speciality="General Medicine",
        consultation_rate=35.00,
    )
    db.add(doctor)
    db.commit()
    return doctor


def _make_future_slot(db, doctor, hours_ahead=5):
    # Builds a slot `hours_ahead` from right now. Uses local datetime.now()
    # deliberately, to match appointment_service._slot_datetime() - using
    # utcnow() here instead would make every "hours from now" slot wrong
    # by the machine's UTC offset, and silently break every test below on
    # anything other than a UTC+0 machine.
    target = datetime.now() + timedelta(hours=hours_ahead)
    slot = TimeSlot(
        doctor_id=doctor.id,
        date=target.date(),
        start_time=target.time().replace(microsecond=0),
        end_time=(target + timedelta(minutes=30)).time().replace(microsecond=0),
    )
    db.add(slot)
    db.commit()
    return slot


def test_create_appointment_books_the_slot(db_session):
    # The happy path: booking a future slot succeeds and flips
    # is_booked to True.
    patient = _make_patient(db_session)
    doctor = _make_doctor(db_session)
    slot = _make_future_slot(db_session, doctor)

    appointment = appointment_service.create_appointment(
        db_session, patient.id,
        AppointmentCreateRequest(doctor_id=doctor.id, slot_id=slot.id, appointment_type=AppointmentType.CONSULTATION),
    )

    assert appointment.id is not None
    db_session.refresh(slot)
    assert slot.is_booked is True


def test_cannot_double_book_the_same_slot(db_session):
    # Once a slot is taken, a second booking attempt against the same
    # slot_id must fail - this is _lock_slot's job.
    patient = _make_patient(db_session)
    doctor = _make_doctor(db_session)
    slot = _make_future_slot(db_session, doctor)
    appointment_service.create_appointment(
        db_session, patient.id,
        AppointmentCreateRequest(doctor_id=doctor.id, slot_id=slot.id, appointment_type=AppointmentType.CONSULTATION),
    )

    with pytest.raises(ValueError):
        appointment_service.create_appointment(
            db_session, patient.id,
            AppointmentCreateRequest(doctor_id=doctor.id, slot_id=slot.id, appointment_type=AppointmentType.FOLLOW_UP),
        )


def test_cannot_cancel_within_one_hour_of_appointment(db_session):
    # The brief's core constraint: an appointment 30 minutes out is
    # inside the 1-hour lock, so cancelling it must be rejected. This
    # is the test that would have caught the UTC/local timezone bug
    # described in appointment_service._slot_datetime() if it had
    # existed when that bug was introduced.
    patient = _make_patient(db_session)
    doctor = _make_doctor(db_session)
    slot = _make_future_slot(db_session, doctor, hours_ahead=0.5)
    appointment = appointment_service.create_appointment(
        db_session, patient.id,
        AppointmentCreateRequest(doctor_id=doctor.id, slot_id=slot.id, appointment_type=AppointmentType.CONSULTATION),
    )

    with pytest.raises(ValueError):
        appointment_service.patient_cancel_appointment(db_session, appointment)


def test_can_cancel_when_outside_one_hour_window(db_session):
    # The other side of the same rule: an appointment 5 hours out is
    # safely outside the lock, so cancelling it must succeed and free
    # the slot back up.
    patient = _make_patient(db_session)
    doctor = _make_doctor(db_session)
    slot = _make_future_slot(db_session, doctor, hours_ahead=5)
    appointment = appointment_service.create_appointment(
        db_session, patient.id,
        AppointmentCreateRequest(doctor_id=doctor.id, slot_id=slot.id, appointment_type=AppointmentType.CONSULTATION),
    )

    cancelled = appointment_service.patient_cancel_appointment(db_session, appointment)
    assert cancelled.status.value == "cancelled"
    db_session.refresh(slot)
    assert slot.is_booked is False
