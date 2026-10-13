# A single bookable block of time on one doctor's calendar. A doctor
# creates these themselves (see services/slot_service.create_slot); a
# patient can only book one that already exists and has is_booked=False.

from datetime import date as date_
from datetime import time as time_

from sqlalchemy import Boolean, Date, ForeignKey, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"), nullable=False)
    # date/start_time/end_time are stored as plain local wall-clock values
    # with no timezone attached - see the big comment in
    # appointment_service._slot_datetime() for why that matters and what
    # goes wrong if you mix this up with a UTC-aware "now".
    date: Mapped[date_] = mapped_column(Date, nullable=False)
    start_time: Mapped[time_] = mapped_column(Time, nullable=False)
    end_time: Mapped[time_] = mapped_column(Time, nullable=False)
    # Flipped to True the moment a patient books this slot, and back to
    # False if that appointment is later cancelled/needs-rescheduled -
    # see appointment_service._lock_slot / _free_slot. This flag, not the
    # existence of an Appointment row, is what "available" actually means.
    is_booked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    doctor: Mapped["Doctor"] = relationship(back_populates="slots")
    # A list, not a single Appointment: a slot's history can include a
    # cancelled row and a later, separate booking once it's freed and
    # rebooked (see the comment on Appointment.slot_id for why this
    # isn't unique). Nothing in this codebase reads this reverse
    # relationship today, but it needs to be correct in shape regardless.
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="slot")
