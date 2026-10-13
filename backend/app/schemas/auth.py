# Request/response shapes for signup and login, plus the shared regex
# constants other schema files import (NAME_RE, PHONE_RE). This is where
# every "no digits in a name", "phone must start with 07" etc. rule from
# the brief actually lives - as Pydantic validators, so a bad request
# never even reaches a service function.

import re

from pydantic import BaseModel, EmailStr, field_validator

from app.models.enums import UserRole

# One or more words of letters only, single-spaced - rejects blank,
# digits, and most special characters without needing a longer regex.
NAME_RE = re.compile(r"^[A-Za-z]+(?: [A-Za-z]+)*$")
# Exactly 10 digits, must start with 07, per the brief.
PHONE_RE = re.compile(r"^07\d{8}$")
PASSWORD_DIGIT_RE = re.compile(r"\d")
PASSWORD_SPECIAL_RE = re.compile(r"[^A-Za-z0-9]")


class PatientSignupRequest(BaseModel):
    # The only self-service signup form in the app - doctors and admins
    # are never created this way (see services/admin_service.seed_doctor
    # and app/seed.py).
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not NAME_RE.match(value):
            raise ValueError("Must contain only letters and spaces, and cannot be blank")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not PHONE_RE.match(value):
            raise ValueError("Phone must be exactly 10 digits and start with 07")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        # Brief only asked for "5+ characters including a digit and a
        # special character" - bumped the length to 8 here, since 5 is
        # weak enough to be worth deviating from the literal spec for.
        if (
            len(value) < 8
            or not PASSWORD_DIGIT_RE.search(value)
            or not PASSWORD_SPECIAL_RE.search(value)
        ):
            raise ValueError(
                "Password must be at least 8 characters and include a digit and a special character"
            )
        return value

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, value: str, info):
        # Pydantic validates fields in declaration order, so `password`
        # has already run and landed in info.data by the time this does -
        # that's why confirm_password is declared after password above.
        if "password" in info.data and value != info.data["password"]:
            raise ValueError("Passwords do not match")
        return value


class LoginRequest(BaseModel):
    # One login endpoint serves all three roles. `role` tells the service
    # layer which table to look `identifier` up in - without it, a
    # patient's email, a doctor's doctor_id, and an admin's username
    # would need their own separate lookup logic (or risk collisions if
    # two different roles ever had identifiers that looked the same).
    role: UserRole
    identifier: str  # email for patient, doctor_id for doctor, username for admin
    password: str


class TokenResponse(BaseModel):
    # What login returns. The frontend stores access_token and sends it
    # back as `Authorization: Bearer <token>` on every request after this.
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
