# An admin's profile. Deliberately the thinnest of the three - admins
# only need a login name, since this app has no admin signup page at
# all; admins are seeded directly (see app/seed.py).

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    user: Mapped["User"] = relationship(back_populates="admin")
