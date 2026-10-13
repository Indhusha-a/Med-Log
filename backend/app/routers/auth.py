# HTTP layer for signup and login - the only two endpoints in the app
# that don't require a token, since their whole job is to produce one
# (or create the account that will log in later).

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.schemas.auth import LoginRequest, PatientSignupRequest, TokenResponse
from app.schemas.patient import PatientOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def signup(data: PatientSignupRequest, db: Session = Depends(get_db)):
    # Patient self-signup only - there is no doctor or admin equivalent
    # of this endpoint anywhere in the app.
    try:
        return auth_service.signup_patient(db, data)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # One endpoint for all three roles - `data.role` tells
    # auth_service.login which table to check `identifier` against.
    try:
        return auth_service.login(db, data)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc
