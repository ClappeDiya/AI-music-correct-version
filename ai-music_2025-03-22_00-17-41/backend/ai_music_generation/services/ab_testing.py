from typing import Dict, Any, Optional
import numpy as np
from django.db import models
from django.conf import settings
from ..models import UserFeedback, GeneratedTrack

class ABTest(models.Model):
    """Model to track A/B test configurations and results."""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Test parameters
    variant_configs = models.JSONField(
        help_text="Configuration for each variant (A, B, etc.)"
    )
    
    # Results tracking
    total_impressions = models.IntegerField(default=0)
    variant_metrics = models.JSONField(
        default=dict,
        help_text="Metrics for each variant"
    )

    class Meta:
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['start_date']),
        ]


class ABTestAssignment(models.Model):
    """Tracks which variant was assigned to each user."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    test = models.ForeignKey(ABTest, on_delete=models.CASCADE)
    variant = models.CharField(max_length=50)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['user', 'test']]
        indexes = [
            models.Index(fields=['user', 'test']),
            models.Index(fields=['variant']),
        ]


class ABTestingService:
    """
    Service for managing A/B tests in the music generation system.
    Handles test assignment, tracking, and analysis.
    """

    def __init__(self):
        self.active_tests = {}
        self._load_active_tests()

    def _load_active_tests(self):
        """Load all active A/B tests."""
        for test in ABTest.objects.filter(is_active=True):
            self.active_tests[test.name] = test

    def get_variant(self, user_id: int, test_name: str) -> Optional[str]:
        """Get or assign a variant for a user in a specific test."""
        test = self.active_tests.get(test_name)
        if not test:
            return None

        # Check existing assignment
        assignment = ABTestAssignment.objects.filter(
            user_id=user_id,
            test=test
        ).first()

        if assignment:
            return assignment.variant

        # Make new assignment
        variants = list(test.variant_configs.keys())
        weights = [config.get('weight', 1) for config in test.variant_configs.values()]
        weights = np.array(weights) / sum(weights)

        chosen_variant = np.random.choice(variants, p=weights)
        ABTestAssignment.objects.create(
            user_id=user_id,
            test=test,
            variant=chosen_variant
        )

        return chosen_variant

    def record_impression(self, test_name: str, variant: str):
        """Record an impression for a specific test variant."""
        test = self.active_tests.get(test_name)
        if not test:
            return

        test.total_impressions += 1
        if variant in test.variant_metrics:
            test.variant_metrics[variant]['impressions'] += 1
        else:
            test.variant_metrics[variant] = {'impressions': 1, 'conversions': 0}
        test.save()

    def record_conversion(self, test_name: str, variant: str, feedback: UserFeedback):
        """Record a conversion (positive feedback) for a specific test variant."""
        test = self.active_tests.get(test_name)
        if not test or variant not in test.variant_metrics:
            return

        if feedback.feedback_type in ['like', 'accept']:
            test.variant_metrics[variant]['conversions'] += 1
            test.save()

    def get_test_results(self, test_name: str) -> Dict[str, Any]:
        """Get current results for a specific test."""
        test = self.active_tests.get(test_name)
        if not test:
            return {}

        results = {}
        for variant, metrics in test.variant_metrics.items():
            impressions = metrics['impressions']
            conversions = metrics['conversions']
            
            if impressions > 0:
                conversion_rate = conversions / impressions
                # Calculate confidence interval using Wilson score interval
                z = 1.96  # 95% confidence
                denominator = 1 + z**2/impressions
                center = (conversion_rate + z**2/(2*impressions))/denominator
                spread = z * np.sqrt((conversion_rate*(1-conversion_rate) + z**2/(4*impressions))/impressions)/denominator
                
                results[variant] = {
                    'impressions': impressions,
                    'conversions': conversions,
                    'conversion_rate': conversion_rate,
                    'confidence_interval': (center - spread, center + spread)
                }

        return results

    def apply_variant_config(self, variant_config: Dict[str, Any]) -> Dict[str, Any]:
        """Apply variant-specific configuration to generation parameters."""
        base_params = {
            'temperature': 0.7,
            'max_length': 1000,
            'top_p': 0.9,
            'frequency_penalty': 0.0,
            'presence_penalty': 0.0
        }
        
        # Override base params with variant-specific values
        base_params.update(variant_config.get('parameters', {}))
        return base_params
