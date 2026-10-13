# Everything to do with passwords and JWTs lives here, in one place, so
# there's exactly one spot that knows how a password is hashed and how a
# login token is signed. Nothing outside this file should touch bcrypt or
# jose directly.

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# bcrypt is the only scheme we support; passlib handles the salt + hashing
# work and lets us swap algorithms later without touching calling code.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    # One-way hash for storing in User.password_hash. Never store or log
    # the raw password anywhere else.
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    # Used at login: hash the password the user just typed and compare it
    # (safely, via passlib) against what's stored.
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(user_id: int, role: str) -> str:
    # Builds the JWT handed back on login. `sub` is the user's id (as a
    # string, since that's the JWT convention) and `role` lets every
    # protected endpoint check permissions without a DB lookup for that
    # alone - deps.py still loads the full user row for anything beyond
    # a role check.
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    # Verifies the signature and expiry, and returns the payload dict.
    # Any failure (bad signature, expired, malformed) becomes a plain
    # ValueError so callers don't need to know about jose's exception types.
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc
