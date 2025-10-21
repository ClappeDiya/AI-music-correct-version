from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import (
    VREnvironmentConfig,
    CollaborationSession,
    CollaborationActivityLog,
    AIPluginRegistry,
    UserStyleProfile,
    DeviceIntegrationConfig,
    BiofeedbackDataLog,
    ThirdPartyIntegration,
    MiniAppRegistry,
    UserFeedbackLog,
    FeatureRoadmap,
    MicroserviceRegistry,
    MicrofluidicInstrumentConfig,
    DimensionalityModel,
    AIAgentPartnership,
    SynestheticMapping,
    SemanticLayer,
    PipelineEvolutionLog,
    InterstellarLatencyConfig,
    DAWControlState,
    VRInteractionLog,
    CommunicationChannel,
    ChatMessage,
    CallParticipant,
    AIPlugin,
    AISuggestion,
    UserPluginPreference,
    WearableDevice,
    BiofeedbackData,
    BiofeedbackEvent,
    NeuralDevice,
    NeuralSignal,
    NeuralControl,
)
from .models.feedback import FeatureRequest, FeatureRequestVote, FeatureSurvey, SurveyResponse


class BaseSecureSerializer(serializers.ModelSerializer):
    """
    Base serializer with user-specific security features.
    """
    created_by = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def validate(self, data):
        """
        Add user-specific validation.
        """
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError(_("User context is required"))
        return data


class VREnvironmentConfigSerializer(BaseSecureSerializer):
    """
    Serializer for VR environment configurations with security controls.
    """
    class Meta:
        model = VREnvironmentConfig
        fields = ['id', 'environment_name', 'spatial_audio_settings', 'haptic_profiles',
                 'interactive_3d_instruments', 'access_level', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_access_level(self, value):
        user = self.context['request'].user
        if value == 'public' and not user.has_perm('future_capabilities.share_environment'):
            raise serializers.ValidationError(_("You don't have permission to create public environments"))
        return value


class CollaborationSessionSerializer(BaseSecureSerializer):
    """
    Serializer for collaboration sessions with access control.
    """
    class Meta:
        model = CollaborationSession
        fields = ['id', 'session_name', 'participant_user_ids', 'track_ref', 'active',
                 'session_type', 'moderators', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user
        
        # Ensure creator is in participants
        if 'participant_user_ids' in data:
            if user.id not in data['participant_user_ids']:
                data['participant_user_ids'].append(user.id)

        # Validate session type permissions
        if data.get('session_type') == 'public' and not user.has_perm('future_capabilities.create_public_session'):
            raise serializers.ValidationError(_("You don't have permission to create public sessions"))

        return data


class CollaborationActivityLogSerializer(BaseSecureSerializer):
    """
    Serializer for collaboration activity logs with user validation.
    """
    class Meta:
        model = CollaborationActivityLog
        fields = ['id', 'session', 'user_id', 'action_detail', 'action_type',
                 'created_by', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user
        
        # Ensure users can only log their own actions
        if data.get('user_id') and data['user_id'] != user.id:
            raise serializers.ValidationError(_("You can only log your own actions"))

        # Validate action type permissions
        if data.get('action_type') == 'moderate' and not user.has_perm('future_capabilities.moderate_session'):
            raise serializers.ValidationError(_("You don't have permission to log moderation actions"))

        return data


class AIPluginRegistrySerializer(BaseSecureSerializer):
    """
    Serializer for AI plugins with security validation.
    """
    class Meta:
        model = AIPluginRegistry
        fields = ['id', 'plugin_name', 'plugin_description', 'plugin_parameters',
                 'version', 'access_level', 'approved', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'approved', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate access level permissions
        if data.get('access_level') == 'restricted' and not user.has_perm('future_capabilities.manage_restricted_plugins'):
            raise serializers.ValidationError(_("You don't have permission to create restricted plugins"))

        return data


class UserStyleProfileSerializer(BaseSecureSerializer):
    """
    Serializer for user style profiles with privacy controls.
    """
    class Meta:
        model = UserStyleProfile
        fields = ['id', 'user', 'style_data', 'privacy_level', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Ensure users can only modify their own profiles
        if data.get('user') and data['user'].id != user.id:
            raise serializers.ValidationError(_("You can only modify your own style profile"))

        return data


class DeviceIntegrationConfigSerializer(BaseSecureSerializer):
    """
    Serializer for device integrations with security level validation.
    """
    class Meta:
        model = DeviceIntegrationConfig
        fields = ['id', 'user', 'device_type', 'device_metadata', 'status',
                 'security_level', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate security level permissions
        if data.get('security_level') == 'high' and not user.has_perm('future_capabilities.manage_high_security_devices'):
            raise serializers.ValidationError(_("You don't have permission to configure high-security devices"))

        return data


class BiofeedbackDataLogSerializer(BaseSecureSerializer):
    """
    Serializer for biofeedback data with privacy controls.
    """
    class Meta:
        model = BiofeedbackDataLog
        fields = ['id', 'user', 'data_points', 'data_type', 'privacy_level', 
                 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Ensure users can only log their own data
        if data.get('user') and data['user'].id != user.id:
            raise serializers.ValidationError(_("You can only log your own biofeedback data"))

        # Validate privacy level permissions
        if data.get('privacy_level') == 'research' and not user.has_perm('future_capabilities.share_research_data'):
            raise serializers.ValidationError(_("You don't have permission to share data for research"))

        return data


class ThirdPartyIntegrationSerializer(BaseSecureSerializer):
    """
    Serializer for third-party integrations with security validation.
    """
    class Meta:
        model = ThirdPartyIntegration
        fields = ['id', 'partner_name', 'integration_details', 'integration_type',
                 'status', 'security_level', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate security level permissions
        if data.get('security_level') == 'critical' and not user.has_perm('future_capabilities.manage_critical_integrations'):
            raise serializers.ValidationError(_("You don't have permission to create critical integrations"))

        return data


class MiniAppRegistrySerializer(BaseSecureSerializer):
    """
    Serializer for mini-apps with security audit controls.
    """
    class Meta:
        model = MiniAppRegistry
        fields = ['id', 'app_name', 'developer', 'app_description', 'capabilities',
                 'status', 'security_audit_status', 'access_level', 'created_by',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'security_audit_status', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Ensure developers can only create apps for themselves
        if data.get('developer') and data['developer'].id != user.id:
            raise serializers.ValidationError(_("You can only register apps as yourself"))

        # Validate access level permissions
        if data.get('access_level') == 'beta' and not user.has_perm('future_capabilities.manage_beta_apps'):
            raise serializers.ValidationError(_("You don't have permission to create beta apps"))

        return data


class UserFeedbackLogSerializer(BaseSecureSerializer):
    """
    Serializer for user feedback with priority controls.
    """
    class Meta:
        model = UserFeedbackLog
        fields = ['id', 'user', 'feedback_type', 'feedback_content', 'priority',
                 'status', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Ensure users can only submit feedback for themselves
        if data.get('user') and data['user'].id != user.id:
            raise serializers.ValidationError(_("You can only submit feedback for yourself"))

        # Validate priority level permissions
        if data.get('priority') == 'critical' and not user.has_perm('future_capabilities.submit_critical_feedback'):
            raise serializers.ValidationError(_("You don't have permission to submit critical priority feedback"))

        return data


class FeatureRoadmapSerializer(BaseSecureSerializer):
    """
    Serializer for feature roadmap with visibility controls.
    """
    class Meta:
        model = FeatureRoadmap
        fields = ['id', 'feature_name', 'status', 'influence_data', 'priority_level',
                 'visibility', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate visibility permissions
        if data.get('visibility') == 'public' and not user.has_perm('future_capabilities.publish_roadmap_features'):
            raise serializers.ValidationError(_("You don't have permission to create public roadmap features"))

        # Validate priority level permissions
        if data.get('priority_level') == 'critical' and not user.has_perm('future_capabilities.set_critical_priority'):
            raise serializers.ValidationError(_("You don't have permission to set critical priority"))

        return data


class MicroserviceRegistrySerializer(BaseSecureSerializer):
    """
    Serializer for microservices with security classification.
    """
    class Meta:
        model = MicroserviceRegistry
        fields = ['id', 'service_name', 'service_config', 'status',
                 'security_classification', 'health_check_enabled', 'created_by',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate security classification permissions
        if data.get('security_classification') == 'critical' and not user.has_perm('future_capabilities.manage_critical_services'):
            raise serializers.ValidationError(_("You don't have permission to create critical services"))

        return data


class MicrofluidicInstrumentConfigSerializer(BaseSecureSerializer):
    """
    Serializer for microfluidic instruments with access level controls.
    """
    class Meta:
        model = MicrofluidicInstrumentConfig
        fields = ['id', 'instrument_name', 'fluidic_params', 'hybrid_control_mappings',
                 'operational_status', 'access_level', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'operational_status', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate access level permissions
        if data.get('access_level') == 'expert' and not user.has_perm('future_capabilities.configure_expert_instruments'):
            raise serializers.ValidationError(_("You don't have permission to configure expert-level instruments"))

        return data


class DimensionalityModelSerializer(BaseSecureSerializer):
    """
    Serializer for dimensionality models with access controls.
    """
    class Meta:
        model = DimensionalityModel
        fields = ['id', 'model_name', 'model_parameters', 'data_source_ref',
                 'status', 'access_level', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate access level permissions
        if data.get('access_level') == 'restricted' and not user.has_perm('future_capabilities.access_restricted_models'):
            raise serializers.ValidationError(_("You don't have permission to create restricted models"))

        return data


class AIAgentPartnershipSerializer(BaseSecureSerializer):
    """
    Serializer for AI agent partnerships with security clearance.
    """
    class Meta:
        model = AIAgentPartnership
        fields = ['id', 'agent_name', 'personality_profile', 'associated_task',
                 'status', 'security_clearance', 'expiration_time', 'created_by',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate security clearance permissions
        if data.get('security_clearance') in ['advanced', 'maximum'] and not user.has_perm('future_capabilities.grant_security_clearance'):
            raise serializers.ValidationError(_("You don't have permission to set advanced security clearance"))

        return data


class SynestheticMappingSerializer(BaseSecureSerializer):
    """
    Serializer for synesthetic mappings with validation controls.
    """
    class Meta:
        model = SynestheticMapping
        fields = ['id', 'mapping_name', 'sensory_correlations', 'mapping_type',
                 'validation_status', 'access_scope', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'validation_status', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate access scope permissions
        if data.get('access_scope') == 'global' and not user.has_perm('future_capabilities.create_global_mappings'):
            raise serializers.ValidationError(_("You don't have permission to create global mappings"))

        return data


class SemanticLayerSerializer(BaseSecureSerializer):
    """
    Serializer for semantic layers with complexity controls.
    """
    class Meta:
        model = SemanticLayer
        fields = ['id', 'layer_name', 'abstract_concepts', 'layer_type',
                 'complexity_level', 'access_mode', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate complexity level permissions
        if data.get('complexity_level') == 'expert' and not user.has_perm('future_capabilities.manage_expert_layers'):
            raise serializers.ValidationError(_("You don't have permission to create expert-level layers"))

        # Validate access mode permissions
        if data.get('access_mode') == 'restricted' and not user.has_perm('future_capabilities.manage_layer_access'):
            raise serializers.ValidationError(_("You don't have permission to create restricted access layers"))

        return data


class PipelineEvolutionLogSerializer(BaseSecureSerializer):
    """
    Serializer for pipeline evolution logs with criticality controls.
    """
    class Meta:
        model = PipelineEvolutionLog
        fields = ['id', 'pipeline_name', 'performance_metrics', 'suggested_optimizations',
                 'evolution_stage', 'criticality_level', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate criticality level permissions
        if data.get('criticality_level') == 'critical' and not user.has_perm('future_capabilities.manage_critical_pipelines'):
            raise serializers.ValidationError(_("You don't have permission to create critical pipeline logs"))

        return data


class InterstellarLatencyConfigSerializer(BaseSecureSerializer):
    """
    Serializer for interstellar latency configurations with security protocol controls.
    """
    class Meta:
        model = InterstellarLatencyConfig
        fields = ['id', 'scenario_name', 'latency_parameters', 'scenario_type',
                 'reliability_rating', 'security_protocol', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'reliability_rating', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        user = self.context['request'].user

        # Validate security protocol permissions
        if data.get('security_protocol') == 'classified' and not user.has_perm('future_capabilities.access_classified_scenarios'):
            raise serializers.ValidationError(_("You don't have permission to create classified scenarios"))

        return data


class DAWControlStateSerializer(BaseSecureSerializer):
    """
    Serializer for DAW control states with user validation.
    """
    class Meta:
        model = DAWControlState
        fields = ['id', 'user', 'control_id', 'value', 'environment',
                 'immersive_mode', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        data = super().validate(data)
        if data.get('value') is not None:
            if not (-1000 <= data['value'] <= 1000):
                raise serializers.ValidationError(_("Value must be between -1000 and 1000"))
        return data


class VRInteractionLogSerializer(BaseSecureSerializer):
    """
    Serializer for VR interaction logs with security controls.
    """
    class Meta:
        model = VRInteractionLog
        fields = ['id', 'user', 'interaction_type', 'details', 'timestamp']
        read_only_fields = ['id', 'timestamp']

    def validate(self, data):
        data = super().validate(data)
        if data.get('details') and not isinstance(data['details'], dict):
            raise serializers.ValidationError(_("Details must be a valid JSON object"))
        return data


class CommunicationChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunicationChannel
        fields = ['id', 'session', 'channel_type', 'active', 'created_at', 'settings']
        read_only_fields = ['created_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'channel', 'user_id', 'username', 'message_type',
            'content', 'timestamp', 'metadata', 'parent_message',
            'edited', 'edited_at'
        ]
        read_only_fields = ['timestamp', 'edited', 'edited_at']

    def get_username(self, obj):
        # Get username from User model
        try:
            user = User.objects.get(id=obj.user_id)
            return user.username
        except User.DoesNotExist:
            return f"User {obj.user_id}"


class CallParticipantSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = CallParticipant
        fields = [
            'id', 'channel', 'user_id', 'username', 'join_time',
            'leave_time', 'device_info', 'connection_quality',
            'audio_enabled', 'video_enabled'
        ]
        read_only_fields = ['join_time', 'leave_time']

    def get_username(self, obj):
        try:
            user = User.objects.get(id=obj.user_id)
            return user.username
        except User.DoesNotExist:
            return f"User {obj.user_id}"


class AIPluginSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIPlugin
        fields = [
            'id', 'name', 'description', 'plugin_type',
            'version', 'metadata', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_metadata(self, value):
        required_fields = ['genre_focus', 'skill_level']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(
                    f"Metadata must include {field}"
                )
        return value


class AISuggestionSerializer(serializers.ModelSerializer):
    plugin_name = serializers.CharField(source='plugin.name', read_only=True)

    class Meta:
        model = AISuggestion
        fields = [
            'id', 'user_id', 'plugin', 'plugin_name',
            'project', 'suggestion_type', 'content',
            'context', 'confidence_score', 'status',
            'feedback', 'created_at', 'applied_at'
        ]
        read_only_fields = ['created_at', 'applied_at']

    def validate_confidence_score(self, value):
        if not 0 <= value <= 1:
            raise serializers.ValidationError(
                "Confidence score must be between 0 and 1"
            )
        return value


class UserPluginPreferenceSerializer(serializers.ModelSerializer):
    plugin_name = serializers.CharField(source='plugin.name', read_only=True)
    plugin_type = serializers.CharField(source='plugin.plugin_type', read_only=True)

    class Meta:
        model = UserPluginPreference
        fields = [
            'id', 'user_id', 'plugin', 'plugin_name',
            'plugin_type', 'is_enabled', 'auto_apply',
            'confidence_threshold', 'settings',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_confidence_threshold(self, value):
        if not 0 <= value <= 1:
            raise serializers.ValidationError(
                "Confidence threshold must be between 0 and 1"
            )
        return value


class WearableDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WearableDevice
        fields = [
            'id', 'user_id', 'device_type', 'device_name',
            'device_id', 'connection_status', 'last_sync',
            'settings', 'created_at'
        ]
        read_only_fields = ['last_sync', 'created_at']


class BiofeedbackDataSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.device_name', read_only=True)

    class Meta:
        model = BiofeedbackData
        fields = [
            'id', 'user_id', 'device', 'device_name',
            'data_type', 'value', 'unit', 'timestamp',
            'context'
        ]
        read_only_fields = ['timestamp']

    def validate(self, data):
        if data['data_type'] == 'heart_rate' and not 0 <= data['value'] <= 300:
            raise serializers.ValidationError(
                "Heart rate must be between 0 and 300 BPM"
            )
        elif data['data_type'] == 'step_count' and data['value'] < 0:
            raise serializers.ValidationError(
                "Step count cannot be negative"
            )
        return data


class BiofeedbackEventSerializer(serializers.ModelSerializer):
    trigger_data_info = BiofeedbackDataSerializer(source='trigger_data', read_only=True)

    class Meta:
        model = BiofeedbackEvent
        fields = [
            'id', 'user_id', 'project', 'event_type',
            'trigger_data', 'trigger_data_info', 'previous_state',
            'new_state', 'confidence_score', 'applied',
            'created_at', 'applied_at'
        ]
        read_only_fields = ['created_at', 'applied_at']

    def validate_confidence_score(self, value):
        if not 0 <= value <= 1:
            raise serializers.ValidationError(
                "Confidence score must be between 0 and 1"
            )
        return value


class NeuralDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NeuralDevice
        fields = [
            'id', 'user_id', 'device_type', 'device_name',
            'device_id', 'connection_status', 'signal_quality',
            'last_calibration', 'settings', 'safety_thresholds',
            'created_at'
        ]
        read_only_fields = ['last_calibration', 'created_at']

    def validate_safety_thresholds(self, value):
        required_fields = ['min_confidence', 'max_duration', 'signal_timeout']
        if not all(field in value for field in required_fields):
            raise serializers.ValidationError(
                f"Safety thresholds must include: {', '.join(required_fields)}"
            )
        return value


class NeuralSignalSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.device_name', read_only=True)
    device_type = serializers.CharField(source='device.device_type', read_only=True)

    class Meta:
        model = NeuralSignal
        fields = [
            'id', 'user_id', 'device', 'device_name', 'device_type',
            'signal_type', 'processed_value', 'confidence_score',
            'timestamp', 'metadata'
        ]
        read_only_fields = ['timestamp']

    def validate(self, data):
        if data['confidence_score'] < data['device'].settings.get('min_confidence', 0.5):
            raise serializers.ValidationError(
                "Signal confidence below minimum threshold"
            )
        return data


class NeuralControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = NeuralControl
        fields = [
            'id', 'user_id', 'name', 'signal_type',
            'control_parameter', 'mapping_function',
            'input_range', 'output_range', 'fallback_value',
            'enabled', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        if not isinstance(data['input_range'], dict) or 'min' not in data['input_range'] or 'max' not in data['input_range']:
            raise serializers.ValidationError(
                "Input range must be a dictionary with 'min' and 'max' values"
            )
        if not isinstance(data['output_range'], dict) or 'min' not in data['output_range'] or 'max' not in data['output_range']:
            raise serializers.ValidationError(
                "Output range must be a dictionary with 'min' and 'max' values"
            )
        
        if data['fallback_value'] < data['output_range']['min'] or data['fallback_value'] > data['output_range']['max']:
            raise serializers.ValidationError(
                "Fallback value must be within output range"
            )
        return data


class FeatureSurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureSurvey
        fields = [
            'id', 'title', 'description', 'feature_category',
            'priority_level', 'start_date', 'end_date',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SurveyResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyResponse
        fields = [
            'id', 'user_id', 'survey', 'interest_level',
            'importance_level', 'feedback', 'would_use',
            'submitted_at'
        ]
        read_only_fields = ['id', 'submitted_at']


class FeatureRequestVoteSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = FeatureRequestVote
        fields = [
            'id', 'feature_request', 'user', 'user_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.username if hasattr(obj.user, 'username') else f"User {obj.user.id}"


class FeatureRequestSerializer(serializers.ModelSerializer):
    votes_count = serializers.SerializerMethodField()
    submitted_by_name = serializers.SerializerMethodField()
    has_voted = serializers.SerializerMethodField()
    
    class Meta:
        model = FeatureRequest
        fields = [
            'id', 'title', 'description', 'user', 'submitted_by_name',
            'category', 'status', 'priority', 'created_at',
            'updated_at', 'votes_count', 'has_voted'
        ]
        read_only_fields = ['id', 'votes_count', 'created_at', 'updated_at']
    
    def get_votes_count(self, obj):
        return obj.votes.count()
    
    def get_submitted_by_name(self, obj):
        return obj.user.username if hasattr(obj.user, 'username') else f"User {obj.user.id}"
    
    def get_has_voted(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.votes.filter(user=request.user).exists()
        return False
