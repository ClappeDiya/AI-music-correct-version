from django.conf import settings
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.postgres.indexes import GinIndex

class DynamicPreference(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='preferences'
    )
    key = models.CharField(max_length=255)
    value = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'key'],
                name='unique_user_preference'
            )
        ]
        indexes = [
            GinIndex(
                fields=['value'],
                name='preference_value_gin_idx',
                opclasses=['jsonb_path_ops']
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.key}"