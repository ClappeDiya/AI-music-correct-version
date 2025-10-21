from django.core.cache import cache
from django.conf import settings
import redis

# Redis client for direct access
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

class CacheService:
    PREFIX = 'music_education:'
    
    @staticmethod
    def get_key(key_type, identifier):
        return f"{CacheService.PREFIX}{key_type}:{identifier}"

    @staticmethod
    def cache_lesson(lesson_id, data, timeout=3600):
        key = CacheService.get_key('lesson', lesson_id)
        cache.set(key, data, timeout)

    @staticmethod
    def get_cached_lesson(lesson_id):
        key = CacheService.get_key('lesson', lesson_id)
        return cache.get(key)

    @staticmethod
    def cache_user_progress(user_id, data, timeout=300):
        key = CacheService.get_key('progress', user_id)
        cache.set(key, data, timeout)

    @staticmethod
    def get_cached_user_progress(user_id):
        key = CacheService.get_key('progress', user_id)
        return cache.get(key)

    @staticmethod
    def invalidate_lesson_cache(lesson_id):
        key = CacheService.get_key('lesson', lesson_id)
        cache.delete(key)

    @staticmethod
    def batch_get_lessons(lesson_ids):
        keys = [CacheService.get_key('lesson', lid) for lid in lesson_ids]
        return cache.get_many(keys)

    @staticmethod
    def clear_user_cache(user_id):
        pattern = f"{CacheService.PREFIX}*:{user_id}"
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)

    @staticmethod
    def get_cache_stats():
        info = redis_client.info()
        keys = redis_client.keys(f"{CacheService.PREFIX}*")
        return {
            'total_keys': len(keys),
            'memory_used': info.get('used_memory_human'),
            'connected_clients': info.get('connected_clients'),
            'last_save_time': info.get('last_save_time'),
        } 