import re
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger('django')

class MusicEducationAuthMiddleware(MiddlewareMixin):
    """
    Custom middleware to handle authentication for Music Education API endpoints.
    This ensures proper token validation for all music education endpoints.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()
        # Pattern to match music education API endpoints
        self.api_pattern = re.compile(r'^/api/v1/music-education/')
        
    def process_request(self, request):
        # Only process music education API requests
        if not self.api_pattern.match(request.path):
            return None
            
        # Skip authentication for OPTIONS requests (CORS preflight)
        if request.method == 'OPTIONS':
            return None
            
        # Try to authenticate with JWT
        try:
            # Get the auth header
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            
            if not auth_header:
                # Check for token in cookies or other sources
                token = request.COOKIES.get('auth_token')
                if token:
                    auth_header = f'Bearer {token}'
            
            if not auth_header:
                # Log authentication failure
                logger.debug(f"No auth header for {request.path}")
                return JsonResponse(
                    {'detail': 'Authentication credentials were not provided.'}, 
                    status=401
                )
                
            # Authenticate request
            validated_token = self.jwt_auth.get_validated_token(auth_header.split(' ')[1])
            user = self.jwt_auth.get_user(validated_token)
            
            # Set authenticated user on request
            request.user = user
            # Log successful authentication
            logger.debug(f"User authenticated: {user.email}")
            
        except (InvalidToken, TokenError, IndexError) as e:
            # Log token validation error
            logger.debug(f"Token validation error for {request.path}: {str(e)}")
            return JsonResponse(
                {'detail': 'Invalid or expired token.'}, 
                status=401
            )
        except Exception as e:
            # Log unexpected authentication error
            logger.error(f"Authentication error: {str(e)}")
            return JsonResponse(
                {'detail': 'Authentication error occurred.'}, 
                status=401
            )
            
        return None
