from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models_shared_training import (
    SharedModelGroup,
    SharedModelMember,
    TrainingContribution,
    ModelTrainingJob
)
from .serializers import SavedCompositionSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email']


class SharedModelMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SharedModelMember
        fields = [
            'id', 'group', 'user', 'role', 'joined_at',
            'contribution_count'
        ]
        read_only_fields = ['joined_at', 'contribution_count']


class SharedModelGroupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = SharedModelMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SharedModelGroup
        fields = [
            'id', 'name', 'description', 'created_by',
            'created_at', 'updated_at', 'is_active',
            'training_status', 'model_version', 'style_tags',
            'training_config', 'members', 'member_count'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'model_version',
            'training_status'
        ]

    def get_member_count(self, obj):
        return obj.members.count()


class TrainingContributionSerializer(serializers.ModelSerializer):
    contributor = SharedModelMemberSerializer(read_only=True)
    composition = SavedCompositionSerializer(read_only=True)
    composition_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TrainingContribution
        fields = [
            'id', 'group', 'contributor', 'composition',
            'composition_id', 'contributed_at', 'status',
            'review_notes', 'training_metadata'
        ]
        read_only_fields = [
            'contributed_at', 'training_metadata'
        ]


class ModelTrainingJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelTrainingJob
        fields = [
            'id', 'group', 'started_at', 'completed_at',
            'status', 'error_message', 'training_metrics',
            'model_artifacts'
        ]
        read_only_fields = [
            'started_at', 'completed_at', 'training_metrics',
            'model_artifacts'
        ]


class SharedModelGroupDetailSerializer(SharedModelGroupSerializer):
    """Extended serializer for detailed group view"""
    recent_contributions = TrainingContributionSerializer(
        many=True,
        read_only=True,
        source='training_contributions.all'
    )
    latest_training_job = ModelTrainingJobSerializer(read_only=True)
    
    class Meta(SharedModelGroupSerializer.Meta):
        fields = SharedModelGroupSerializer.Meta.fields + [
            'recent_contributions', 'latest_training_job'
        ]

    def get_latest_training_job(self, obj):
        job = obj.training_jobs.first()
        if job:
            return ModelTrainingJobSerializer(job).data
        return None
