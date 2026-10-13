# Request/response shapes for doctor profiles - both the public-ish
# "list a doctor" view and the admin-only "create a doctor" form.

from pydantic import BaseModel, EmailStr, field_validator

from app.schemas.auth import NAME_RE, PHONE_RE


class DoctorOut(BaseModel):
    # What GET /doctors and GET /doctors/me return. Deliberately leaves
    # out email/phone - those aren't needed by a patient picking a doctor
    # from a dropdown, only doctor_id (the login id, shown to humans),
    # speciality, and rate.
    id: int
    doctor_id: str
    first_name: str
    last_name: str
    speciality: str
    consultation_rate: float

    model_config = {"from_attributes": True}


class DoctorCreateRequest(BaseModel):
    # Used only by POST /admin/doctors - this is the "admin seeds a
    # doctor account" form from the brief. There's no equivalent
    # self-service signup for doctors.
    doctor_id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    speciality: str
    consultation_rate: float
    password: str

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, value):
        if not NAME_RE.match(value):
            raise ValueError("Must contain only letters and spaces")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if not PHONE_RE.match(value):
            raise ValueError("Phone must be exactly 10 digits and start with 07")
        return value


class DoctorUpdateRequest(BaseModel):
    # Doctors can only edit their own name and password - no email/phone/
    # speciality/rate changes, matching "top right corner the account
    # edit option for editing the name and the password ONLY" from the brief.
    first_name: str | None = None
    last_name: str | None = None
    password: str | None = None

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, value):
        if value is not None and not NAME_RE.match(value):
            raise ValueError("Must contain only letters and spaces")
        return value
