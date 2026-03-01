from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    app_name: str = "med-doc-backend"
    app_env: str = "dev"
    api_prefix: str = "/api"

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "med_docs"
    mongo_server_selection_timeout_ms: int = 1500
    mongo_connect_timeout_ms: int = 1500
    mongo_socket_timeout_ms: int = 2000

    openfda_base_url: str = "https://api.fda.gov"
    openfda_timeout_seconds: float = 4.0
    openfda_max_concurrency: int = 4
    openfda_rate_limit_backoff_seconds: float = 1.0
    external_api_timeout_seconds: float = 4.0

    interaction_cache_ttl_hours: int = 24

    elevenlabs_api_key: str | None = None
    elevenlabs_base_url: str = "https://api.elevenlabs.io/v1"
    elevenlabs_voice_id: str = "EXAVITQu4vr4xnSDxMaL"
    elevenlabs_model_id: str = "eleven_multilingual_v2"
    elevenlabs_timeout_seconds: float = 12.0

    model_config = SettingsConfigDict(env_file=str(ENV_PATH), env_file_encoding="utf-8", extra="ignore")


settings = Settings()
