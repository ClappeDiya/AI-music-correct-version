from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser, Group, Permission
from .mixins import UserResourceMixin

class User(AbstractUser):
    id = models.BigAutoField(primary_key=True)
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        help_text=_('The groups this user belongs to.'),
        related_name='custom_user_set',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name='custom_user_set',
        related_query_name='user',
    )
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('fr', 'Français'),
        ('es', 'Español'),
        ('de', 'Deutsch'),
        ('zh', '中文')
    ]
    language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default='en',
        help_text=_('User interface language preference')
    )

class SubscriptionPlan(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField(default=30)
    features = models.TextField()

    def __str__(self):
        return self.name

class FeatureFlag(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    enabled_for_all = models.BooleanField(default=False)
    enabled_plans = models.ManyToManyField(SubscriptionPlan, blank=True)

    def __str__(self):
        return self.name

class UsageForecast(models.Model):
    id = models.BigAutoField(primary_key=True)
    """Stores predictive usage analytics for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    forecast_date = models.DateField()
    predicted_usage = models.JSONField()
    confidence_level = models.FloatField()
    recommended_action = models.CharField(max_length=100)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-forecast_date']
        indexes = [
            models.Index(fields=['user', 'forecast_date']),
        ]
        verbose_name = 'Usage Forecast'
        verbose_name_plural = 'Usage Forecasts'

    def __str__(self):
        return f"{self.user.username} - {self.forecast_date}"

class UserSubscription(UserResourceMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    current_usage = models.JSONField(default=dict)
    last_usage_check = models.DateTimeField(null=True, blank=True)
    auto_scaling_enabled = models.BooleanField(default=True)
    scaling_history = models.JSONField(default=list)

    def __str__(self):
        return f"{self.user.username} - {self.plan.name}"

    @classmethod
    def get_staff_viewable(cls, user):
        # Staff can view subscriptions based on their role
        if user.has_perm('user_management.view_all_subscriptions'):
            return cls.objects.all()
        return cls.objects.filter(is_active=True)

class SubscriptionHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    change_date = models.DateTimeField(default=timezone.now)
    CHANGE_TYPES = [
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('CANCELLED', 'Cancelled'),
        ('RENEWED', 'Renewed'),
    ]
    change_type = models.CharField(max_length=10, choices=CHANGE_TYPES, default='CREATED')

    def __str__(self):
        return f"{self.subscription} - {self.change_type}"

class EnvironmentSnapshot(UserResourceMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    """Stores user environment snapshots for restoration"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    snapshot_data = models.JSONField()
    is_encrypted = models.BooleanField(default=False)
    encryption_key = models.CharField(max_length=255, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.created_at}"

    @classmethod
    def get_user_viewable(cls, user):
        # Users can see their own snapshots and public snapshots
        return cls.objects.filter(
            models.Q(user=user) |
            models.Q(is_public=True)
        )

class ComplianceProfile(models.Model):
    id = models.BigAutoField(primary_key=True)
    """Stores region-specific compliance rules and policies"""
    region_code = models.CharField(max_length=10, unique=True)
    policy_name = models.CharField(max_length=255)
    policy_version = models.CharField(max_length=50)
    effective_date = models.DateField()
    data_retention_days = models.PositiveIntegerField()
    requires_consent = models.BooleanField(default=True)
    consent_text = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['region_code']
        indexes = [
            models.Index(fields=['region_code', 'is_active']),
        ]
        verbose_name = 'Compliance Profile'
        verbose_name_plural = 'Compliance Profiles'

    def __str__(self):
        return f"{self.region_code} - {self.policy_name} v{self.policy_version}"

class UserComplianceEvent(models.Model):
    id = models.BigAutoField(primary_key=True)
    """Tracks compliance-related events for audit purposes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    event_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    compliance_profile = models.ForeignKey(ComplianceProfile, on_delete=models.CASCADE)
    metadata = models.JSONField(blank=True, null=True)
    
    class Meta:
        ordering = ['-event_date']
        indexes = [
            models.Index(fields=['user', 'event_date']),
            models.Index(fields=['compliance_profile', 'event_date']),
        ]
        verbose_name = 'User Compliance Event'
        verbose_name_plural = 'User Compliance Events'

    def __str__(self):
        return f"{self.user.username} - {self.event_type} - {self.event_date}"

# Add compliance profile reference to User model
User.add_to_class('compliance_profile', models.ForeignKey(
    ComplianceProfile,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='users'
))

class UserIdentityBridge(models.Model):
    id = models.BigAutoField(primary_key=True)
    """Stores configurations linking user accounts to external identity frameworks"""
    IDENTITY_TYPES = [
        ('SSO', 'Single Sign-On'),
        ('BLOCKCHAIN', 'Blockchain-based ID'),
        ('OAUTH', 'OAuth Provider'),
        ('CUSTOM', 'Custom Identity Provider')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='identity_bridges')
    identity_type = models.CharField(max_length=20, choices=IDENTITY_TYPES)
    provider_name = models.CharField(max_length=100)
    is_enabled = models.BooleanField(default=False)
    config_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Identity Bridge'
        verbose_name_plural = 'User Identity Bridges'
        indexes = [
            models.Index(fields=['user', 'identity_type']),
            models.Index(fields=['is_enabled']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'identity_type', 'provider_name'],
                name='unique_user_identity'
            )
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_identity_type_display()} ({self.provider_name})"

def get_default_settings():
    return {
        'listening_habits': {
            'preferred_times': [],
            'session_duration': 0,
            'favorite_genres': []
        },
        'genre_preferences': {
            'primary': [],
            'secondary': [],
            'excluded': []
        },
        'creative_outputs': {
            'created_playlists': 0,
            'shared_content': 0,
            'collaborations': 0
        }
    }

class UserProfile(UserResourceMixin, models.Model):
    """Stores individual preference profiles for users"""
    PROFILE_TYPES = [
        ('CASUAL', 'Casual Listening'),
        ('PRO', 'Professional DJ Mode'),
        ('CUSTOM', 'Custom Profile')
    ]
    
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPES, default='CASUAL')
    name = models.CharField(max_length=100)
    is_public = models.BooleanField(default=False)
    settings = models.JSONField(default=get_default_settings)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    collaborative_filtering_enabled = models.BooleanField(
        default=True,
        help_text=_('Enable collaborative filtering for this profile')
    )
    similar_users = models.JSONField(default=dict, blank=True)

    @classmethod
    def default_profile_settings(cls):
        return get_default_settings()

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        indexes = [
            models.Index(fields=['user', 'profile_type']),
            models.Index(fields=['is_active']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'name'],
                name='unique_profile_name'
            )
        ]

    def __str__(self):
        return f"{self.user.get_full_name()}'s {self.profile_type} Profile"

class ProfileFusion(models.Model):
    id = models.BigAutoField(primary_key=True)
    """Tracks persona fusion operations and results"""
    FUSION_STATUS = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fusions')
    source_profiles = models.ManyToManyField(UserProfile, related_name='source_fusions')
    result_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='result_fusion')
    fusion_parameters = models.JSONField()
    status = models.CharField(max_length=20, choices=FUSION_STATUS, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Profile Fusion'
        verbose_name_plural = 'Profile Fusions'
        indexes = [
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Fusion {self.id}"

class ProfileHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    """Maintains version history for profile rollback"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profile_history')
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='history')
    version = models.PositiveIntegerField()
    settings_snapshot = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Profile History'
        verbose_name_plural = 'Profile Histories'
        indexes = [
            models.Index(fields=['user', 'profile', 'version']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['profile', 'version'],
                name='unique_profile_version'
            )
        ]
    
    def __str__(self):
        return f"{self.profile.name} - v{self.version}"

class UserTranslation(models.Model):
    id = models.BigAutoField(primary_key=True)
    """Stores user-submitted translations"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('MERGED', 'Merged')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='translations')
    original_text = models.TextField()
    translated_text = models.TextField()
    target_language = models.CharField(max_length=2, choices=User.LANGUAGE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_translations')
    review_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'User Translation'
        verbose_name_plural = 'User Translations'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['target_language', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'original_text', 'target_language'],
                name='unique_user_translation'
            )
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.target_language} - {self.status}"

class UserInteraction(models.Model):
    id = models.BigAutoField(primary_key=True)
    """Tracks user interactions for collaborative filtering"""
    INTERACTION_TYPES = [
        ('LIKE', 'Like'),
        ('FOLLOW', 'Follow'), 
        ('PLAY', 'Play'),
        ('SHARE', 'Share'),
        ('DOWNLOAD', 'Download')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_interactions', null=True, blank=True)
    target_content = models.CharField(max_length=100, null=True, blank=True)
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    timestamp = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'interaction_type']),
            models.Index(fields=['target_user', 'interaction_type']),
            models.Index(fields=['target_content', 'interaction_type'])
        ]
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.user.username} - {self.get_interaction_type_display()}"
