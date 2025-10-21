from rest_framework import serializers
from .models import (
    UserSettings,
    UserSettingsHistory,
    PreferenceInheritanceLayer,
    PreferenceSuggestion,
    UserSensoryTheme,
    ContextualProfile,
    PreferenceExternalization,
    EphemeralEventPreference,
    PersonaFusion,
    TranslingualPreference,
    UniversalProfileMapping,
    BehaviorTriggeredOverlay,
    MultiUserComposite,
    PredictivePreferenceModel,
    PredictivePreferenceEvent,
)


class UserSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserSettings model.
    """
    class Meta:
        model = UserSettings
        fields = ['id', 'user', 'preferences', 'device_specific_settings', 'last_updated']
        read_only_fields = ['id', 'last_updated']

    def validate(self, data):
        """
        Ensure users can only modify their own settings.
        """
        request = self.context.get('request')
        if request and request.user:
            if 'user' in data and data['user'] != request.user:
                if not request.user.is_superuser and not request.user.is_staff:
                    raise serializers.ValidationError("You can only modify your own settings.")
        return data


class UserSettingsHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for the UserSettingsHistory model.
    """
    class Meta:
        model = UserSettingsHistory
        fields = ['id', 'user', 'old_preferences', 'changed_at']
        read_only_fields = ['id', 'changed_at']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value


class PreferenceInheritanceLayerSerializer(serializers.ModelSerializer):
    """
    Serializer for the PreferenceInheritanceLayer model.
    """
    class Meta:
        model = PreferenceInheritanceLayer
        fields = ['id', 'user', 'layer_type', 'layer_reference', 'priority']
        read_only_fields = ['id']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value


class PreferenceSuggestionSerializer(serializers.ModelSerializer):
    """
    Serializer for the PreferenceSuggestion model.
    """
    class Meta:
        model = PreferenceSuggestion
        fields = ['id', 'user', 'suggestion_data', 'suggested_at']
        read_only_fields = ['id', 'suggested_at']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value


class UserSensoryThemeSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserSensoryTheme model.
    """
    class Meta:
        model = UserSensoryTheme
        fields = ['id', 'user', 'sensory_mappings', 'updated_at']
        read_only_fields = ['id', 'updated_at']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value


class ContextualProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the ContextualProfile model.
    """
    class Meta:
        model = ContextualProfile
        fields = ['id', 'user', 'trigger_conditions', 'profile_adjustments']
        read_only_fields = ['id']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value


class PreferenceExternalizationSerializer(serializers.ModelSerializer):
    """
    Serializer for the PreferenceExternalization model.
    """
    class Meta:
        model = PreferenceExternalization
        fields = [
            'id', 'service_name', 'description', 'active', 
            'endpoint_url', 'sync_frequency', 'last_sync',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_sync']

    def validate_sync_frequency(self, value):
        if value < 5:  # Minimum 5 minutes
            raise serializers.ValidationError(
                "Sync frequency must be at least 5 minutes"
            )
        return value


class EphemeralEventPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for the EphemeralEventPreference model.
    """
    class Meta:
        model = EphemeralEventPreference
        fields = [
            'id', 'event_type', 'active', 'duration_minutes',
            'priority', 'next_scheduled', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_duration_minutes(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Duration must be at least 1 minute"
            )
        return value


class PersonaFusionSerializer(serializers.ModelSerializer):
    """
    Serializer for the PersonaFusion model.
    """
    class Meta:
        model = PersonaFusion
        fields = ['id', 'user', 'source_personas', 'fused_profile', 'created_at']
        read_only_fields = ['id', 'created_at']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value


class TranslingualPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for the TranslingualPreference model.
    """
    class Meta:
        model = TranslingualPreference
        fields = ['id', 'user', 'universal_preference_profile', 'updated_at']
        read_only_fields = ['id', 'updated_at']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value


class UniversalProfileMappingSerializer(serializers.ModelSerializer):
    """
    Serializer for the UniversalProfileMapping model.
    """
    class Meta:
        model = UniversalProfileMapping
        fields = ['id', 'user', 'external_profile_format', 'mapping_data', 'updated_at']
        read_only_fields = ['id', 'updated_at']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value


class BehaviorTriggeredOverlaySerializer(serializers.ModelSerializer):
    """
    Serializer for the BehaviorTriggeredOverlay model.
    """
    class Meta:
        model = BehaviorTriggeredOverlay
        fields = [
            'id', 'name', 'active', 'trigger_conditions', 
            'overlay_config', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_trigger_conditions(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Trigger conditions must be a dictionary")
        return value

    def validate_overlay_config(self, value):
        required_fields = {'opacity', 'animation_type'}
        if not isinstance(value, dict):
            raise serializers.ValidationError("Overlay config must be a dictionary")
        if not all(field in value for field in required_fields):
            raise serializers.ValidationError(
                f"Overlay config must contain all required fields: {required_fields}"
            )
        return value


class MultiUserCompositeSerializer(serializers.ModelSerializer):
    """
    Serializer for the MultiUserComposite model.
    """
    class Meta:
        model = MultiUserComposite
        fields = ['id', 'participant_user_ids', 'composite_prefs', 'created_at']
        read_only_fields = ['id', 'created_at']


class PredictivePreferenceModelSerializer(serializers.ModelSerializer):
    """
    Serializer for the PredictivePreferenceModel model.
    """
    class Meta:
        model = PredictivePreferenceModel
        fields = ['id', 'user', 'model_metadata']
        read_only_fields = ['id']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value


class PredictivePreferenceEventSerializer(serializers.ModelSerializer):
    """
    Serializer for the PredictivePreferenceEvent model.
    """
    class Meta:
        model = PredictivePreferenceEvent
        fields = ['id', 'user', 'applied_changes', 'applied_at', 'reason']
        read_only_fields = ['id', 'applied_at']
        
    def validate_user(self, value):
        """
        Validates that the user exists within the current tenant's schema.
        """
        self.validate_tenant_user(value)
        return value
