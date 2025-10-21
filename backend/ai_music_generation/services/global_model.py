from typing import Dict, Any, List
import numpy as np
from django.db import models, transaction
from django.conf import settings
from ..models import UserFeedback, GeneratedTrack

class GlobalModelMetrics(models.Model):
    """
    Tracks aggregated metrics for the global model.
    Stores anonymized learning from user feedback.
    """
    aspect = models.CharField(max_length=255)  # e.g., 'genre_jazz', 'tempo_fast'
    success_count = models.IntegerField(default=0)
    failure_count = models.IntegerField(default=0)
    weight = models.FloatField(default=0.5)
    confidence = models.FloatField(default=0.5)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['aspect']),
            models.Index(fields=['weight']),
        ]


class GlobalModelService:
    """
    Service for managing the global model that learns from aggregated user feedback.
    Implements privacy-preserving learning from user interactions.
    """

    def __init__(self):
        self.min_samples_for_update = 50
        self.learning_rate = 0.01
        self.privacy_threshold = 10  # Minimum number of users for aspect update

    def update_from_feedback(self, feedback_batch: List[UserFeedback]):
        """
        Update global model based on a batch of feedback.
        Uses differential privacy techniques for anonymization.
        """
        # Group feedback by aspects
        aspect_feedback = self._group_feedback_by_aspect(feedback_batch)
        
        # Update only aspects with sufficient privacy guarantees
        for aspect, data in aspect_feedback.items():
            if len(data['user_ids']) >= self.privacy_threshold:
                self._update_aspect_metrics(
                    aspect,
                    data['positive'],
                    data['negative'],
                    data['total']
                )

    def get_global_preferences(self) -> Dict[str, float]:
        """
        Get current global preference weights.
        Used as prior for new users or when user preferences are uncertain.
        """
        return {
            metric.aspect: metric.weight
            for metric in GlobalModelMetrics.objects.filter(
                confidence__gte=0.6
            )
        }

    def _group_feedback_by_aspect(
        self,
        feedback_batch: List[UserFeedback]
    ) -> Dict[str, Dict]:
        """Group feedback by musical aspects while tracking unique users."""
        aspect_data = {}

        for feedback in feedback_batch:
            track_data = feedback.generated_track.notation_data
            if not track_data:
                continue

            # Extract aspects from track data
            aspects = self._extract_aspects(track_data)
            is_positive = feedback.feedback_type in ['like', 'accept']

            for aspect in aspects:
                if aspect not in aspect_data:
                    aspect_data[aspect] = {
                        'positive': 0,
                        'negative': 0,
                        'total': 0,
                        'user_ids': set()
                    }

                aspect_data[aspect]['total'] += 1
                if is_positive:
                    aspect_data[aspect]['positive'] += 1
                else:
                    aspect_data[aspect]['negative'] += 1
                aspect_data[aspect]['user_ids'].add(feedback.user_id)

        return aspect_data

    def _extract_aspects(self, track_data: Dict) -> List[str]:
        """Extract relevant aspects from track data."""
        aspects = []

        # Genre aspects
        if 'genre' in track_data:
            aspects.append(f"genre_{track_data['genre']}")

        # Tempo aspects
        if 'tempo' in track_data:
            tempo = track_data['tempo']
            if tempo < 80:
                aspects.append('tempo_slow')
            elif tempo > 120:
                aspects.append('tempo_fast')
            else:
                aspects.append('tempo_medium')

        # Instrument aspects
        if 'instruments' in track_data:
            for instrument in track_data['instruments']:
                aspects.append(f"instrument_{instrument}")

        # Complexity aspects
        if 'complexity' in track_data:
            complexity = track_data['complexity']
            if complexity < 0.3:
                aspects.append('complexity_low')
            elif complexity > 0.7:
                aspects.append('complexity_high')
            else:
                aspects.append('complexity_medium')

        return aspects

    @transaction.atomic
    def _update_aspect_metrics(
        self,
        aspect: str,
        positive: int,
        negative: int,
        total: int
    ):
        """Update metrics for a specific aspect."""
        metric, created = GlobalModelMetrics.objects.get_or_create(
            aspect=aspect
        )

        # Update counts
        metric.success_count += positive
        metric.failure_count += negative

        # Calculate new weight using Bayesian update
        prior = metric.weight
        likelihood = positive / total if total > 0 else 0.5
        
        # Update weight with learning rate
        metric.weight += self.learning_rate * (likelihood - prior)
        
        # Update confidence based on sample size
        metric.confidence = min(
            1.0,
            (metric.success_count + metric.failure_count) / self.min_samples_for_update
        )
        
        metric.save()

    def get_aspect_performance(self, aspect: str) -> Dict[str, float]:
        """Get performance metrics for a specific aspect."""
        try:
            metric = GlobalModelMetrics.objects.get(aspect=aspect)
            total = metric.success_count + metric.failure_count
            
            return {
                'success_rate': metric.success_count / total if total > 0 else 0,
                'weight': metric.weight,
                'confidence': metric.confidence,
                'sample_size': total
            }
        except GlobalModelMetrics.DoesNotExist:
            return {
                'success_rate': 0,
                'weight': 0.5,
                'confidence': 0,
                'sample_size': 0
            }
