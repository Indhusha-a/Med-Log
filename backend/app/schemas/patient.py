# Request/response shapes for a patient's own profile (GET/PATCH /patients/me).

from pydantic import BaseModel, EmailStr, field_validator

from app.schemas.auth import NAME_RE, PHONE_RE


class PatientOut(BaseModel):
    # What a patient (or an appointment that embeds one) looks like in a
    # response. Never includes the password hash - that only ever lives
    # on the User row and is never serialized to a schema at all.
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str

    # Lets this schema be built straight from a SQLAlchemy Patient
    # object (model.attr) instead of requiring a dict first.
    model_config = {"from_attributes": True}


class PatientUpdateRequest(BaseModel):
    # Every field optional - a PATCH only has to send what's changing.
    # Password changes go through this same endpoint rather than a
    # separate one, since it's still "editing my own account".
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    password: str | None = None

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, value):
        if value is not None and not NAME_RE.match(value):
            raise ValueError("Must contain only letters and spaces")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if value is not None and not PHONE_RE.match(value):
            raise ValueError("Phone must be exactly 10 digits and start with 07")
        return value
