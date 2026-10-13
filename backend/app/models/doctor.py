# A doctor's profile. Same id-shares-with-User pattern as Patient.
# Doctors are never self-signed-up - only created via the admin-only
# POST /admin/doctors endpoint (see services/admin_service.seed_doctor).

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    # This is the *login* identifier a doctor types in (e.g. "DOC001") -
    # deliberately a separate field from `id` above. `id` is what every
    # foreign key in the app points at; `doctor_id` is only ever shown to
    # humans and used at login.
    doctor_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(10), nullable=False)
    speciality: Mapped[str] = mapped_column(String(80), nullable=False)
    # Purely informational (shown in the doctor dropdown when booking) -
    # not used in any booking/cancellation business rule.
    consultation_rate: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)

    user: Mapped["User"] = relationship(back_populates="doctor")
    slots: Mapped[list["TimeSlot"]] = relationship(back_populates="doctor")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="doctor")
