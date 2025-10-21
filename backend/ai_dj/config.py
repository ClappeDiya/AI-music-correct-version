from typing import Dict, List, Optional
from pydantic import BaseSettings, Field
import os
from dotenv import load_dotenv

load_dotenv()

class VoiceProcessingSettings(BaseSettings):
    """Voice processing configuration"""
    SUPPORTED_LANGUAGES: List[str] = Field(
        default=["en-US", "es-ES", "fr-FR", "de-DE", "it-IT", "ja-JP", "ko-KR", "zh-CN"],
        description="Supported languages for voice commands"
    )
    NOISE_REDUCTION_ENABLED: bool = Field(
        default=True,
        description="Enable noise reduction for voice input"
    )
    ECHO_CANCELLATION_ENABLED: bool = Field(
        default=True,
        description="Enable echo cancellation for voice input"
    )
    VOICE_ACTIVITY_DETECTION: bool = Field(
        default=True,
        description="Enable voice activity detection"
    )
    MAX_COMMAND_DURATION_MS: int = Field(
        default=10000,
        description="Maximum duration for voice commands in milliseconds"
    )

class LLMSettings(BaseSettings):
    """LLM configuration for music suggestions"""
    PROVIDER: str = Field(
        default=os.getenv("LLM_PROVIDER", "openai"),
        description="LLM provider (openai, azure, etc.)"
    )
    MODEL_NAME: str = Field(
        default=os.getenv("LLM_MODEL_NAME", "gpt-4"),
        description="Name of the LLM model to use"
    )
    API_KEY: str = Field(
        default=os.getenv("LLM_API_KEY", ""),
        description="API key for the LLM provider"
    )
    MAX_TOKENS: int = Field(
        default=4096,
        description="Maximum tokens for LLM requests"
    )
    TEMPERATURE: float = Field(
        default=0.8,
        description="Temperature for LLM responses"
    )
    CACHE_ENABLED: bool = Field(
        default=True,
        description="Enable caching of LLM responses"
    )
    CACHE_TTL: int = Field(
        default=3600,
        description="Time-to-live for cached responses in seconds"
    )

class CollaborationSettings(BaseSettings):
    """Settings for collaborative DJ sessions"""
    MAX_USERS_PER_SESSION: int = Field(
        default=5,
        description="Maximum number of users in a collaborative session"
    )
    SYNC_INTERVAL_MS: int = Field(
        default=1000,
        description="Interval for syncing collaborative sessions in milliseconds"
    )
    WEBSOCKET_ENABLED: bool = Field(
        default=True,
        description="Enable WebSocket for real-time collaboration"
    )
    CONFLICT_RESOLUTION: str = Field(
        default="last_write_wins",
        description="Strategy for resolving conflicts in collaborative sessions"
    )

class MetricsSettings(BaseSettings):
    """Settings for usage metrics and analytics"""
    ENABLE_TRACKING: bool = Field(
        default=True,
        description="Enable tracking of usage metrics"
    )
    METRICS_RETENTION_DAYS: int = Field(
        default=90,
        description="Number of days to retain metrics data"
    )
    BATCH_SIZE: int = Field(
        default=100,
        description="Batch size for metrics processing"
    )
    EXPORT_ENABLED: bool = Field(
        default=True,
        description="Enable export of metrics data"
    )

class AIDJConfig(BaseSettings):
    """Main configuration for AI DJ module"""
    DEBUG: bool = Field(
        default=False,
        description="Enable debug mode"
    )
    ENVIRONMENT: str = Field(
        default=os.getenv("ENVIRONMENT", "development"),
        description="Current environment (development, staging, production)"
    )
    VOICE_PROCESSING: VoiceProcessingSettings = VoiceProcessingSettings()
    LLM: LLMSettings = LLMSettings()
    COLLABORATION: CollaborationSettings = CollaborationSettings()
    METRICS: MetricsSettings = MetricsSettings()
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global config instance
config = AIDJConfig() 