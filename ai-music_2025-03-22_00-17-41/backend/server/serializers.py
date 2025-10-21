from rest_framework import serializers
from .models import Recommendation, DynamicPreference, ThemePreference

class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = [
            'id',
            'user',
            'target_user',
            'score',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class DynamicPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicPreference
        fields = ['user', 'preferences']
        read_only_fields = ['user']

class ThemePreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThemePreference
        fields = ['user', 'theme', 'updated_at']
        read_only_fields = ['user', 'updated_at']