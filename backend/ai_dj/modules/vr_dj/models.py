from django.db import models
from django.conf import settings
from ai_dj.models import AIDJSession


class VRDJSession(models.Model):
    """Represents a VR DJ session with its configuration and state."""
    
    session = models.OneToOneField(
        AIDJSession,
        on_delete=models.CASCADE,
        related_name='vr_session'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vr_dj_sessions'
    )
    environment_type = models.CharField(
        max_length=20,
        choices=[
            ('club', 'Night Club'),
            ('festival', 'Festival Stage'),
            ('studio', 'Professional Studio'),
            ('custom', 'Custom Environment')
        ],
        default='club'
    )
    is_collaborative = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']


class VRDJControl(models.Model):
    """Represents real-time VR DJ control data."""
    
    session = models.ForeignKey(
        VRDJSession,
        on_delete=models.CASCADE,
        related_name='controls'
    )
    control_type = models.CharField(
        max_length=30,
        choices=[
            ('turntable_left', 'Left Turntable'),
            ('turntable_right', 'Right Turntable'),
            ('crossfader', 'Crossfader'),
            ('eq_high', 'High EQ'),
            ('eq_mid', 'Mid EQ'),
            ('eq_low', 'Low EQ'),
            ('effect', 'Effect Control')
        ]
    )
    value = models.FloatField()  # Normalized value between 0 and 1
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']


class VRDJEnvironment(models.Model):
    """Custom VR environment configuration."""
    
    session = models.ForeignKey(
        VRDJSession,
        on_delete=models.CASCADE,
        related_name='environments'
    )
    name = models.CharField(max_length=100)
    scene_data = models.JSONField()  # Stores 3D scene configuration
    lighting_preset = models.CharField(
        max_length=20,
        choices=[
            ('ambient', 'Ambient'),
            ('dynamic', 'Dynamic'),
            ('reactive', 'Music Reactive'),
            ('custom', 'Custom')
        ],
        default='dynamic'
    )
    crowd_simulation = models.BooleanField(default=True)
    visual_effects = models.JSONField(default=dict)  # Stores visual effect settings
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


class VRDJInteraction(models.Model):
    """Records user interactions with VR elements for AI learning."""
    
    session = models.ForeignKey(
        VRDJSession,
        on_delete=models.CASCADE,
        related_name='interactions'
    )
    interaction_type = models.CharField(
        max_length=30,
        choices=[
            ('deck_manipulation', 'Deck Manipulation'),
            ('effect_trigger', 'Effect Trigger'),
            ('environment_change', 'Environment Change'),
            ('ai_suggestion_response', 'AI Suggestion Response')
        ]
    )
    details = models.JSONField()  # Stores detailed interaction data
    success_rating = models.FloatField(null=True)  # User feedback if available
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
