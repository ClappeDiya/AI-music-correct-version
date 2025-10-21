from django.db import models
from django.conf import settings


class IdentityBridge(models.Model):
    """Bridge between user identity and external services."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='identity_bridges'
    )
    service_name = models.CharField(max_length=100)
    external_id = models.CharField(max_length=255)
    access_token = models.CharField(max_length=512)
    refresh_token = models.CharField(max_length=512, blank=True, null=True)
    token_expires_at = models.DateTimeField(null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'service_name', 'external_id']
        indexes = [
            models.Index(fields=['user', 'service_name']),
            models.Index(fields=['external_id']),
        ]


class IdentityVerification(models.Model):
    """Track identity verification status and methods."""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='identity_verification'
    )
    is_verified = models.BooleanField(default=False)
    verification_method = models.CharField(
        max_length=50,
        choices=[
            ('email', 'Email Verification'),
            ('phone', 'Phone Verification'),
            ('document', 'Document Verification'),
            ('two_factor', 'Two-Factor Authentication'),
        ]
    )
    verified_at = models.DateTimeField(null=True)
    verification_data = models.JSONField(default=dict)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'is_verified']),
        ]


class LoginSession(models.Model):
    """Track user login sessions across devices."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='login_sessions'
    )
    session_id = models.CharField(max_length=100, unique=True)
    device_info = models.JSONField()
    ip_address = models.GenericIPAddressField()
    started_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['session_id']),
        ]
