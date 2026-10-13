# The fixed value sets used across the app's models and schemas. Kept in
# one file so a reviewer (or future-you) can see every allowed status/type
# value in one place instead of hunting through each model.

import enum


class UserRole(str, enum.Enum):
    # Which of the three account types a User row is. Decides which
    # profile table (Patient/Doctor/Admin) has a matching row, and which
    # login identifier (email/doctor_id/username) applies - see
    # services/auth_service.login().
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class AppointmentType(str, enum.Enum):
    # What kind of visit this is. The assessment brief didn't specify a
    # fixed list, so this one was picked deliberately rather than left
    # as a free-text field a patient could type anything into.
    CONSULTATION = "consultation"
    FOLLOW_UP = "follow_up"
    ROUTINE_CHECKUP = "routine_checkup"
    LAB_REVIEW = "lab_review"
    EMERGENCY = "emergency"


class AppointmentStatus(str, enum.Enum):
    # Where an appointment is in its lifecycle. SCHEDULED is the only
    # state a patient can still cancel/reschedule out of. Once its time
    # has passed, a doctor manually resolves it to one of the other three
    # (see appointment_service.resolve_appointment) - nothing flips this
    # automatically on a timer.
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"
    NEEDS_RESCHEDULING = "needs_rescheduling"
    CANCELLED = "cancelled"


class CancelledBy(str, enum.Enum):
    # Only set once an appointment's status is CANCELLED - records which
    # side cancelled it, since a doctor cancellation also carries a
    # required reason and a patient cancellation doesn't.
    PATIENT = "patient"
    DOCTOR = "doctor"
