# The actual booking that ties a patient to a doctor's slot. This is the
# row every CRUD endpoint in the brief (create/view/edit/delete/search)
# ultimately operates on - see services/appointment_service.py for every
# rule governing what can happen to one of these and when.

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import AppointmentStatus, AppointmentType, CancelledBy


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"), nullable=False)
    # NOT unique, deliberately: a slot's history can include more than one
    # Appointment row over time (e.g. one CANCELLED row, then a later
    # SCHEDULED row once the slot is freed and rebooked by someone else).
    # A unique constraint here blocked exactly that - any attempt to
    # rebook a previously-cancelled slot 500'd on a DB constraint
    # violation, because the old cancelled row still held the slot_id.
    # "At most one ACTIVE appointment per slot" is enforced where it
    # actually belongs: appointment_service._lock_slot checks
    # TimeSlot.is_booked before ever creating a new row.
    slot_id: Mapped[int] = mapped_column(ForeignKey("time_slots.id"), nullable=False)
    appointment_type: Mapped[AppointmentType] = mapped_column(
        SAEnum(AppointmentType, name="appointment_type"), nullable=False
    )
    status: Mapped[AppointmentStatus] = mapped_column(
        SAEnum(AppointmentStatus, name="appointment_status"),
        default=AppointmentStatus.SCHEDULED,
        nullable=False,
    )
    # Only set when status becomes CANCELLED - tells you which side
    # cancelled it. Null for every other status.
    cancelled_by: Mapped[CancelledBy | None] = mapped_column(SAEnum(CancelledBy, name="cancelled_by"), nullable=True)
    # Only set (and only ever required) on a doctor-initiated cancel -
    # schemas/appointment.py enforces the 10-character minimum before
    # this ever reaches the database.
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    patient: Mapped["Patient"] = relationship(back_populates="appointments")
    doctor: Mapped["Doctor"] = relationship(back_populates="appointments")
    slot: Mapped["TimeSlot"] = relationship(back_populates="appointments")
