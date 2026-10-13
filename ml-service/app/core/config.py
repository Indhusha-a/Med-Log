# App-wide settings for this service, loaded once from .env. Kept
# separate from the backend's own Settings class on purpose - these are
# two independent services with two independent .env files, even though
# JWT_SECRET_KEY has to match between them (see .env.example's comment).

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    BACKEND_URL: str = "http://127.0.0.1:8000"
    GROQ_API_KEY: str = ""
    # Which models a Groq key can see varies by account - "llama-3.3-70b-versatile"
    # 404'd on the key this was developed with. "openai/gpt-oss-20b" was
    # confirmed available and tool-call-capable by querying
    # https://api.groq.com/openai/v1/models directly; if your own key 404s
    # on this too, query that endpoint with your key and pick another
    # entry from its list.
    GROQ_MODEL: str = "openai/gpt-oss-20b"
    JWT_SECRET_KEY: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"


settings = Settings()