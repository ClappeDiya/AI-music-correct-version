from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.shortcuts import redirect
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Recommendation
from .serializers import RecommendationSerializer

def get_user_cache_key(request, prefix):
    """Generate user-specific cache key"""
    user_id = request.user.id if request.user.is_authenticated else 'anonymous'
    return f'{prefix}_user_{user_id}'

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root(request):
    """Root endpoint that provides API information"""
    return Response({
        'name': 'Roo AI Music API',
        'version': '1.0',
        'endpoints': {
            'api': '/api/',
            'recommendations': '/api/recommendations/',
            'recommendations_suggestions': '/api/recommendations/suggestions/',
            'recommendations_follow': '/api/recommendations/follow/',
            'recommendations_history': '/api/recommendations/history/',
        }
    })

def root_redirect(request):
    """Redirect root to API documentation"""
    return redirect('api-root')

class RecommendationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for testing
    
    @method_decorator(cache_page(60 * 5, key_prefix=lambda req: get_user_cache_key(req, 'suggestions')))
    def suggestions(self, request):
        # Placeholder implementation for testing
        return Response({
            'suggestions': [
                {'user_id': 1, 'score': 0.95},
                {'user_id': 2, 'score': 0.92},
                {'user_id': 3, 'score': 0.89}
            ]
        })

    def follow(self, request):
        # Placeholder implementation for testing
        # Clear user-specific caches
        user_key = get_user_cache_key(request, 'suggestions')
        cache.delete(user_key)
        user_key = get_user_cache_key(request, 'history')
        cache.delete(user_key)
        return Response({'status': 'success'})

    @method_decorator(cache_page(60 * 2, key_prefix=lambda req: get_user_cache_key(req, 'history')))
    def history(self, request):
        # Placeholder implementation for testing
        return Response({
            'history': [
                {'user_id': 1, 'timestamp': '2025-01-18T21:25:00Z'},
                {'user_id': 2, 'timestamp': '2025-01-18T21:20:00Z'}
            ]
        })