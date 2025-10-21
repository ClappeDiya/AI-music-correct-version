from functools import lru_cache
import os
from typing import Dict, Any

class LyricsConfig:
    """Production configuration for lyrics generation"""
    
    # AI Model Endpoints
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
    ANTHROPIC_MODEL = os.getenv('ANTHROPIC_MODEL', 'claude-3-opus-20240229')
    
    # Storage Configuration
    LYRICS_STORAGE_BUCKET = os.getenv('LYRICS_STORAGE_BUCKET', 'lyrics-storage')
    LYRICS_CDN_URL = os.getenv('LYRICS_CDN_URL')
    MAX_LYRICS_SIZE = int(os.getenv('MAX_LYRICS_SIZE', 1024 * 1024))  # 1MB default
    
    # Redis Cache Configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CACHE_TTL = int(os.getenv('CACHE_TTL', 3600))  # 1 hour default
    CACHE_PREFIX = 'lyrics:'
    
    # Rate Limiting
    RATE_LIMIT_PROMPTS = int(os.getenv('RATE_LIMIT_PROMPTS', 100))  # Prompts per user per day
    RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', 86400))  # 24 hours in seconds
    
    # Feature Flags
    ENABLE_REALTIME_COLLAB = os.getenv('ENABLE_REALTIME_COLLAB', 'true').lower() == 'true'
    ENABLE_SENTIMENT_ANALYSIS = os.getenv('ENABLE_SENTIMENT_ANALYSIS', 'true').lower() == 'true'
    ENABLE_ADVANCED_METRICS = os.getenv('ENABLE_ADVANCED_METRICS', 'true').lower() == 'true'
    
    # Analytics & Monitoring
    ANALYTICS_BATCH_SIZE = int(os.getenv('ANALYTICS_BATCH_SIZE', 100))
    ANALYTICS_FLUSH_INTERVAL = int(os.getenv('ANALYTICS_FLUSH_INTERVAL', 300))  # 5 minutes
    SENTRY_DSN = os.getenv('SENTRY_DSN')
    DATADOG_API_KEY = os.getenv('DATADOG_API_KEY')
    
    # Security
    ENABLE_RLS = True  # Row Level Security is always enabled in production
    ENCRYPTION_KEY = os.getenv('LYRICS_ENCRYPTION_KEY')
    JWT_SECRET = os.getenv('JWT_SECRET')
    
    # Performance Tuning
    DB_POOL_SIZE = int(os.getenv('DB_POOL_SIZE', 20))
    WORKER_THREADS = int(os.getenv('WORKER_THREADS', 4))
    
    # Collaboration Settings
    COLLAB_WEBSOCKET_URL = os.getenv('COLLAB_WEBSOCKET_URL', 'wss://collab.example.com')
    MAX_COLLABORATORS = int(os.getenv('MAX_COLLABORATORS', 5))
    
    # VR/AR Settings
    ENABLE_VR = os.getenv('ENABLE_VR', 'true').lower() == 'true'
    ENABLE_AR = os.getenv('ENABLE_AR', 'true').lower() == 'true'
    VR_MODEL_CDN = os.getenv('VR_MODEL_CDN', 'https://cdn.example.com/vr-models')
    
    # Sentiment Analysis
    SENTIMENT_API_KEY = os.getenv('SENTIMENT_API_KEY')
    SENTIMENT_API_URL = os.getenv('SENTIMENT_API_URL', 'https://api.sentiment.example.com')
    
    @classmethod
    @lru_cache()
    def get_instance(cls) -> 'LyricsConfig':
        """Get cached instance of config"""
        return cls()
    
    def get_feature_flags(self) -> Dict[str, bool]:
        """Get all feature flags"""
        return {
            'realtime_collab': self.ENABLE_REALTIME_COLLAB,
            'sentiment_analysis': self.ENABLE_SENTIMENT_ANALYSIS,
            'advanced_metrics': self.ENABLE_ADVANCED_METRICS,
            'vr_enabled': self.ENABLE_VR,
            'ar_enabled': self.ENABLE_AR
        }
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        """Get monitoring configuration"""
        return {
            'sentry_dsn': self.SENTRY_DSN,
            'datadog_api_key': self.DATADOG_API_KEY,
            'analytics_batch_size': self.ANALYTICS_BATCH_SIZE,
            'analytics_flush_interval': self.ANALYTICS_FLUSH_INTERVAL
        } 