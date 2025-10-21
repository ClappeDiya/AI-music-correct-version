import json
import logging
from django.http import HttpResponseForbidden
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger('ai_dj.security')

class SecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Check for suspicious patterns
        if self.is_suspicious_request(request):
            return HttpResponseForbidden("Access denied due to suspicious activity")
            
        # Add security headers
        response = self.get_response(request)
        self.add_security_headers(response)
        
        return response
        
    def is_suspicious_request(self, request):
        user_id = request.user.id if request.user.is_authenticated else None
        ip_address = self.get_client_ip(request)
        
        if not user_id:
            return False
            
        # Rate limiting
        cache_key = f"security_rate_limit:{user_id}:{ip_address}"
        attempts = cache.get(cache_key, 0)
        
        if attempts > settings.MAX_API_ATTEMPTS_PER_MINUTE:
            logger.warning(
                "Rate limit exceeded",
                extra={
                    'user_id': user_id,
                    'ip_address': ip_address,
                    'path': request.path,
                    'method': request.method
                }
            )
            return True
            
        cache.set(cache_key, attempts + 1, 60)  # Expire after 1 minute
        
        # Check for cross-user access attempts - safely handle large POST requests
        try:
            if 'user_id' in request.GET:
                target_user_id = request.GET.get('user_id')
                if str(target_user_id) != str(user_id):
                    logger.warning(
                        "Cross-user access attempt detected in GET params",
                        extra={
                            'user_id': user_id,
                            'target_user_id': target_user_id,
                            'ip_address': ip_address,
                            'path': request.path
                        }
                    )
                    return True
            
            # Only check POST if we're not in the admin and it doesn't have too many fields
            if not request.path.startswith('/admin/') and hasattr(request, '_post'):
                if 'user_id' in request.POST:
                    target_user_id = request.POST.get('user_id')
                    if str(target_user_id) != str(user_id):
                        logger.warning(
                            "Cross-user access attempt detected in POST params",
                            extra={
                                'user_id': user_id,
                                'target_user_id': target_user_id,
                                'ip_address': ip_address,
                                'path': request.path
                            }
                        )
                        return True
        except Exception as e:
            # Log the exception but don't block the request
            logger.warning(
                f"Error checking request parameters: {str(e)}",
                extra={
                    'user_id': user_id,
                    'ip_address': ip_address,
                    'path': request.path,
                    'method': request.method,
                    'exception': str(e)
                }
            )
                
        return False
        
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
        
    def add_security_headers(self, response):
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'same-origin' 