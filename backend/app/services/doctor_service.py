# Business logic for reading the doctor directory and a doctor editing
# their own (very limited) account fields.

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorUpdateRequest


def list_doctors(db: Session) -> list[Doctor]:
    # Backs the public GET /doctors endpoint - the dropdown a patient
    # picks a doctor from when booking. No filtering/pagination since
    # the brief doesn't call for it and the doctor list is small.
    return db.query(Doctor).all()


def update_doctor(db: Session, doctor: Doctor, data: DoctorUpdateRequest) -> Doctor:
    # Deliberately narrower than update_patient - only name and password
    # can change here, since DoctorUpdateRequest itself only has those
    # two fields (see schemas/doctor.py for why).
    if data.first_name is not None:
        doctor.first_name = data.first_name
    if data.last_name is not None:
        doctor.last_name = data.last_name
    if data.password is not None:
        doctor.user.password_hash = hash_password(data.password)

    db.commit()
    db.refresh(doctor)
    return doctor
