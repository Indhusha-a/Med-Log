# Business logic behind the admin-only endpoints: seeding a doctor
# account, listing users, and a basic health check.

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.doctor import Doctor
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.doctor import DoctorCreateRequest


def seed_doctor(db: Session, data: DoctorCreateRequest) -> Doctor:
    # This is the only way a Doctor account ever gets created through
    # the running app (app/seed.py does the same thing for the two
    # sample doctors, but as a one-off script, not through this API).
    # Same User-then-Patient-shaped-profile pattern as
    # auth_service.signup_patient.
    existing = db.query(Doctor).filter(Doctor.doctor_id == data.doctor_id).first()
    if existing is not None:
        raise ValueError("A doctor with this doctor_id already exists")

    user = User(role=UserRole.DOCTOR, password_hash=hash_password(data.password))
    db.add(user)
    db.flush()

    doctor = Doctor(
        id=user.id,
        doctor_id=data.doctor_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        speciality=data.speciality,
        consultation_rate=data.consultation_rate,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


def list_users(db: Session, role: UserRole | None = None) -> list[User]:
    # Backs GET /admin/users?role=... - the "check all available users,
    # filter using patients, doctors" requirement from the brief.
    # role=None (no filter) returns everyone across all three roles.
    query = db.query(User)
    if role is not None:
        query = query.filter(User.role == role)
    return query.all()


def health_check(db: Session) -> dict:
    # Deliberately minimal: if this query doesn't raise, the DB
    # connection is alive. `select(1)` is the standard "can I talk to
    # the database at all" probe - no real table involved.
    db.execute(select(1))
    return {"status": "ok", "database": "ok"}
