from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError, DatabaseError
from django.http import Http404
import logging
import traceback

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Base exception for API errors."""
    def __init__(self, message, code=None, details=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}

class ResourceNotFoundError(APIError):
    """Exception for resource not found errors."""
    def __init__(self, resource_type, resource_id):
        super().__init__(
            message=f"{resource_type} with id {resource_id} not found",
            code="resource_not_found"
        )

class ValidationAPIError(APIError):
    """Exception for validation errors."""
    def __init__(self, message, field_errors=None):
        super().__init__(
            message=message,
            code="validation_error",
            details={"field_errors": field_errors or {}}
        )

class RateLimitExceededError(APIError):
    """Exception for rate limit exceeded."""
    def __init__(self, wait_time=None):
        super().__init__(
            message="Rate limit exceeded",
            code="rate_limit_exceeded",
            details={"wait_time": wait_time} if wait_time else None
        )

class PermissionDeniedError(APIError):
    """Exception for permission denied errors."""
    def __init__(self, message="Permission denied"):
        super().__init__(
            message=message,
            code="permission_denied"
        )

def custom_exception_handler(exc, context):
    """
    Custom exception handler for REST framework views.
    """
    # First try the default handler
    response = exception_handler(exc, context)
    
    if response is not None:
        return response

    # Log the error
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())

    # Handle custom exceptions
    if isinstance(exc, APIError):
        data = {
            "error": {
                "message": exc.message,
                "code": exc.code,
                "details": exc.details
            }
        }
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    # Handle Django exceptions
    if isinstance(exc, ValidationError):
        data = {
            "error": {
                "message": "Validation error",
                "code": "validation_error",
                "details": {"field_errors": exc.message_dict}
            }
        }
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, IntegrityError):
        data = {
            "error": {
                "message": "Database integrity error",
                "code": "integrity_error"
            }
        }
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, DatabaseError):
        data = {
            "error": {
                "message": "Database error",
                "code": "database_error"
            }
        }
        return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if isinstance(exc, Http404):
        data = {
            "error": {
                "message": "Resource not found",
                "code": "not_found"
            }
        }
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    # Handle any other unexpected exceptions
    data = {
        "error": {
            "message": "An unexpected error occurred",
            "code": "internal_server_error"
        }
    }
    return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def handle_api_error(func):
    """
    Decorator to handle API errors in view methods.
    """
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            return custom_exception_handler(e, None)
    return wrapper
