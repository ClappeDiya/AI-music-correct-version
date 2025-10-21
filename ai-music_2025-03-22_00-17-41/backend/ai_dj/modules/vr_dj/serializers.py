from rest_framework import serializers
from .models import VRDJSession, VRDJControl, VRDJEnvironment, VRDJInteraction


class VRDJSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VRDJSession
        fields = [
            'id', 'session', 'user', 'environment_type',
            'is_collaborative', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class VRDJControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = VRDJControl
        fields = ['id', 'session', 'control_type', 'value', 'timestamp']
        read_only_fields = ['timestamp']

    def validate_value(self, value):
        if not 0 <= value <= 1:
            raise serializers.ValidationError(
                "Control value must be between 0 and 1"
            )
        return value


class VRDJEnvironmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VRDJEnvironment
        fields = [
            'id', 'session', 'name', 'scene_data',
            'lighting_preset', 'crowd_simulation',
            'visual_effects', 'created_at'
        ]
        read_only_fields = ['created_at']

    def validate_scene_data(self, value):
        required_fields = ['scene_objects', 'camera_position', 'lighting']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(
                    f"Scene data must include {field}"
                )
        return value


class VRDJInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VRDJInteraction
        fields = [
            'id', 'session', 'interaction_type',
            'details', 'success_rating', 'timestamp'
        ]
        read_only_fields = ['timestamp']

    def validate_success_rating(self, value):
        if value is not None and not 0 <= value <= 1:
            raise serializers.ValidationError(
                "Success rating must be between 0 and 1"
            )
        return value
