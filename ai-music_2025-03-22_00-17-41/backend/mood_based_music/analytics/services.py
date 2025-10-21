from django.db.models import Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from .models import (
    TrackInteraction,
    MoodAccuracyFeedback,
    MoodMetrics,
    UserMoodStats,
    ModelImprovementSuggestion
)
from ..models import GeneratedMoodTrack, Mood
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class MoodAnalyticsService:
    @staticmethod
    def get_track_analytics(track_id: str, user_id: int) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a specific track.
        """
        try:
            track = GeneratedMoodTrack.objects.get(id=track_id)
            
            # Get interaction metrics
            interactions = TrackInteraction.objects.filter(track=track)
            metrics = {
                'play_count': interactions.filter(interaction_type='play').count(),
                'skip_count': interactions.filter(interaction_type='skip').count(),
                'completion_rate': interactions.filter(interaction_type='complete').count() / max(interactions.count(), 1),
                'replay_rate': interactions.filter(interaction_type='replay').count() / max(interactions.count(), 1),
                'average_play_duration': interactions.filter(interaction_type='play').aggregate(Avg('duration'))['duration__avg'] or 0
            }
            
            # Get feedback
            feedback = MoodAccuracyFeedback.objects.filter(track=track)
            
            # Calculate mood accuracy
            mood_accuracy = {
                'intended': {
                    'mood_id': track.mood_request.selected_mood.id if track.mood_request.selected_mood else None,
                    'mood_name': track.mood_request.selected_mood.name if track.mood_request.selected_mood else None,
                    'intensity': float(track.mood_request.intensity) if track.mood_request.intensity else None
                },
                'perceived': {
                    'mood_id': track.mood_request.selected_mood.id if track.mood_request.selected_mood else None,
                    'mood_name': track.mood_request.selected_mood.name if track.mood_request.selected_mood else None,
                    'intensity': feedback.aggregate(Avg('perceived_intensity'))['perceived_intensity__avg'] or 0,
                    'confidence': feedback.aggregate(Avg('accuracy_rating'))['accuracy_rating__avg'] or 0
                }
            }
            
            return {
                'track_id': track_id,
                'metrics': metrics,
                'feedback': feedback,
                'mood_accuracy': mood_accuracy
            }
            
        except GeneratedMoodTrack.DoesNotExist:
            logger.error(f"Track {track_id} not found")
            return None
        except Exception as e:
            logger.error(f"Error getting track analytics: {str(e)}")
            return None

    @staticmethod
    def get_user_analytics(user_id: int) -> Dict[str, Any]:
        """
        Get aggregated analytics for a user.
        """
        try:
            # Get or create user stats
            stats, _ = UserMoodStats.objects.get_or_create(user_id=user_id)
            
            # Get favorite moods
            thirty_days_ago = timezone.now() - timedelta(days=30)
            favorite_moods = (
                GeneratedMoodTrack.objects.filter(
                    mood_request__user_id=user_id,
                    created_at__gte=thirty_days_ago
                )
                .values('mood_request__selected_mood')
                .annotate(
                    usage_count=Count('id'),
                    success_rate=Avg('moodaccuracyfeedback__accuracy_rating')
                )
                .order_by('-usage_count')[:5]
            )
            
            # Get recent feedback
            recent_feedback = MoodAccuracyFeedback.objects.filter(
                user_id=user_id
            ).select_related('track').order_by('-created_at')[:10]
            
            # Get improvement suggestions
            suggestions = ModelImprovementSuggestion.objects.filter(
                mood__in=[m['mood_request__selected_mood'] for m in favorite_moods]
            ).order_by('-confidence')[:5]
            
            return {
                'total_tracks': stats.total_tracks,
                'favorite_moods': favorite_moods,
                'mood_accuracy': stats.mood_accuracy,
                'recent_feedback': recent_feedback,
                'improvement_suggestions': suggestions
            }
            
        except Exception as e:
            logger.error(f"Error getting user analytics: {str(e)}")
            return None

    @staticmethod
    def get_mood_metrics(mood_id: int) -> Dict[str, Any]:
        """
        Get performance metrics for a specific mood.
        """
        try:
            metrics, _ = MoodMetrics.objects.get_or_create(mood_id=mood_id)
            return {
                'mood_id': mood_id,
                'accuracy_score': float(metrics.average_accuracy),
                'total_feedback': metrics.total_feedback,
                'common_issues': metrics.common_issues
            }
        except Exception as e:
            logger.error(f"Error getting mood metrics: {str(e)}")
            return None

    @staticmethod
    @transaction.atomic
    def track_interaction(track_id: str, user_id: int, event: Dict[str, Any]) -> bool:
        """
        Record a user interaction with a track.
        """
        try:
            TrackInteraction.objects.create(
                track_id=track_id,
                user_id=user_id,
                interaction_type=event['type'],
                duration=event.get('duration')
            )
            return True
        except Exception as e:
            logger.error(f"Error tracking interaction: {str(e)}")
            return False

    @staticmethod
    @transaction.atomic
    def submit_mood_feedback(track_id: str, user_id: int, feedback: Dict[str, Any]) -> bool:
        """
        Submit detailed feedback about mood accuracy.
        """
        try:
            # Create feedback record
            MoodAccuracyFeedback.objects.create(
                track_id=track_id,
                user_id=user_id,
                accuracy_rating=feedback['accuracy_rating'],
                perceived_intensity=feedback['perceived_intensity'],
                issues=feedback.get('issues', []),
                notes=feedback.get('notes')
            )
            
            # Update mood metrics
            track = GeneratedMoodTrack.objects.get(id=track_id)
            if track.mood_request.selected_mood:
                metrics, _ = MoodMetrics.objects.get_or_create(
                    mood=track.mood_request.selected_mood
                )
                metrics.total_feedback += 1
                metrics.average_accuracy = (
                    (metrics.average_accuracy * (metrics.total_feedback - 1) + 
                     float(feedback['accuracy_rating'])) / metrics.total_feedback
                )
                
                # Update common issues
                if feedback.get('issues'):
                    issues = metrics.common_issues or {}
                    for issue in feedback['issues']:
                        issues[issue] = issues.get(issue, 0) + 1
                    metrics.common_issues = issues
                
                metrics.save()
            
            return True
        except Exception as e:
            logger.error(f"Error submitting feedback: {str(e)}")
            return False

    @staticmethod
    def get_model_suggestions() -> List[Dict[str, Any]]:
        """
        Get AI model improvement suggestions.
        """
        try:
            return ModelImprovementSuggestion.objects.select_related('mood').order_by(
                '-confidence'
            ).values(
                'mood_id',
                'mood__name',
                'current_accuracy',
                'improvement_areas'
            )[:10]
        except Exception as e:
            logger.error(f"Error getting model suggestions: {str(e)}")
            return [] 