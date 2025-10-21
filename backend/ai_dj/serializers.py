from rest_framework import serializers
from .models import Track, AIDJSession, AIDJPlayHistory, AIDJRecommendation, AIDJFeedback, AIDJSavedSet, TrackTranslation, TrackLyrics
from user_management.models import User
import re

class TrackSerializer(serializers.ModelSerializer):
    """
    Serializer for the Track model.
    """
    translations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    lyrics = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Track
        fields = '__all__'


class UserSpecificSerializer(serializers.ModelSerializer):
    """
    Base serializer that handles user-specific validation.
    """
    def validate(self, data):
        """
        Ensure the user field matches the authenticated user.
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if 'user' in data and data['user'] != request.user:
                raise serializers.ValidationError("Cannot create or modify records for other users.")
        return data


class AIDJSessionSerializer(UserSpecificSerializer):
    """
    Serializer for the AIDJSession model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    supported_languages = serializers.ListField(child=serializers.CharField(), required=False)
    command_mappings = serializers.DictField(required=False)
    announcement_templates = serializers.DictField(required=False)
    voice_style = serializers.ChoiceField(choices=AIDJSession.VOICE_STYLE_CHOICES, required=False)

    class Meta:
        model = AIDJSession
        fields = '__all__'

    def validate_preferred_language(self, value):
        """
        Validate that the preferred language is in ISO 639-1 format
        """
        if not re.match(r'^[a-z]{2}(-[A-Z]{2})?$', value):
            raise serializers.ValidationError("Language code must be in ISO 639-1 format (e.g., 'en', 'es', 'fr')")
        return value

    def validate_announcement_templates(self, value):
        """
        Validate the structure of announcement templates
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Announcement templates must be a dictionary")
        
        for lang, templates in value.items():
            if not isinstance(templates, dict):
                raise serializers.ValidationError(f"Templates for language {lang} must be a dictionary")
            
            if not re.match(r'^[a-z]{2}(-[A-Z]{2})?$', lang):
                raise serializers.ValidationError(f"Invalid language code: {lang}")
            
            if 'default' not in templates:
                raise serializers.ValidationError(f"Language {lang} must have a default template")
        
        return value

    def validate_command_mappings(self, value):
        """
        Validate the structure of command mappings
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Command mappings must be a dictionary")
        
        for lang, mappings in value.items():
            if not isinstance(mappings, dict):
                raise serializers.ValidationError(f"Mappings for language {lang} must be a dictionary")
            
            if not re.match(r'^[a-z]{2}(-[A-Z]{2})?$', lang):
                raise serializers.ValidationError(f"Invalid language code: {lang}")
        
        return value

    def validate_voice_style(self, value):
        """
        Validate voice style choice
        """
        valid_styles = dict(AIDJSession.VOICE_STYLE_CHOICES)
        if value not in valid_styles:
            raise serializers.ValidationError(f"Invalid voice style. Choose from: {', '.join(valid_styles.keys())}")
        return value


class AIDJPlayHistorySerializer(UserSpecificSerializer):
    """
    Serializer for the AIDJPlayHistory model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    track = serializers.PrimaryKeyRelatedField(queryset=Track.objects.all())

    class Meta:
        model = AIDJPlayHistory
        fields = '__all__'


class AIDJRecommendationSerializer(UserSpecificSerializer):
    """
    Serializer for the AIDJRecommendation model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AIDJRecommendation
        fields = '__all__'


class AIDJFeedbackSerializer(UserSpecificSerializer):
    """
    Serializer for the AIDJFeedback model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    track = serializers.PrimaryKeyRelatedField(queryset=Track.objects.all(), allow_null=True)
    recommendation = serializers.PrimaryKeyRelatedField(queryset=AIDJRecommendation.objects.all(), allow_null=True)

    class Meta:
        model = AIDJFeedback
        fields = '__all__'

    def validate_recommendation(self, value):
        """
        Ensure users can only reference their own recommendations
        """
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError("Cannot reference other users' recommendations")
        return value


class AIDJSavedSetSerializer(UserSpecificSerializer):
    """
    Serializer for the AIDJSavedSet model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AIDJSavedSet
        fields = '__all__'


class TrackTranslationSerializer(serializers.ModelSerializer):
    """
    Serializer for track translations.
    """
    class Meta:
        model = TrackTranslation
        fields = ['language_code', 'title', 'artist', 'album', 'description']


class TrackLyricsSerializer(serializers.ModelSerializer):
    """
    Serializer for track lyrics.
    """
    snippet = serializers.SerializerMethodField()

    class Meta:
        model = TrackLyrics
        fields = ['language_code', 'is_original', 'lyrics_text', 'lyrics_with_timestamps',
                 'translation_source', 'verified', 'snippet']

    def get_snippet(self, obj):
        return obj.get_snippet()


class TrackSerializer(serializers.ModelSerializer):
    """
    Serializer for the Track model.
    """
    translations = TrackTranslationSerializer(many=True, read_only=True)
    lyrics = TrackLyricsSerializer(many=True, read_only=True)
    translated_metadata = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = '__all__'

    def get_translated_metadata(self, obj):
        """
        Get track metadata in the requested language
        """
        language_code = self.context.get('language_code')
        if not language_code:
            return None

        translation = obj.get_translation(language_code)
        if not translation:
            return None

        return {
            'title': translation.title,
            'artist': translation.artist,
            'album': translation.album,
            'description': translation.description
        }

    def to_representation(self, instance):
        """
        Customize the output based on requested language and fields
        """
        ret = super().to_representation(instance)
        
        # Get requested language from context
        language_code = self.context.get('language_code')
        include_lyrics = self.context.get('include_lyrics', False)
        
        # If language specified, filter translations and lyrics
        if language_code:
            if 'translations' in ret:
                ret['translations'] = [
                    trans for trans in ret['translations']
                    if trans['language_code'] == language_code
                ]
            if 'lyrics' in ret and include_lyrics:
                ret['lyrics'] = [
                    lyric for lyric in ret['lyrics']
                    if lyric['language_code'] == language_code
                ]
            elif not include_lyrics:
                ret.pop('lyrics', None)
        
        return ret
