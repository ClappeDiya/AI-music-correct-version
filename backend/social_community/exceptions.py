from rest_framework.exceptions import APIException
from django.utils.translation import gettext_lazy as _

class ContentSafetyError(APIException):
    status_code = 400
    default_detail = _('Content safety check failed.')
    default_code = 'content_safety_error'

class RateLimitExceeded(APIException):
    status_code = 429
    default_detail = _('Rate limit exceeded.')
    default_code = 'rate_limit_exceeded'

class TokenValidationError(APIException):
    status_code = 400
    default_detail = _('Token validation failed.')
    default_code = 'token_validation_error'

class BatchProcessingError(APIException):
    status_code = 400
    default_detail = _('Batch processing failed.')
    default_code = 'batch_processing_error'

class InvalidPromptError(APIException):
    status_code = 400
    default_detail = _('Invalid prompt provided.')
    default_code = 'invalid_prompt' 