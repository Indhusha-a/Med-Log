# FastAPI dependencies: the glue that turns "a request came in with a
# Bearer token" into "here's the actual Patient/Doctor/Admin row, and I've
# already checked they're allowed to be here." Routers depend on these
# instead of re-implementing auth checks themselves.

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.admin import Admin
from app.models.doctor import Doctor
from app.models.enums import UserRole
from app.models.patient import Patient
from app.models.user import User

# tokenUrl is only used to populate Swagger's "Authorize" form — login itself
# is a plain POST /auth/login with a JSON body (see schemas/auth.py).
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_db():
    # One DB session per request. FastAPI calls this as a generator
    # dependency: everything before `yield` runs before the route handler,
    # everything after runs once the response is on its way out - so the
    # session always gets closed even if the handler raises.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    # Pulls the Bearer token off the request, decodes it, and loads the
    # User row it points at. This is the base building block every other
    # "who's calling" dependency below is built on.
    if token is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc

    user = db.get(User, int(payload["sub"]))
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


def require_role(*roles: UserRole):
    # A small dependency factory: require_role(UserRole.DOCTOR) returns a
    # dependency that 403s unless the caller's token role matches. Built
    # this way instead of one dependency per role so adding a new role
    # somewhere later doesn't mean writing a new near-identical function.
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Not allowed for this role")
        return user

    return dependency


def get_current_patient(
    user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> Patient:
    # What a patient-only route actually wants: not the generic User row,
    # but their Patient profile (name, email, phone). require_role has
    # already rejected anyone who isn't a patient by the time this runs.
    return db.get(Patient, user.id)


def get_current_doctor(
    user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
) -> Doctor:
    # Same idea as get_current_patient, for doctor-only routes.
    return db.get(Doctor, user.id)


def get_current_admin(
    user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> Admin:
    # Same idea again, for admin-only routes.
    return db.get(Admin, user.id)
