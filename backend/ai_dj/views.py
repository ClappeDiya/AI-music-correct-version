# views.py for ai_dj
# This file contains the viewsets for the ai_dj app, providing API endpoints for the models.

from rest_framework import viewsets, permissions, filters
from django_filters import rest_framework as django_filters
from .models import Track, AIDJSession, AIDJPlayHistory, AIDJRecommendation, AIDJFeedback, AIDJSavedSet
from .serializers import TrackSerializer, AIDJSessionSerializer, AIDJPlayHistorySerializer, AIDJRecommendationSerializer, AIDJFeedbackSerializer, AIDJSavedSetSerializer, TrackLyricsSerializer, TrackTranslationSerializer
from user_management.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import base64
import os

# Try to import Google Cloud Text-to-Speech, but don't fail if it's not available
try:
    import google.cloud.texttospeech as tts
except ImportError:
    tts = None

class UserSpecificPermission(permissions.BasePermission):
    """
    Custom permission to ensure users can only access their own data.
    Staff users can access all data.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        # Check if object has direct user relationship
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        # Check for indirect user relationship through related models
        if hasattr(obj, 'session'):
            return obj.session.user == request.user
            
        return False

class BaseUserSpecificViewSet(viewsets.ModelViewSet):
    """
    Base viewset that implements user-specific access control.
    """
    permission_classes = [UserSpecificPermission]

    def get_queryset(self):
        """
        Filter queryset based on user access level and permissions.
        """
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_staff:
            return queryset

        # Direct user relationship
        if hasattr(self.queryset.model, 'user'):
            return queryset.filter(user=user)
        
        # Indirect relationship through related models
        if hasattr(self.queryset.model, 'session'):
            return queryset.filter(session__user=user)

        return queryset.none()  # Return empty queryset if no relationship found

    def perform_create(self, serializer):
        """
        Automatically set the user when creating new objects.
        """
        if hasattr(serializer.Meta.model, 'user'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()


class TrackViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the Track model.
    Tracks are globally accessible but create/update operations require authentication.
    """
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'artist', 'album', 'genre', 'translations__title', 
                    'translations__artist', 'translations__album', 'translations__description']
    ordering_fields = ['title', 'artist', 'album', 'genre', 'created_at', 'updated_at']
    filterset_fields = ['genre', 'original_language']

    def get_serializer_context(self):
        """
        Add language code to serializer context
        """
        context = super().get_serializer_context()
        context['language_code'] = self.request.query_params.get('language')
        context['include_lyrics'] = self.request.query_params.get('include_lyrics', '').lower() == 'true'
        return context

    def get_queryset(self):
        """
        Filter queryset based on language availability
        """
        queryset = super().get_queryset()
        language = self.request.query_params.get('language')
        
        if language:
            queryset = queryset.filter(available_translations__contains=[language])
        
        return queryset

    @action(detail=True, methods=['get'])
    def lyrics(self, request, pk=None):
        """
        Get track lyrics in specified language
        """
        track = self.get_object()
        language = request.query_params.get('language')
        
        lyrics = track.get_lyrics(language)
        if not lyrics:
            return Response(
                {"error": f"Lyrics not available in language: {language}"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = TrackLyricsSerializer(lyrics)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def translations(self, request, pk=None):
        """
        Get all available translations for a track
        """
        track = self.get_object()
        translations = track.translations.all()
        serializer = TrackTranslationSerializer(translations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_translation(self, request, pk=None):
        """
        Add a new translation for a track
        """
        track = self.get_object()
        serializer = TrackTranslationSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(track=track)
            track.update_available_translations()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_lyrics(self, request, pk=None):
        """
        Add lyrics for a track in a specific language
        """
        track = self.get_object()
        serializer = TrackLyricsSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(track=track)
            track.update_available_translations()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        """
        Set original language when creating a track
        """
        language = self.request.data.get('original_language', 'en')
        serializer.save(original_language=language)


class AIDJSessionViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the AIDJSession model.
    Users can only access their own sessions.
    """
    queryset = AIDJSession.objects.all()
    serializer_class = AIDJSessionSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['last_voice_command']
    ordering_fields = ['updated_at']

    def get_tts_client(self):
        """
        Get Google Cloud TTS client
        """
        if tts is None:
            return None
        try:
            return tts.TextToSpeechClient()
        except Exception as e:
            print(f"Error creating TTS client: {e}")
            return None

    def get_voice_params(self, session):
        """
        Get voice parameters based on user preferences
        """
        # Map language codes to Google Cloud TTS voices
        voice_map = {
            'en': {'name': 'en-US-Neural2-A', 'gender': tts.SsmlVoiceGender.FEMALE},
            'es': {'name': 'es-US-Neural2-A', 'gender': tts.SsmlVoiceGender.FEMALE},
            'fr': {'name': 'fr-FR-Neural2-A', 'gender': tts.SsmlVoiceGender.FEMALE},
            'zh': {'name': 'cmn-CN-Neural2-A', 'gender': tts.SsmlVoiceGender.FEMALE},
            'hi': {'name': 'hi-IN-Neural2-A', 'gender': tts.SsmlVoiceGender.FEMALE},
        }

        # Get voice settings for the preferred language
        voice_settings = voice_map.get(session.preferred_language, voice_map['en'])
        
        # Adjust speaking rate and pitch based on voice style
        style_params = {
            'formal': {'speaking_rate': 0.9, 'pitch': -2.0},
            'casual': {'speaking_rate': 1.0, 'pitch': 0.0},
            'energetic': {'speaking_rate': 1.2, 'pitch': 2.0},
            'calm': {'speaking_rate': 0.8, 'pitch': -1.0},
        }

        return {
            'language_code': session.preferred_language,
            'name': voice_settings['name'],
            'gender': voice_settings['gender'],
            **style_params[session.voice_style]
        }

    @action(detail=True, methods=['post'])
    def process_voice_command(self, request, pk=None):
        """
        Process a voice command in any supported language
        """
        session = self.get_object()
        command_text = request.data.get('command_text')
        
        if not command_text:
            return Response(
                {"error": "No command text provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Detect language and get standardized action
        action = session.get_command_action(command_text)
        
        if not action:
            return Response(
                {"error": "Command not recognized",
                 "detected_language": session.command_language},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update last voice command
        session.last_voice_command = command_text
        session.save(update_fields=['last_voice_command'])

        return Response({
            "action": action,
            "detected_language": session.command_language,
            "command_text": command_text
        })

    @action(detail=True, methods=['post'])
    def update_language_preference(self, request, pk=None):
        """
        Update user's preferred language for voice commands
        """
        session = self.get_object()
        language = request.data.get('language')

        if not language:
            return Response(
                {"error": "No language specified"},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.preferred_language = language
        session.save(update_fields=['preferred_language'])

        return Response({
            "preferred_language": session.preferred_language
        })

    @action(detail=True, methods=['get'])
    def supported_languages(self, request, pk=None):
        """
        Get list of supported languages for voice commands
        """
        session = self.get_object()
        return Response({
            "supported_languages": session.supported_languages,
            "preferred_language": session.preferred_language
        })

    @action(detail=True, methods=['post'])
    def generate_announcement(self, request, pk=None):
        """
        Generate a TTS announcement
        """
        session = self.get_object()
        
        if not session.enable_announcements:
            return Response(
                {"error": "Announcements are disabled for this session"},
                status=status.HTTP_400_BAD_REQUEST
            )

        announcement_text = request.data.get('text')
        if not announcement_text:
            return Response(
                {"error": "No announcement text provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client = self.get_tts_client()
            
            # Handle case when TTS is not available
            if client is None:
                return Response(
                    {"error": "Text-to-Speech service is not available. Please install google-cloud-texttospeech package."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
                
            voice_params = self.get_voice_params(session)

            synthesis_input = tts.SynthesisInput(text=announcement_text)
            voice = tts.VoiceSelectionParams(
                language_code=voice_params['language_code'],
                name=voice_params['name'],
                ssml_gender=voice_params['gender']
            )
            audio_config = tts.AudioConfig(
                audio_encoding=tts.AudioEncoding.MP3,
                speaking_rate=voice_params['speaking_rate'],
                pitch=voice_params['pitch']
            )

            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )

            # Convert audio content to base64 for transmission
            audio_content = base64.b64encode(response.audio_content).decode()

            # Update last announcement
            session.last_announcement = announcement_text
            session.save(update_fields=['last_announcement'])

            return Response({
                "audio_content": audio_content,
                "content_type": "audio/mpeg",
                "text": announcement_text
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def update_announcement_settings(self, request, pk=None):
        """
        Update announcement settings for the session
        """
        session = self.get_object()
        
        for field in ['enable_announcements', 'voice_style', 'announcement_frequency']:
            if field in request.data:
                setattr(session, field, request.data[field])
        
        try:
            session.full_clean()
            session.save()
            return Response(self.get_serializer(session).data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AIDJPlayHistoryViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the AIDJPlayHistory model.
    Users can only access their own play history.
    """
    queryset = AIDJPlayHistory.objects.all()
    serializer_class = AIDJPlayHistorySerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['track']
    ordering_fields = ['played_at']


class AIDJRecommendationViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the AIDJRecommendation model.
    Users can only access their own recommendations.
    """
    queryset = AIDJRecommendation.objects.all()
    serializer_class = AIDJRecommendationSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['recommended_at']


class AIDJFeedbackViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the AIDJFeedback model.
    Users can only access their own feedback.
    """
    queryset = AIDJFeedback.objects.all()
    serializer_class = AIDJFeedbackSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['track', 'recommendation', 'feedback_type']
    ordering_fields = ['created_at']


class AIDJSavedSetViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the AIDJSavedSet model.
    Users can only access their own saved sets.
    """
    queryset = AIDJSavedSet.objects.all()
    serializer_class = AIDJSavedSetSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['set_name']
    ordering_fields = ['created_at']
