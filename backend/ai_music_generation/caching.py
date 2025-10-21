from django.core.cache import cache
from django.conf import settings
import hashlib
import json
from difflib import SequenceMatcher
from typing import Optional, Tuple, Dict, Any

class PromptCache:
    """
    Handles caching and retrieval of similar music generation prompts.
    """
    CACHE_PREFIX = 'music_prompt_'
    CACHE_TIMEOUT = 60 * 60 * 24 * 7  # 1 week
    SIMILARITY_THRESHOLD = 0.85  # 85% similarity threshold

    @classmethod
    def _generate_cache_key(cls, prompt_data: Dict[str, Any]) -> str:
        """
        Generate a cache key from prompt data.
        """
        # Sort the prompt data to ensure consistent hashing
        sorted_data = json.dumps(prompt_data, sort_keys=True)
        return f"{cls.CACHE_PREFIX}{hashlib.md5(sorted_data.encode()).hexdigest()}"

    @classmethod
    def _calculate_similarity(cls, text1: str, text2: str) -> float:
        """
        Calculate similarity ratio between two texts.
        """
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

    @classmethod
    def _are_params_similar(cls, params1: Dict[str, Any], params2: Dict[str, Any]) -> bool:
        """
        Check if two sets of parameters are similar enough.
        """
        required_keys = ['style', 'mood', 'instruments', 'complexity']
        return all(
            params1.get(key) == params2.get(key)
            for key in required_keys
            if key in params1 and key in params2
        )

    @classmethod
    def find_similar_prompt(cls, prompt_text: str, params: Dict[str, Any]) -> Optional[Tuple[str, Dict[str, Any]]]:
        """
        Find a similar cached prompt and its result.
        Returns (cache_key, cached_data) if found, None otherwise.
        """
        # Get all prompt cache keys
        all_keys = cache.keys(f"{cls.CACHE_PREFIX}*")
        
        for key in all_keys:
            cached_data = cache.get(key)
            if not cached_data:
                continue

            cached_prompt = cached_data.get('prompt_text', '')
            cached_params = cached_data.get('parameters', {})

            # Check text similarity and parameter matching
            if (cls._calculate_similarity(prompt_text, cached_prompt) >= cls.SIMILARITY_THRESHOLD
                and cls._are_params_similar(params, cached_params)):
                return key, cached_data

        return None

    @classmethod
    def cache_prompt(cls, prompt_text: str, params: Dict[str, Any], result: Dict[str, Any]) -> str:
        """
        Cache a prompt and its result.
        Returns the cache key.
        """
        cache_data = {
            'prompt_text': prompt_text,
            'parameters': params,
            'result': result,
            'cache_hits': 0
        }

        cache_key = cls._generate_cache_key({'prompt': prompt_text, **params})
        cache.set(cache_key, cache_data, timeout=cls.CACHE_TIMEOUT)
        return cache_key

    @classmethod
    def get_cached_result(cls, cache_key: str) -> Optional[Dict[str, Any]]:
        """
        Get a cached result and increment its hit counter.
        """
        cached_data = cache.get(cache_key)
        if cached_data:
            # Increment cache hits
            cached_data['cache_hits'] = cached_data.get('cache_hits', 0) + 1
            cache.set(cache_key, cached_data, timeout=cls.CACHE_TIMEOUT)
            return cached_data.get('result')
        return None

    @classmethod
    def invalidate_cache(cls, cache_key: str) -> None:
        """
        Invalidate a specific cache entry.
        """
        cache.delete(cache_key)

    @classmethod
    def cleanup_old_entries(cls) -> int:
        """
        Clean up old cache entries.
        Returns number of entries cleaned.
        """
        cleaned = 0
        all_keys = cache.keys(f"{cls.CACHE_PREFIX}*")
        
        for key in all_keys:
            cached_data = cache.get(key)
            if cached_data and cached_data.get('cache_hits', 0) == 0:
                cache.delete(key)
                cleaned += 1
        
        return cleaned 