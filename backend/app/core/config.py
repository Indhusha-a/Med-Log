# App-wide settings, loaded once from environment variables / .env and
# shared everywhere else as the `settings` object below. Nothing else in
# the app should read os.environ directly - it all comes through here.

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Falls back to local SQLite + a dev secret if no .env is present, so the
    # app still boots for a quick check. Use the .env values (Postgres, a real
    # secret) for the actual submission.
    DATABASE_URL: str = "sqlite:///./medlog_dev.db"
    JWT_SECRET_KEY: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    CANCEL_LOCK_HOURS: int = 1


# Instantiated once at import time - every module just does
# `from app.core.config import settings` and reads attributes off this.
settings = Settings()
