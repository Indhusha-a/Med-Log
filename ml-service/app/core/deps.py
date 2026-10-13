# The "who's calling" dependency - pulls the Bearer token off the
# request, verifies it, and hands the router (role, user_id, raw_token).
# The raw token matters: every tool needs it to call the backend as
# this same caller, not as some service-level identity.

from fastapi import Header, HTTPException, status

from app.core.security import decode_access_token


def get_caller(authorization: str | None = Header(default=None)) -> tuple[str, int, str]:
    if authorization is None or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc

    role = payload.get("role")
    if role not in ("patient", "doctor"):
        # Admins don't get a chatbot in this app's design - nothing in
        # the brief asks for one, and there's no tool set written for it.
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Chat is only available to patients and doctors")

    return role, int(payload["sub"]), token