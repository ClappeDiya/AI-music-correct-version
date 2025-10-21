from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import (
    TrackInteraction,
    MoodAccuracyFeedback,
    MoodMetrics,
    UserMoodStats,
    ModelImprovementSuggestion
)
from .serializers import (
    TrackAnalyticsSerializer,
    UserAnalyticsSerializer,
    MoodMetricsSerializer,
    TrackInteractionSerializer,
    MoodAccuracyFeedbackSerializer,
    ModelImprovementSuggestionSerializer
)
from .services import MoodAnalyticsService
import logging

logger = logging.getLogger(__name__)

class MoodAnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for mood-based music analytics.
    """
    permission_classes = [permissions.IsAuthenticated]
    analytics_service = MoodAnalyticsService()

    @action(detail=True, methods=['get'])
    def tracks(self, request, pk=None):
        """
        Get analytics for a specific track.
        """
        try:
            analytics = self.analytics_service.get_track_analytics(
                track_id=pk,
                user_id=request.user.id
            )
            if not analytics:
                return Response(
                    {'error': 'Track not found or analytics unavailable'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = TrackAnalyticsSerializer(analytics)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in track analytics: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve track analytics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def user(self, request):
        """
        Get aggregated analytics for the current user.
        """
        try:
            analytics = self.analytics_service.get_user_analytics(
                user_id=request.user.id
            )
            if not analytics:
                return Response(
                    {'error': 'User analytics unavailable'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = UserAnalyticsSerializer(analytics)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in user analytics: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve user analytics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def moods(self, request, pk=None):
        """
        Get metrics for a specific mood.
        """
        try:
            metrics = self.analytics_service.get_mood_metrics(mood_id=pk)
            if not metrics:
                return Response(
                    {'error': 'Mood metrics unavailable'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = MoodMetricsSerializer(metrics)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in mood metrics: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve mood metrics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def interaction(self, request, pk=None):
        """
        Track user interaction with a track.
        """
        try:
            success = self.analytics_service.track_interaction(
                track_id=pk,
                user_id=request.user.id,
                event=request.data
            )
            
            if not success:
                return Response(
                    {'error': 'Failed to record interaction'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({'status': 'success'})
            
        except Exception as e:
            logger.error(f"Error tracking interaction: {str(e)}")
            return Response(
                {'error': 'Failed to track interaction'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """
        Submit detailed mood feedback for a track.
        """
        try:
            success = self.analytics_service.submit_mood_feedback(
                track_id=pk,
                user_id=request.user.id,
                feedback=request.data
            )
            
            if not success:
                return Response(
                    {'error': 'Failed to submit feedback'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({'status': 'success'})
            
        except Exception as e:
            logger.error(f"Error submitting feedback: {str(e)}")
            return Response(
                {'error': 'Failed to submit feedback'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def model_suggestions(self, request):
        """
        Get AI model improvement suggestions.
        """
        try:
            suggestions = self.analytics_service.get_model_suggestions()
            serializer = ModelImprovementSuggestionSerializer(suggestions, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error getting model suggestions: {str(e)}")
            return Response(
                {'error': 'Failed to get model suggestions'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 