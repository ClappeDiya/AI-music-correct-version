from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Recommendation(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='recommendations_received'
    )
    target_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='recommendations_given'
    )
    score = models.FloatField(
        help_text='Collaborative filtering score'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'target_user')
        ordering = ['-score']
        indexes = [
            models.Index(fields=['created_at'], name='recommendation_created_at_idx'),
            models.Index(fields=['score'], name='recommendation_score_idx'),
            models.Index(fields=['user'], name='recommendation_user_idx'),
            models.Index(fields=['target_user'], name='recommendation_target_user_idx'),
            models.Index(fields=['user', 'created_at'], name='rec_user_created_idx'),
            models.Index(fields=['target_user', 'created_at'], name='rec_target_created_idx')
        ]

    def __str__(self):
        return f'{self.user} -> {self.target_user} ({self.score})'

class DynamicPreference(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True
    )
    preferences = models.JSONField(default=dict)

    def __str__(self):
        return f'Preferences for {self.user}'

class ThemePreference(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True
    )
    theme = models.CharField(max_length=50, default='light')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user} theme: {self.theme}'