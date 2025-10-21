"""
Utility functions for JWT token generation and testing.
"""
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger('backend.token_utils')

User = get_user_model()

def get_tokens_for_user(user):
    """
    Generate JWT tokens for a user.
    
    Args:
        user: User instance to generate tokens for
        
    Returns:
        dict: Dictionary containing refresh and access tokens
    """
    refresh = RefreshToken.for_user(user)
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def create_test_user(username='testuser', email='test@example.com', password='password123!'):
    """
    Create a test user or get if exists.
    
    Args:
        username: Username for the test user
        email: Email for the test user
        password: Password for the test user
        
    Returns:
        User instance and token dictionary
    """
    try:
        user = User.objects.get(username=username)
        logger.info(f"Found existing test user: {username}")
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        logger.info(f"Created new test user: {username}")
    
    tokens = get_tokens_for_user(user)
    
    return {
        'user': user,
        'tokens': tokens,
        'auth_header': f"Bearer {tokens['access']}"
    }

def verify_token(token):
    """
    Verify a JWT token and return user information if valid.
    
    Args:
        token: JWT token string
        
    Returns:
        dict: Token verification status and user info if valid
    """
    from rest_framework_simplejwt.tokens import AccessToken
    from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
    
    try:
        # Remove Bearer prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Parse and validate the token
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        
        # Get the user from the token
        try:
            user = User.objects.get(id=user_id)
            return {
                'valid': True,
                'user_id': user_id,
                'username': user.username,
                'email': user.email
            }
        except User.DoesNotExist:
            return {
                'valid': False,
                'error': 'User not found'
            }
            
    except TokenError as e:
        return {
            'valid': False,
            'error': str(e)
        }
    except Exception as e:
        return {
            'valid': False,
            'error': f'Unexpected error: {str(e)}'
        }
