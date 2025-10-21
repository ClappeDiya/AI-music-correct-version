from rest_framework import serializers
from .models import ModelCapability, ModelRouter, ModelRouterAssignment
from .serializers import LLMProviderSerializer


class ModelCapabilitySerializer(serializers.ModelSerializer):
    """
    Serializer for the ModelCapability model.
    """
    provider = LLMProviderSerializer(read_only=True)

    class Meta:
        model = ModelCapability
        fields = ['id', 'provider', 'capability_type', 'confidence_score', 'latency_ms',
                 'cost_per_request', 'max_input_length', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ModelRouterAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for the ModelRouterAssignment model.
    """
    provider = LLMProviderSerializer(read_only=True)

    class Meta:
        model = ModelRouterAssignment
        fields = ['id', 'router', 'provider', 'task_type', 'status', 'priority',
                 'result', 'error', 'started_at', 'completed_at']
        read_only_fields = ['id', 'started_at', 'completed_at']


class ModelRouterSerializer(serializers.ModelSerializer):
    """
    Serializer for the ModelRouter model.
    """
    assignments = ModelRouterAssignmentSerializer(many=True, read_only=True)
    selected_providers = LLMProviderSerializer(many=True, read_only=True)

    class Meta:
        model = ModelRouter
        fields = ['id', 'request', 'selected_providers', 'routing_strategy',
                 'task_breakdown', 'created_at', 'completed_at', 'assignments']
        read_only_fields = ['id', 'created_at', 'completed_at']
