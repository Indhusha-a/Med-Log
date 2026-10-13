# Business logic for signup and login. Routers call these two functions
# and turn whatever ValueError they raise into the right HTTP status -
# nothing here knows about FastAPI or HTTP at all.

from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.admin import Admin
from app.models.doctor import Doctor
from app.models.enums import UserRole
from app.models.patient import Patient
from app.models.user import User
from app.schemas.auth import LoginRequest, PatientSignupRequest, TokenResponse


def signup_patient(db: Session, data: PatientSignupRequest) -> Patient:
    # Creates both rows a new patient needs: the base User (role +
    # password hash) and the Patient profile, sharing one id. db.flush()
    # between them pushes the INSERT for `user` so its auto-generated id
    # exists to hand to `patient` as its own primary key - without the
    # flush, user.id would still be None at that point.
    existing = db.query(Patient).filter(Patient.email == data.email).first()
    if existing is not None:
        raise ValueError("Email already registered")

    user = User(role=UserRole.PATIENT, password_hash=hash_password(data.password))
    db.add(user)
    db.flush()

    patient = Patient(
        id=user.id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def login(db: Session, data: LoginRequest) -> TokenResponse:
    # Looks the identifier up in a different table depending on which
    # role was claimed (email -> Patient, doctor_id -> Doctor, username
    # -> Admin), then verifies the password against that user's hash.
    # Deliberately returns the same "Invalid credentials" error whether
    # the identifier doesn't exist or the password is wrong - don't leak
    # which case it was.
    user = None
    if data.role == UserRole.PATIENT:
        row = db.query(Patient).filter(Patient.email == data.identifier).first()
        user = row.user if row else None
    elif data.role == UserRole.DOCTOR:
        row = db.query(Doctor).filter(Doctor.doctor_id == data.identifier).first()
        user = row.user if row else None
    elif data.role == UserRole.ADMIN:
        row = db.query(Admin).filter(Admin.username == data.identifier).first()
        user = row.user if row else None

    if user is None or not verify_password(data.password, user.password_hash):
        raise ValueError("Invalid credentials")

    token = create_access_token(user_id=user.id, role=user.role.value)
    return TokenResponse(access_token=token, role=user.role, user_id=user.id)
