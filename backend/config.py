"""
config.py – Application settings loaded from environment variables.

Uses pydantic-settings to validate and parse .env values at startup.
If any required variable is missing, the app will fail fast with a clear error.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ─── OpenRouter ───
    OPENROUTER_API_KEY: str

    # ─── Supabase ───
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    # ─── App ───
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Create a single global settings instance
settings = Settings()
