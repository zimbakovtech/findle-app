from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env', env_file_encoding='utf-8', extra='forbid'
    )

    DATABASE_URL: str = 'sqlite+aiosqlite:///./dev.db'

    SECRET_KEY: str = 'your-secret-key'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    CORS_ORIGINS: list[str] = ['http://localhost:3000', 'http://localhost:5173']

    FIRST_SUPERUSER_USERNAME: str = 'admin'
    FIRST_SUPERUSER_EMAIL: str = 'admin@admin.com'
    FIRST_SUPERUSER_PASSWORD: str = 'admin'


settings = Settings()
