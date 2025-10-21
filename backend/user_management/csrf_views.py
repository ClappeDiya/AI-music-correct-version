from django.http import JsonResponse

def csrf_failure(request, reason=""):
    return JsonResponse({
        'status': 'error',
        'code': 'csrf_validation_failed',
        'message': 'CSRF validation failed. Please refresh the page and try again.'
    }, status=403)