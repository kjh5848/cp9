"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = Field(default="research-backend")
    app_env: Literal["development", "staging", "production"] = Field(
        default="development"
    )
    debug: bool = Field(default=False)
    api_v1_prefix: str = Field(default="/api/v1")

    # Server
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)

    # Database
    database_url: PostgresDsn = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/research_db"
    )
    database_pool_size: int = Field(default=20)
    database_max_overflow: int = Field(default=0)

    # Redis
    redis_url: RedisDsn = Field(default="redis://localhost:6379/0")
    redis_cache_url: RedisDsn = Field(default="redis://localhost:6379/1")

    # Celery
    celery_broker_url: RedisDsn = Field(default="redis://localhost:6379/2")
    celery_result_backend: RedisDsn = Field(default="redis://localhost:6379/3")

    # Perplexity API
    perplexity_api_key: str = Field(default="")
    perplexity_api_url: str = Field(default="https://api.perplexity.ai")
    perplexity_timeout: int = Field(default=30)
    perplexity_model: str = Field(default="sonar-pro")

    # Research Configuration
    max_batch_size: int = Field(default=10)
    max_research_batch_size: int = Field(default=10)
    default_research_batch_size: int = Field(default=5)
    min_research_batch_size: int = Field(default=1)
    max_concurrent_requests: int = Field(default=5)
    request_timeout: int = Field(default=60)
    retry_max_attempts: int = Field(default=3)
    retry_delay: float = Field(default=1.0)

    # Logging
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO"
    )
    log_format: Literal["json", "plain"] = Field(default="json")

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: PostgresDsn) -> PostgresDsn:
        """Ensure database URL uses asyncpg for async operations."""
        url_str = str(v)
        if "postgresql://" in url_str and "+asyncpg" not in url_str:
            url_str = url_str.replace("postgresql://", "postgresql+asyncpg://")
        return PostgresDsn(url_str)

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.app_env == "production"

    @property
    def database_url_sync(self) -> str:
        """Get synchronous database URL for Alembic migrations."""
        url_str = str(self.database_url)
        return url_str.replace("+asyncpg", "")


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()
