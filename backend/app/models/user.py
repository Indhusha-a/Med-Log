# The base account table. Every login (patient, doctor, admin) is a row
# here first - this is what holds the password hash and the role, and
# every profile table below hangs its real-world details off this via a
# shared primary key (Patient.id/Doctor.id/Admin.id == User.id).

from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, name="user_role"), nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Exactly one of these three will actually have a row, matching
    # `role` above - a patient User never gets a Doctor profile, etc.
    # cascade="all, delete-orphan" means deleting a User cleans up its
    # one profile row too, so nothing's ever left pointing at a dead id.
    patient: Mapped["Patient"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor: Mapped["Doctor"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin: Mapped["Admin"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
