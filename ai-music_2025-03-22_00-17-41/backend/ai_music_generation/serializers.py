from rest_framework import serializers
from .models import LLMProvider, AIMusicRequest, AIMusicParams, GeneratedTrack, ModelUsageLog, SavedComposition, CompositionVersion, Genre, Region, UserFeedback, UserPreference, MusicTradition, TraditionBlendWeight, CrossCulturalBlend, MultilingualLyrics, TrackLayer, ArrangementSection, TrackAutomation, VocalLine, HarmonyVoicing, HarmonyGroup, MasteringPreset, SpectralMatch, MasteringSession, CreativeChallenge, ChallengeSubmission, ContentModeration
from .services.ab_testing import ABTest, ABTestAssignment
from user_management.serializers import UserSerializer
from django.contrib.auth import get_user_model


class LLMProviderSerializer(serializers.ModelSerializer):
    """
    Serializer for the LLMProvider model.
    Provides a way to serialize and deserialize LLM provider data.
    """
    class Meta:
        model = LLMProvider
        fields = ['id', 'name', 'provider_type', 'api_endpoint', 'api_credentials', 'active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AIMusicRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for the AIMusicRequest model.
    Handles serialization and deserialization of AI music requests,
    including nested serialization of the associated user and LLM provider.
    """
    user = UserSerializer(read_only=True)
    provider = LLMProviderSerializer(read_only=True)
    
    # Add write-only fields for setting relations during creation
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=get_user_model().objects.all(),
        write_only=True
    )
    provider_id = serializers.PrimaryKeyRelatedField(
        source='provider',
        queryset=LLMProvider.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = AIMusicRequest
        fields = ['id', 'user', 'provider', 'user_id', 'provider_id', 'prompt_text', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AIMusicParamsSerializer(serializers.ModelSerializer):
    """
    Serializer for the AIMusicParams model.
    Serializes and deserializes AI music parameters,
    including the associated request.
    """
    class Meta:
        model = AIMusicParams
        fields = ['id', 'request', 'parameters', 'created_at']
        read_only_fields = ['id', 'created_at']


class GeneratedTrackSerializer(serializers.ModelSerializer):
    """
    Serializer for the GeneratedTrack model.
    Handles serialization and deserialization of generated music tracks,
    including the associated request.
    """
    class Meta:
        model = GeneratedTrack
        fields = ['id', 'request', 'audio_file_url', 'waveform_data', 'notation_data', 'created_at', 'finalization_timestamp']
        read_only_fields = ['id', 'created_at', 'finalization_timestamp']


class ModelUsageLogSerializer(serializers.ModelSerializer):
    """
    Serializer for the ModelUsageLog model.
    Serializes and deserializes model usage logs,
    including the associated request and LLM provider.
    """
    provider = LLMProviderSerializer(read_only=True)
    class Meta:
        model = ModelUsageLog
        fields = ['id', 'request', 'provider', 'prompt_sent', 'response_metadata', 'created_at']
        read_only_fields = ['id', 'created_at']


class SavedCompositionSerializer(serializers.ModelSerializer):
    """
    Serializer for the SavedComposition model.
    Includes nested serialization of the latest version.
    """
    user = UserSerializer(read_only=True)
    latest_version = serializers.SerializerMethodField()

    class Meta:
        model = SavedComposition
        fields = ['id', 'user', 'title', 'description', 'created_at', 'updated_at', 'is_public', 'tags', 'latest_version']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_latest_version(self, obj):
        latest = obj.versions.first()  # Ordered by -version_number
        if latest:
            return CompositionVersionSerializer(latest).data
        return None


class CompositionVersionSerializer(serializers.ModelSerializer):
    """
    Serializer for the CompositionVersion model.
    Includes download URLs for different file formats.
    """
    generated_track = GeneratedTrackSerializer(read_only=True)
    parameters = AIMusicParamsSerializer(read_only=True)
    download_urls = serializers.SerializerMethodField()

    class Meta:
        model = CompositionVersion
        fields = ['id', 'composition', 'version_number', 'generated_track', 'parameters', 
                 'version_notes', 'created_at', 'download_urls']
        read_only_fields = ['id', 'version_number', 'created_at']

    def get_download_urls(self, obj):
        request = self.context.get('request')
        if not request:
            return {}

        urls = {}
        if obj.wav_file:
            urls['wav'] = request.build_absolute_uri(obj.wav_file.url)
        if obj.mp3_file:
            urls['mp3'] = request.build_absolute_uri(obj.mp3_file.url)
        if obj.midi_file:
            urls['midi'] = request.build_absolute_uri(obj.midi_file.url)
        return urls


class GenreSerializer(serializers.ModelSerializer):
    """
    Serializer for the Genre model.
    """
    class Meta:
        model = Genre
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Region model.
    """
    class Meta:
        model = Region
        fields = ['id', 'name', 'code', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for user feedback."""
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = UserFeedback
        fields = [
            'id', 'user', 'generated_track', 'feedback_type',
            'rating', 'feedback_text', 'context', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'context']


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user preferences."""
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = UserPreference
        fields = [
            'id', 'user', 'genre_weights', 'instrument_weights',
            'style_weights', 'complexity_preference', 'tempo_preference',
            'feedback_count', 'confidence_scores', 'last_updated'
        ]
        read_only_fields = [
            'id', 'user', 'feedback_count', 'confidence_scores',
            'last_updated'
        ]


class ABTestSerializer(serializers.ModelSerializer):
    """Serializer for A/B tests."""
    class Meta:
        model = ABTest
        fields = [
            'id', 'name', 'description', 'start_date', 'end_date',
            'is_active', 'variant_configs', 'total_impressions',
            'variant_metrics'
        ]
        read_only_fields = [
            'id', 'start_date', 'total_impressions', 'variant_metrics'
        ]


class ABTestAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for A/B test assignments."""
    class Meta:
        model = ABTestAssignment
        fields = ['id', 'user', 'test', 'variant', 'assigned_at']
        read_only_fields = ['id', 'assigned_at']


class MusicTraditionSerializer(serializers.ModelSerializer):
    """Serializer for music traditions."""
    class Meta:
        model = MusicTradition
        fields = [
            'id', 'name', 'description', 'region', 'scale_system',
            'rhythmic_patterns', 'typical_instruments', 'melodic_patterns',
            'model_weights', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TraditionBlendWeightSerializer(serializers.ModelSerializer):
    """Serializer for tradition blend weights."""
    class Meta:
        model = TraditionBlendWeight
        fields = ['id', 'tradition', 'weight', 'section_order']
        read_only_fields = ['id']


class CrossCulturalBlendSerializer(serializers.ModelSerializer):
    """Serializer for cross-cultural blends."""
    tradition_weights = TraditionBlendWeightSerializer(
        source='traditionblendweight_set',
        many=True,
        read_only=True
    )

    class Meta:
        model = CrossCulturalBlend
        fields = [
            'id', 'name', 'description', 'blend_strategy',
            'tradition_weights', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MultilingualLyricsSerializer(serializers.ModelSerializer):
    """Serializer for multilingual lyrics."""
    class Meta:
        model = MultilingualLyrics
        fields = [
            'id', 'track', 'primary_language', 'translation_languages',
            'original_lyrics', 'translations', 'phonetic_guide',
            'cultural_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'translations', 'phonetic_guide',
            'cultural_notes', 'created_at', 'updated_at'
        ]


class TrackLayerSerializer(serializers.ModelSerializer):
    """
    Serializer for track layers in a composition.
    """
    class Meta:
        model = TrackLayer
        fields = [
            'id', 'composition', 'name', 'track_type', 'instrument',
            'midi_channel', 'volume', 'pan', 'muted', 'soloed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ArrangementSectionSerializer(serializers.ModelSerializer):
    """
    Serializer for arrangement sections with support for nested sections.
    """
    subsections = serializers.SerializerMethodField()

    class Meta:
        model = ArrangementSection
        fields = [
            'id', 'composition', 'parent_section', 'name', 'section_type',
            'start_time', 'duration', 'tempo', 'key_signature', 'time_signature',
            'complexity', 'energy_level', 'section_metadata', 'subsections',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_subsections(self, obj):
        """Get all subsections for this arrangement section."""
        subsections = obj.subsections.all().order_by('start_time')
        return ArrangementSectionSerializer(subsections, many=True).data


class TrackAutomationSerializer(serializers.ModelSerializer):
    """
    Serializer for track parameter automation data.
    """
    class Meta:
        model = TrackAutomation
        fields = [
            'id', 'track', 'parameter_name', 'automation_data',
            'interpolation_type', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VocalLineSerializer(serializers.ModelSerializer):
    """
    Serializer for vocal lines, including synthesis parameters and melody data.
    """
    track = TrackLayerSerializer(read_only=True)

    class Meta:
        model = VocalLine
        fields = [
            'id', 'composition', 'track', 'voice_type', 'is_harmony',
            'harmony_role', 'vocal_range', 'synthesis_params', 'melody_data',
            'lyrics_alignment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class HarmonyVoicingSerializer(serializers.ModelSerializer):
    """
    Serializer for harmony voicing details.
    """
    vocal_line = VocalLineSerializer(read_only=True)

    class Meta:
        model = HarmonyVoicing
        fields = [
            'id', 'harmony_group', 'vocal_line', 'voice_order',
            'transposition', 'volume_adjustment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class HarmonyGroupSerializer(serializers.ModelSerializer):
    """
    Serializer for harmony groups with nested voicings.
    """
    voicings = HarmonyVoicingSerializer(
        source='harmonyvoicing_set',
        many=True,
        read_only=True
    )

    class Meta:
        model = HarmonyGroup
        fields = [
            'id', 'composition', 'name', 'voicing_type',
            'chord_progression', 'voicings', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MasteringPresetSerializer(serializers.ModelSerializer):
    """
    Serializer for mastering presets.
    """
    class Meta:
        model = MasteringPreset
        fields = [
            'id', 'name', 'description', 'preset_type', 'eq_settings',
            'dynamics_settings', 'stereo_settings', 'saturation_settings',
            'target_lufs', 'target_peak', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SpectralMatchSerializer(serializers.ModelSerializer):
    """
    Serializer for spectral matching data.
    """
    class Meta:
        model = SpectralMatch
        fields = [
            'id', 'mastering_session', 'frequency_match',
            'dynamics_match', 'stereo_match', 'match_quality',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MasteringSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for mastering sessions with nested spectral match data.
    """
    spectral_match = SpectralMatchSerializer(read_only=True)
    preset = MasteringPresetSerializer(read_only=True)
    output_url = serializers.SerializerMethodField()
    reference_url = serializers.SerializerMethodField()

    class Meta:
        model = MasteringSession
        fields = [
            'id', 'composition_version', 'preset', 'reference_track',
            'reference_analysis', 'processing_status', 'processing_log',
            'output_file', 'output_analysis', 'spectral_match',
            'output_url', 'reference_url', 'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'reference_analysis', 'processing_status',
            'processing_log', 'output_file', 'output_analysis',
            'created_at', 'completed_at'
        ]

    def get_output_url(self, obj):
        """Get the URL for the mastered output file."""
        if obj.output_file:
            return self.context['request'].build_absolute_uri(obj.output_file.url)
        return None

    def get_reference_url(self, obj):
        """Get the URL for the reference track."""
        if obj.reference_track:
            return self.context['request'].build_absolute_uri(obj.reference_track.url)
        return None


class CreativeChallengeSerializer(serializers.ModelSerializer):
    """
    Serializer for creative challenges.
    """
    total_submissions = serializers.IntegerField(read_only=True)
    top_rated_submissions = serializers.SerializerMethodField()

    class Meta:
        model = CreativeChallenge
        fields = [
            'id', 'title', 'description', 'challenge_type',
            'start_date', 'end_date', 'max_participants',
            'reward_badge', 'requirements', 'ai_parameters',
            'status', 'total_submissions', 'top_rated_submissions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_top_rated_submissions(self, obj):
        """Get the top 3 rated submissions."""
        top_submissions = obj.submissions.filter(
            moderation_status='approved'
        ).order_by('-community_rating')[:3]
        return ChallengeSubmissionSerializer(
            top_submissions, many=True, context=self.context
        ).data


class ChallengeSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for challenge submissions.
    """
    participant_name = serializers.CharField(
        source='participant.username',
        read_only=True
    )
    composition_title = serializers.CharField(
        source='composition.title',
        read_only=True
    )

    class Meta:
        model = ChallengeSubmission
        fields = [
            'id', 'challenge', 'composition', 'participant',
            'participant_name', 'composition_title',
            'ai_contribution_score', 'community_rating',
            'submission_notes', 'badges_earned',
            'moderation_status', 'created_at'
        ]
        read_only_fields = [
            'id', 'participant_name', 'composition_title',
            'community_rating', 'badges_earned',
            'moderation_status', 'created_at'
        ]


class ContentModerationSerializer(serializers.ModelSerializer):
    """
    Serializer for content moderation checks.
    """
    composition_title = serializers.CharField(
        source='composition.title',
        read_only=True
    )

    class Meta:
        model = ContentModeration
        fields = [
            'id', 'composition', 'composition_title',
            'check_type', 'status', 'check_results',
            'confidence_score', 'admin_reviewed',
            'admin_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'composition_title', 'check_results',
            'confidence_score', 'created_at', 'updated_at'
        ]
