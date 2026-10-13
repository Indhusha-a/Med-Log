# A patient's profile - the human-facing details that sit alongside
# their User row. id is a foreign key to users.id, not an independent
# auto-increment, so a Patient and its User always share one id.

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    # Email is how a patient logs in (see auth_service.login), so it has
    # to be unique - two patients can't share one.
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(10), nullable=False)

    user: Mapped["User"] = relationship(back_populates="patient")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="patient")
