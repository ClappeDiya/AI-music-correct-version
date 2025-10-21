import time
from django.core.cache import cache
from .models import PerformanceMetric
from .tasks import monitor_system_health


class PerformanceMonitoringMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Start timing the request
        start_time = time.time()
        
        # Process the request
        response = self.get_response(request)
        
        # Calculate response time
        response_time = time.time() - start_time
        
        # Store response time metric
        PerformanceMetric.objects.create(
            metric_type='response_time',
            value=response_time * 1000,  # Convert to milliseconds
            server_instance=self.get_instance_id()
        )
        
        # Trigger system health monitoring if needed
        self.check_monitoring_threshold()
        
        return response
    
    def get_instance_id(self):
        """Get current server instance ID."""
        try:
            import requests
            response = requests.get(
                'http://169.254.169.254/latest/meta-data/instance-id',
                timeout=1
            )
            return response.text
        except:
            return 'local-development'
    
    def check_monitoring_threshold(self):
        """Check if we need to trigger system health monitoring."""
        last_check_key = 'last_health_check'
        last_check = cache.get(last_check_key)
        
        if not last_check:
            monitor_system_health.delay()
            cache.set(last_check_key, time.time(), 300)  # Check every 5 minutes


class CacheMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Try to get response from cache
        if request.method == 'GET':
            cache_key = self.get_cache_key(request)
            response = cache.get(cache_key)
            
            if response:
                return response
        
        # Process the request
        response = self.get_response(request)
        
        # Cache the response if it's cacheable
        if request.method == 'GET' and response.status_code == 200:
            cache_key = self.get_cache_key(request)
            cache.set(cache_key, response, 300)  # Cache for 5 minutes
        
        return response
    
    def get_cache_key(self, request):
        """Generate a cache key based on the request."""
        return f"cache:{request.path}:{request.GET.urlencode()}"
