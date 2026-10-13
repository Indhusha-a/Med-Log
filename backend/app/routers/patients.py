# HTTP layer for a patient managing their own account. Both routes rely
# on get_current_patient (core/deps.py) to identify "me" from the JWT -
# there's no way to view or edit anyone else's profile through this file.

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_patient, get_db
from app.models.patient import Patient
from app.schemas.patient import PatientOut, PatientUpdateRequest
from app.services import patient_service

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/me", response_model=PatientOut)
def get_me(patient: Patient = Depends(get_current_patient)):
    # get_current_patient has already done the lookup - this handler
    # has nothing left to do but hand it back.
    return patient


@router.patch("/me", response_model=PatientOut)
def update_me(
    data: PatientUpdateRequest,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    # Backs the "account info icon" edit screen from the brief.
    return patient_service.update_patient(db, patient, data)
