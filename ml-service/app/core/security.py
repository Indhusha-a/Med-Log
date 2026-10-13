# JWT verification only - this service never issues a token, only
# checks ones the backend already issued. Deliberately a near-duplicate
# of backend/app/core/security.py's decode logic rather than a shared
# import, since these are two independent deployable services; the only
# thing they must agree on is JWT_SECRET_KEY/JWT_ALGORITHM in their
# respective .env files.

from jose import JWTError, jwt

from app.core.config import settings


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc