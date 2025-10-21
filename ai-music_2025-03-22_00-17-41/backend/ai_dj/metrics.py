from datetime import datetime, timedelta
from typing import Dict, List, Optional
from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg
from .models import AIDJSession, AIDJPlayHistory, AIDJFeedback
from .config import config

User = get_user_model()

class MetricsCollector:
    """Collects and processes usage metrics for the AI DJ module"""

    @staticmethod
    def collect_session_metrics(user_id: int, time_range: Optional[timedelta] = None) -> Dict:
        """Collect metrics for AI DJ sessions"""
        query = AIDJSession.objects.filter(user_id=user_id)
        
        if time_range:
            cutoff = datetime.now() - time_range
            query = query.filter(updated_at__gte=cutoff)
        
        return {
            'total_sessions': query.count(),
            'avg_session_duration': query.aggregate(Avg('duration'))['duration__avg'],
            'voice_commands_used': query.exclude(last_voice_command__isnull=True).count(),
        }

    @staticmethod
    def collect_playback_metrics(user_id: int, time_range: Optional[timedelta] = None) -> Dict:
        """Collect metrics for track playback"""
        query = AIDJPlayHistory.objects.filter(user_id=user_id)
        
        if time_range:
            cutoff = datetime.now() - time_range
            query = query.filter(played_at__gte=cutoff)
        
        return {
            'total_plays': query.count(),
            'unique_tracks': query.values('track').distinct().count(),
            'top_genres': list(query.values('track__genre')
                             .annotate(count=Count('track__genre'))
                             .order_by('-count')[:5]),
        }

    @staticmethod
    def collect_feedback_metrics(user_id: int, time_range: Optional[timedelta] = None) -> Dict:
        """Collect metrics for user feedback"""
        query = AIDJFeedback.objects.filter(user_id=user_id)
        
        if time_range:
            cutoff = datetime.now() - time_range
            query = query.filter(created_at__gte=cutoff)
        
        total_feedback = query.count()
        if total_feedback == 0:
            return {
                'total_feedback': 0,
                'feedback_ratio': {'likes': 0, 'dislikes': 0},
                'avg_rating': 0,
            }
        
        likes = query.filter(feedback_type='like').count()
        return {
            'total_feedback': total_feedback,
            'feedback_ratio': {
                'likes': (likes / total_feedback) * 100,
                'dislikes': ((total_feedback - likes) / total_feedback) * 100,
            },
            'avg_rating': likes / total_feedback,
        }

    @staticmethod
    def collect_mood_metrics(user_id: int, time_range: Optional[timedelta] = None) -> Dict:
        """Collect metrics for mood settings"""
        query = AIDJSession.objects.filter(user_id=user_id)
        
        if time_range:
            cutoff = datetime.now() - time_range
            query = query.filter(updated_at__gte=cutoff)
        
        mood_data = query.exclude(mood_settings__isnull=True).values_list('mood_settings', flat=True)
        
        if not mood_data:
            return {'mood_preferences': {}}
        
        # Aggregate mood preferences
        mood_preferences = {}
        for mood_settings in mood_data:
            for mood, value in mood_settings.items():
                if mood not in mood_preferences:
                    mood_preferences[mood] = []
                mood_preferences[mood].append(value)
        
        # Calculate averages
        return {
            'mood_preferences': {
                mood: sum(values) / len(values)
                for mood, values in mood_preferences.items()
            }
        }

    @classmethod
    def collect_all_metrics(cls, user_id: int, time_range: Optional[timedelta] = None) -> Dict:
        """Collect all metrics for a user"""
        if not config.METRICS.ENABLE_TRACKING:
            return {}
        
        return {
            'session_metrics': cls.collect_session_metrics(user_id, time_range),
            'playback_metrics': cls.collect_playback_metrics(user_id, time_range),
            'feedback_metrics': cls.collect_feedback_metrics(user_id, time_range),
            'mood_metrics': cls.collect_mood_metrics(user_id, time_range),
            'collected_at': datetime.now().isoformat(),
        }

    @classmethod
    def export_metrics(cls, user_id: int, start_date: datetime, end_date: datetime) -> Dict:
        """Export metrics for a specific time range"""
        if not config.METRICS.EXPORT_ENABLED:
            return {}
        
        time_range = end_date - start_date
        metrics = cls.collect_all_metrics(user_id, time_range)
        
        return {
            'user_id': user_id,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'metrics': metrics,
        }

    @classmethod
    def cleanup_old_metrics(cls) -> None:
        """Clean up metrics older than the retention period"""
        if not config.METRICS.ENABLE_TRACKING:
            return
        
        cutoff = datetime.now() - timedelta(days=config.METRICS.METRICS_RETENTION_DAYS)
        
        # Clean up old play history
        AIDJPlayHistory.objects.filter(played_at__lt=cutoff).delete()
        
        # Clean up old feedback
        AIDJFeedback.objects.filter(created_at__lt=cutoff).delete()
        
        # Clean up old sessions
        AIDJSession.objects.filter(updated_at__lt=cutoff).delete() 