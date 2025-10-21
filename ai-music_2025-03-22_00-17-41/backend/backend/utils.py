"""
Backend utilities for handling exceptions and other common functions.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

# Set up logger
logger = logging.getLogger('backend.utils')

def custom_exception_handler(exc, context):
    """
    Custom exception handler for REST Framework to provide more detailed error responses.
    
    Args:
        exc: The exception object
        context: The request context
        
    Returns:
        Response object with appropriate error details
    """
    # Call the default handler first
    response = exception_handler(exc, context)
    
    # Log the error
    logger.error(f"Exception occurred: {exc} in context: {context}")
    
    # If no response is returned by the default handler, create one for unhandled exceptions
    if response is None:
        response = Response(
            {
                'code': 'server_error',
                'message': 'An unexpected error occurred',
                'details': str(exc)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Add more specific information for authentication errors
    elif response.status_code == status.HTTP_401_UNAUTHORIZED:
        response.data = {
            'code': 'authentication_failed',
            'message': 'Authentication credentials are invalid or expired',
            'details': str(response.data) if hasattr(response, 'data') else None
        }
    
    # Add more specific information for permission errors
    elif response.status_code == status.HTTP_403_FORBIDDEN:
        response.data = {
            'code': 'permission_denied',
            'message': 'You do not have permission to perform this action',
            'details': str(response.data) if hasattr(response, 'data') else None
        }
    
    # Return the augmented response
    return response
