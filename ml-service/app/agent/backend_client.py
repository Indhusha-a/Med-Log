# A thin HTTP client for calling the backend AS the caller - every tool
# in patient_tools.py / doctor_tools.py goes through this instead of
# touching a database. The caller's own JWT is forwarded on every
# request, so the backend's own authorization/business rules apply
# exactly as if the caller had hit the API directly themselves.

import httpx

from app.core.config import settings


class BackendClient:
    def __init__(self, token: str):
        self._client = httpx.Client(
            base_url=settings.BACKEND_URL,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )

    def get(self, path: str, params: dict | None = None):
        response = self._client.get(path, params=params)
        response.raise_for_status()
        return response.json()