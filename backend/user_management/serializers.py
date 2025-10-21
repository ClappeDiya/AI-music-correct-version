from rest_framework import serializers
from .models import (
    User,
    SubscriptionPlan,
    FeatureFlag,
    UserSubscription,
    SubscriptionHistory,
    EnvironmentSnapshot,
    ComplianceProfile,
    UserComplianceEvent,
    UserIdentityBridge,
    UsageForecast,
    UserTranslation,
    UserProfile,
    ProfileFusion,
    ProfileHistory
)

class UserIdentityBridgeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = UserIdentityBridge
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        
    def validate_config_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Config data must be a JSON object")
        return value

class UserTranslationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    reviewed_by = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = UserTranslation
        fields = ['id', 'user', 'original_text', 'translated_text',
                 'target_language', 'status', 'notes', 'created_at',
                 'updated_at', 'reviewed_by', 'review_notes']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in UserTranslation.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {valid_statuses}")
        return value
        
    def create(self, validated_data):
        # Set the current user automatically
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class UsageForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageForecast
        fields = '__all__'
        read_only_fields = ['forecast_date', 'last_updated']

class UserSubscriptionSerializer(serializers.ModelSerializer):
    forecasts = UsageForecastSerializer(many=True, read_only=True)
    scaling_history = serializers.JSONField(read_only=True)
    current_usage = serializers.JSONField(read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = [
            'id', 'user', 'plan', 'start_date', 'end_date',
            'is_active', 'current_usage', 'last_usage_check',
            'auto_scaling_enabled', 'scaling_history', 'forecasts'
        ]

class FeatureFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureFlag
        fields = '__all__'

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class SubscriptionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionHistory
        fields = '__all__'
        read_only_fields = ('created_at',)

class UserSerializer(serializers.ModelSerializer):
    current_subscription = UserSubscriptionSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'date_joined',
            'current_subscription'
        ]
        read_only_fields = ('id', 'date_joined', 'is_staff')

class EnvironmentSnapshotSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = EnvironmentSnapshot
        fields = '__all__'
        read_only_fields = ('created_at', 'is_encrypted', 'encryption_key')
        
    def validate_snapshot_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Snapshot data must be a JSON object")
        return value
        
    def create(self, validated_data):
        # Set the current user automatically
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ComplianceProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceProfile
        fields = '__all__'
        read_only_fields = ('last_updated',)

class UserComplianceEventSerializer(serializers.ModelSerializer):
    compliance_profile = serializers.PrimaryKeyRelatedField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = UserComplianceEvent
        fields = '__all__'
        read_only_fields = ('event_date',)
        
    def create(self, validated_data):
        # Set the current user and compliance profile automatically
        validated_data['user'] = self.context['request'].user
        validated_data['compliance_profile'] = self.context['request'].user.compliance_profile
        return super().create(validated_data)

class UserIdentityBridgeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = UserIdentityBridge
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        
    def validate_config_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Config data must be a JSON object")
        return value
        
    def create(self, validated_data):
        # Set the current user automatically
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        
    def validate_settings(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Settings must be a JSON object")
        return value
        
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ProfileFusionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    source_profiles = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=UserProfile.objects.all()
    )
    result_profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = ProfileFusion
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'status')
        
    def validate_fusion_parameters(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Fusion parameters must be a JSON object")
        return value
        
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ProfileHistorySerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = ProfileHistory
        fields = '__all__'
        read_only_fields = ('created_at',)
        
    def validate_settings_snapshot(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Settings snapshot must be a JSON object")
        return value
        
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

# Update UserSerializer to include compliance_profile
class UserSerializer(serializers.ModelSerializer):
    current_subscription = UserSubscriptionSerializer(read_only=True)
    compliance_profile = ComplianceProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'date_joined',
            'current_subscription',
            'compliance_profile'
        ]
        read_only_fields = ('id', 'date_joined', 'is_staff')
