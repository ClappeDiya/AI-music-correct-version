"""
Virtual Studio Authentication Middleware

This middleware handles centralized authentication for all virtual studio endpoints,
ensuring the backend is the single source of truth for authentication status.
"""

import logging
import json
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger('virtual_studio.auth')

class AuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to centralize authentication handling for Virtual Studio API endpoints.
    
    This middleware ensures:
    1. All Virtual Studio API requests are properly authenticated
    2. Session-based authentication is consistently enforced
    3. Proper error responses are returned for unauthenticated requests
    4. Cross-user access attempts are prevented
    """
    
    def process_request(self, request):
        """Process the request and ensure proper authentication"""
        # Only apply to virtual_studio API paths
        if not request.path.startswith('/api/virtual_studio/'):
            return None
            
        # Skip OPTIONS requests (for CORS)
        if request.method == 'OPTIONS':
            return None
            
        # Check if user is authenticated
        if not request.user.is_authenticated:
            logger.warning(
                "Unauthenticated access attempt to Virtual Studio API",
                extra={
                    'path': request.path,
                    'method': request.method,
                    'ip': self._get_client_ip(request)
                }
            )
            return JsonResponse(
                {"error": "Authentication required"}, 
                status=401
            )
            
        # Prevent direct user_id specification in requests (backend should determine user from session)
        self._remove_user_fields(request)
        
        # Log successful access
        if settings.DEBUG:
            logger.debug(
                f"Authenticated access to Virtual Studio API: {request.user.username}",
                extra={
                    'user_id': request.user.id,
                    'path': request.path,
                    'method': request.method
                }
            )
            
        return None
    
    def process_response(self, request, response):
        """Process the response and add any necessary headers"""
        # Only modify virtual_studio API responses
        if not request.path.startswith('/api/virtual_studio/'):
            return response
            
        # Add authentication-related headers if needed
        if request.user.is_authenticated:
            response['X-Auth-Status'] = 'authenticated'
            
        return response
    
    def _get_client_ip(self, request):
        """Get the client IP address from the request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
    
    def _remove_user_fields(self, request):
        """
        Remove direct user ID/field specifications from the request
        to ensure the backend uses the authenticated user from the session
        """
        # For GET parameters
        if hasattr(request, 'GET') and 'user' in request.GET:
            request.GET = request.GET.copy()
            del request.GET['user']
            
        if hasattr(request, 'GET') and 'user_id' in request.GET:
            request.GET = request.GET.copy()
            del request.GET['user_id']
            
        # For POST/PUT JSON data
        if hasattr(request, 'body') and request.body:
            try:
                content_type = request.META.get('CONTENT_TYPE', '')
                if 'application/json' in content_type and request.body:
                    data = json.loads(request.body)
                    if isinstance(data, dict):
                        # Remove user fields from the data
                        if 'user' in data:
                            del data['user']
                        if 'user_id' in data:
                            del data['user_id']
                        # Replace request body with the cleaned data
                        request._body = json.dumps(data).encode('utf-8')
            except (ValueError, json.JSONDecodeError):
                # Not valid JSON, ignore
                pass
