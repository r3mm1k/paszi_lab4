from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyUrl, Field

class Settings(BaseSettings):
    APP_ENV: str = "development"
    PORT: int = 8000
    SECRET_KEY: str = "secret"

    # БД
    DATABASE_URL: AnyUrl = Field(..., description="SQLAlchemy URL, напр. postgresql+psycopg://user:pass@db:5432/name")

    # Параметры Argon2 (на будущее)
    HASH_SCHEME: str = "argon2id"
    ARGON2_TIME_COST: int = 3
    ARGON2_MEMORY_COST: int = 65536
    ARGON2_PARALLELISM: int = 2

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

settings = Settings()
