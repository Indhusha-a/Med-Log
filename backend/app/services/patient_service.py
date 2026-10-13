# Business logic for a patient editing their own account.

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.patient import Patient
from app.schemas.patient import PatientUpdateRequest


def update_patient(db: Session, patient: Patient, data: PatientUpdateRequest) -> Patient:
    # Only touches the fields that were actually sent - everything in
    # PatientUpdateRequest defaults to None, so "not provided" and
    # "explicitly cleared" are indistinguishable here. Fine for this
    # app (nobody needs to blank out their own name), just worth knowing.
    if data.first_name is not None:
        patient.first_name = data.first_name
    if data.last_name is not None:
        patient.last_name = data.last_name
    if data.phone is not None:
        patient.phone = data.phone
    if data.password is not None:
        # Password lives on the related User row, not on Patient itself.
        patient.user.password_hash = hash_password(data.password)

    db.commit()
    db.refresh(patient)
    return patient
