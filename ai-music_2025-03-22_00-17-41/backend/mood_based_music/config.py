from django.conf import settings
import os
from functools import lru_cache

class MoodConfig:
    """Production configuration for mood-based music generation"""
    
    # AI Model Endpoints
    AI_MODEL_ENDPOINT = os.getenv('AI_MODEL_ENDPOINT', 'https://api.openai.com/v1')
    AI_MODEL_VERSION = os.getenv('AI_MODEL_VERSION', 'gpt-4')
    AI_MODEL_KEY = os.getenv('OPENAI_API_KEY')
    
    # Caching Configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CACHE_TTL = int(os.getenv('CACHE_TTL', 3600))  # 1 hour default
    CACHE_PREFIX = 'mood_music:'
    
    # Rate Limiting
    RATE_LIMIT_TRACKS = int(os.getenv('RATE_LIMIT_TRACKS', 100))  # Tracks per user per day
    RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', 86400))  # 24 hours in seconds
    
    # Feature Flags
    ENABLE_MULTI_MOOD_BLEND = os.getenv('ENABLE_MULTI_MOOD_BLEND', 'true').lower() == 'true'
    ENABLE_EMOTIONAL_TRANSITIONS = os.getenv('ENABLE_EMOTIONAL_TRANSITIONS', 'true').lower() == 'true'
    
    # Analytics
    ANALYTICS_BATCH_SIZE = int(os.getenv('ANALYTICS_BATCH_SIZE', 100))
    ANALYTICS_FLUSH_INTERVAL = int(os.getenv('ANALYTICS_FLUSH_INTERVAL', 300))  # 5 minutes
    
    # Security
    ENABLE_RLS = True  # Row Level Security is always enabled in production
    MAX_TRACK_SIZE = int(os.getenv('MAX_TRACK_SIZE', 10 * 1024 * 1024))  # 10MB default
    
    # Performance Tuning
    DB_POOL_SIZE = int(os.getenv('DB_POOL_SIZE', 20))
    WORKER_THREADS = int(os.getenv('WORKER_THREADS', 4))
    
    @classmethod
    @lru_cache()
    def get_instance(cls):
        """Get cached instance of config"""
        return cls()

    def get_cache_key(self, key: str, user_id: int = None) -> str:
        """Generate cache key with prefix and optional user_id"""
        if user_id:
            return f"{self.CACHE_PREFIX}user_{user_id}:{key}"
        return f"{self.CACHE_PREFIX}{key}" 