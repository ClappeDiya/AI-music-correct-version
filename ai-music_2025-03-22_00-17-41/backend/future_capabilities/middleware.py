from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from jwt import InvalidTokenError
import json
import time
import logging
from django.http import JsonResponse
from django.conf import settings
from rest_framework import status

User = get_user_model()

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user(token_key):
    try:
        access_token = AccessToken(token_key)
        user = User.objects.get(id=access_token['user_id'])
        return user
    except (InvalidTokenError, User.DoesNotExist):
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Get the token from query string
        query_string = scope.get('query_string', b'').decode()
        query_params = dict(param.split('=') for param in query_string.split('&') if param)
        token = query_params.get('token', None)

        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)

def TokenAuthMiddlewareStack(inner):
    return TokenAuthMiddleware(inner)

class ErrorHandlingMiddleware:
    """Middleware for handling and logging errors."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            return self.handle_exception(request, e)

    def handle_exception(self, request, exception):
        # Log the error with request details
        logger.error(
            'Unhandled exception occurred',
            exc_info=True,
            extra={
                'request_path': request.path,
                'request_method': request.method,
                'user_id': getattr(request.user, 'id', None)
            }
        )

        if settings.DEBUG:
            # In debug mode, return detailed error information
            error_details = {
                'error': str(exception),
                'type': exception.__class__.__name__,
                'path': request.path,
                'method': request.method
            }
        else:
            # In production, return generic error message
            error_details = {
                'error': 'An unexpected error occurred',
                'code': 'internal_server_error'
            }

        return JsonResponse(error_details, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PerformanceMonitoringMiddleware:
    """Middleware for monitoring request performance."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = time.time() - start_time
        
        # Log request duration
        logger.info(
            'Request processed',
            extra={
                'duration': duration,
                'path': request.path,
                'method': request.method,
                'status_code': response.status_code
            }
        )
        
        # Add performance metrics to response headers
        response['X-Request-Duration'] = str(duration)
        
        return response


class RequestLoggingMiddleware:
    """Middleware for logging request details."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request details
        self.log_request(request)
        
        response = self.get_response(request)
        
        # Log response details
        self.log_response(request, response)
        
        return response

    def log_request(self, request):
        logger.info(
            'Request received',
            extra={
                'path': request.path,
                'method': request.method,
                'user_id': getattr(request.user, 'id', None),
                'ip': self.get_client_ip(request)
            }
        )

    def log_response(self, request, response):
        logger.info(
            'Response sent',
            extra={
                'path': request.path,
                'method': request.method,
                'status_code': response.status_code,
                'user_id': getattr(request.user, 'id', None)
            }
        )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class APIKeyAuthMiddleware:
    """Middleware for API key authentication."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip API key check for non-API routes
        if not request.path.startswith('/api/'):
            return self.get_response(request)

        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return JsonResponse(
                {'error': 'API key is required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not self.is_valid_api_key(api_key):
            return JsonResponse(
                {'error': 'Invalid API key'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return self.get_response(request)

    def is_valid_api_key(self, api_key):
        # TODO: Implement API key validation logic
        # This should check against stored API keys in the database
        return True  # Placeholder return
