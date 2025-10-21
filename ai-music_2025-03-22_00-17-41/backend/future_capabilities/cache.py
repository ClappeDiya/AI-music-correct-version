from django.core.cache import cache
from functools import wraps
from django.conf import settings
import hashlib
import json

def generate_cache_key(prefix, *args, **kwargs):
    """Generate a unique cache key based on the arguments."""
    key_parts = [prefix]
    if args:
        key_parts.extend([str(arg) for arg in args])
    if kwargs:
        key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
    key_string = ":".join(key_parts)
    return hashlib.md5(key_string.encode()).hexdigest()

def cached_response(timeout=3600, key_prefix=None):
    """
    Cache decorator for ViewSet methods.
    
    Args:
        timeout (int): Cache timeout in seconds (default: 1 hour)
        key_prefix (str): Prefix for the cache key
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            # Don't cache if DEBUG is True
            if settings.DEBUG:
                return func(self, request, *args, **kwargs)

            # Generate cache key
            prefix = key_prefix or f"{self.__class__.__name__}:{func.__name__}"
            cache_key = generate_cache_key(
                prefix,
                request.user.id,
                request.query_params.dict(),
                kwargs
            )

            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            # Get fresh result
            result = func(self, request, *args, **kwargs)
            
            # Cache the result
            cache.set(cache_key, result, timeout)
            return result
        return wrapper
    return decorator

def invalidate_cache_pattern(pattern):
    """Invalidate all cache keys matching a pattern."""
    if hasattr(cache, 'delete_pattern'):
        cache.delete_pattern(pattern)
    else:
        # Fallback for cache backends that don't support delete_pattern
        cache.clear()

class BulkOperationError(Exception):
    """Exception for bulk operation failures."""
    def __init__(self, message, failed_items=None):
        super().__init__(message)
        self.failed_items = failed_items or []

def handle_bulk_operation(items, operation_func):
    """
    Handle bulk operations with proper error tracking.
    
    Args:
        items (list): List of items to process
        operation_func (callable): Function to apply to each item
        
    Returns:
        tuple: (successful_items, failed_items)
    """
    successful_items = []
    failed_items = []

    for item in items:
        try:
            result = operation_func(item)
            successful_items.append({
                'item': item,
                'result': result
            })
        except Exception as e:
            failed_items.append({
                'item': item,
                'error': str(e)
            })

    return successful_items, failed_items
