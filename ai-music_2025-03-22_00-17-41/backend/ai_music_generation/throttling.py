from rest_framework.throttling import UserRateThrottle
from django.core.cache import cache
from django.conf import settings

class BaseMusicGenerationThrottle(UserRateThrottle):
    """
    Base throttle class for music generation requests.
    Implements tier-based rate limiting.
    """
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)

        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }

    def get_rate(self):
        """
        Get rate based on user's subscription tier.
        """
        # Handle case when self.request is not set yet (during instantiation)
        if not hasattr(self, 'request') or self.request is None:
            # Safely get the default throttle rate, with a fallback value
            try:
                return settings.DEFAULT_THROTTLE_RATES.get('user', '10/day')
            except AttributeError:
                # If DEFAULT_THROTTLE_RATES is not defined, return a default value
                return '10/day'
        
        user = self.request.user
        if not user.is_authenticated:
            try:
                return settings.DEFAULT_THROTTLE_RATES.get('anon', '5/day')
            except AttributeError:
                return '5/day'
        
        # Get user's subscription tier
        tier = getattr(user, 'subscription_tier', 'basic')
        
        # Define tier-based rates
        tier_rates = {
            'basic': '10/day',
            'premium': '50/day',
            'professional': '200/day',
            'enterprise': None  # No limit
        }
        
        # Get rate from tier_rates, or fall back to settings, or a default value
        rate = tier_rates.get(tier)
        if rate is not None:
            return rate
        
        # Try to get from settings with fallback
        try:
            return settings.DEFAULT_THROTTLE_RATES.get('user', '10/day')
        except AttributeError:
            return '10/day'


class MusicGenerationRateThrottle(BaseMusicGenerationThrottle):
    """
    Throttle for music generation requests.
    """
    scope = 'music_generation'


class LLMRequestRateThrottle(BaseMusicGenerationThrottle):
    """
    Throttle for LLM API requests.
    """
    scope = 'llm_requests'


class BurstRateThrottle(BaseMusicGenerationThrottle):
    """
    Throttle for burst requests (short time window).
    """
    scope = 'burst'

    def get_rate(self):
        """
        Get burst rate based on user's subscription tier.
        """
        # Handle case when self.request is not set yet (during instantiation)
        if not hasattr(self, 'request') or self.request is None:
            # Safely get the default throttle rate, with a fallback value
            try:
                return settings.DEFAULT_THROTTLE_RATES.get('burst', '5/minute')
            except AttributeError:
                return '5/minute'
        
        user = self.request.user
        if not user.is_authenticated:
            try:
                return settings.DEFAULT_THROTTLE_RATES.get('anon', '2/minute')
            except AttributeError:
                return '2/minute'
        
        tier = getattr(user, 'subscription_tier', 'basic')
        
        burst_rates = {
            'basic': '3/minute',
            'premium': '10/minute',
            'professional': '30/minute',
            'enterprise': None
        }
        
        # Get rate from burst_rates, or fall back to settings, or a default value
        rate = burst_rates.get(tier)
        if rate is not None:
            return rate
        
        # Try to get from settings with fallback
        try:
            return settings.DEFAULT_THROTTLE_RATES.get('burst', '5/minute')
        except AttributeError:
            return '5/minute'


def check_user_quota(user):
    """
    Check if user has exceeded their daily quota.
    Returns (bool, str) tuple indicating if quota is exceeded and remaining quota.
    """
    if not user.is_authenticated:
        return False, "Authentication required"

    tier = getattr(user, 'subscription_tier', 'basic')
    
    # Define tier quotas
    tier_quotas = {
        'basic': 10,
        'premium': 50,
        'professional': 200,
        'enterprise': float('inf')
    }
    
    daily_quota = tier_quotas.get(tier, 10)
    if daily_quota == float('inf'):
        return True, "Unlimited quota"

    # Check cache for today's usage
    cache_key = f'music_gen_quota_{user.pk}'
    usage = cache.get(cache_key, 0)
    
    remaining = daily_quota - usage
    if remaining <= 0:
        return False, f"Daily quota exceeded. Limit: {daily_quota}"
    
    return True, f"Remaining quota: {remaining}"


def increment_user_usage(user):
    """
    Increment user's daily usage counter.
    """
    if not user.is_authenticated:
        return

    cache_key = f'music_gen_quota_{user.id}'
    try:
        cache.incr(cache_key)
    except ValueError:
        # Key doesn't exist, create it with expiry set to end of day
        from datetime import datetime, timedelta
        now = datetime.now()
        midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0)
        cache.set(cache_key, 1, timeout=(midnight - now).seconds) 