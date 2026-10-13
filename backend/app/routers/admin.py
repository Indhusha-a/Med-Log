# HTTP layer for the admin dashboard: seeding doctors, listing users,
# and a system health check. Every route here requires an admin token -
# there's no public or self-service path to any of this.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.admin import Admin
from app.models.enums import UserRole
from app.schemas.doctor import DoctorCreateRequest, DoctorOut
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/doctors", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
def seed_doctor(
    data: DoctorCreateRequest,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    # The brief's "seed doctor accounts" requirement - this is the only
    # way a Doctor account gets created while the app is actually running.
    try:
        return admin_service.seed_doctor(db, data)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.get("/users")
def list_users(
    role: UserRole | None = None,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    # The brief's "check all available users" requirement, filterable
    # by ?role=patient or ?role=doctor. Returns bare id+role rather than
    # a full profile - good enough for an admin list view without
    # pulling in a PatientOut/DoctorOut just for this.
    users = admin_service.list_users(db, role)
    return [{"id": u.id, "role": u.role} for u in users]


@router.get("/health")
def health(admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    # The brief's "monitor system health" requirement, kept intentionally
    # small - confirms the API process is up and the DB is reachable.
    return admin_service.health_check(db)
