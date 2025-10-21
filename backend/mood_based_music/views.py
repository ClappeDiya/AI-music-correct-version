# views.py for mood_based_music
# This file contains the viewsets for the mood_based_music app, providing API endpoints for managing moods, custom moods, mood requests, generated tracks, feedback, and profiles.

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import (
    Mood,
    CustomMood,
    MoodRequest,
    GeneratedMoodTrack,
    MoodFeedback,
    MoodProfile,
    ExternalMoodReference,
    MoodEmbedding,
    ContextualTrigger,
    LiveMoodSession,
    CollaborativeMoodSpace,
    AdvancedMoodParameter,
    MoodPlaylist,
)
from .serializers import (
    MoodSerializer,
    CustomMoodSerializer,
    MoodRequestSerializer,
    GeneratedMoodTrackSerializer,
    MoodFeedbackSerializer,
    MoodProfileSerializer,
    ExternalMoodReferenceSerializer,
    MoodEmbeddingSerializer,
    ContextualTriggerSerializer,
    LiveMoodSessionSerializer,
    CollaborativeMoodSpaceSerializer,
    AdvancedMoodParameterSerializer,
    MoodPlaylistSerializer,
)
# Import from the modular services package
from .services import MoodMusicGenerator, AdvancedMoodService
from asgiref.sync import async_to_sync
import logging
from django.db import transaction
from rest_framework.exceptions import ValidationError
from typing import List, Dict, Any
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

class UserSpecificViewSet(viewsets.ModelViewSet):
    """
    Base viewset that implements user-specific access control.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset based on the authenticated user.
        """
        base_qs = super().get_queryset()
        if hasattr(base_qs.model, 'user'):
            return base_qs.filter(user=self.request.user)
        return base_qs

    def perform_create(self, serializer):
        """
        Set the user when creating a new object.
        """
        serializer.save(user=self.request.user)


class MoodViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Mood model. Global moods are accessible to all authenticated users.
    """
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_fields = ['name']
    search_fields = ['name', 'description']


class CustomMoodViewSet(UserSpecificViewSet):
    """
    ViewSet for the CustomMood model.
    """
    queryset = CustomMood.objects.all()
    serializer_class = CustomMoodSerializer
    filter_fields = ['mood_name']
    search_fields = ['mood_name']


class MoodRequestViewSet(UserSpecificViewSet):
    """
    ViewSet for the MoodRequest model with AI music generation integration.
    """
    queryset = MoodRequest.objects.all()
    serializer_class = MoodRequestSerializer
    filter_fields = ['intensity']
    search_fields = ['parameters']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.generator = MoodMusicGenerator()

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """
        Get all versions of a generated track.
        """
        try:
            mood_request = self.get_object()
            versions = GeneratedMoodTrack.objects.filter(
                mood_request=mood_request
            ).order_by('-created_at')
            
            serializer = GeneratedMoodTrackSerializer(versions, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error getting track versions: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """
        Trigger music generation for a mood request.
        """
        try:
            mood_request = self.get_object()
            track = async_to_sync(self.generator.generate_music)(mood_request)
            serializer = GeneratedMoodTrackSerializer(track)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error generating music: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Get the current status of music generation.
        """
        try:
            generation_status = self.generator.get_generation_status(pk)
            return Response(generation_status)
            
        except Exception as e:
            logger.error(f"Error getting generation status: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        """
        Override create to automatically start music generation.
        """
        mood_request = serializer.save(user=self.request.user)
        try:
            async_to_sync(self.generator.generate_music)(mood_request)
        except Exception as e:
            logger.error(f"Error starting music generation: {str(e)}")
        return mood_request


class GeneratedMoodTrackViewSet(UserSpecificViewSet):
    """
    ViewSet for the GeneratedMoodTrack model.
    """
    queryset = GeneratedMoodTrack.objects.all()
    serializer_class = GeneratedMoodTrackSerializer
    filter_fields = ['track_id']
    search_fields = ['metadata']

    def get_queryset(self):
        """
        Filter tracks based on the user's mood requests
        """
        return self.queryset.filter(mood_request__user=self.request.user)


class MoodFeedbackViewSet(UserSpecificViewSet):
    """
    ViewSet for the MoodFeedback model.
    """
    queryset = MoodFeedback.objects.all()
    serializer_class = MoodFeedbackSerializer
    filter_fields = ['feedback_type']
    search_fields = ['feedback_notes']


class MoodProfileViewSet(UserSpecificViewSet):
    """
    ViewSet for the MoodProfile model.
    """
    queryset = MoodProfile.objects.all()
    serializer_class = MoodProfileSerializer
    search_fields = ['aggregated_preferences']

    @action(detail=False, methods=['get'])
    def user(self, request):
        """
        Get user-specific profiles.
        """
        profiles = self.get_queryset()
        serializer = self.get_serializer(profiles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        """
        Get trending profiles based on usage and feedback.
        """
        # Get profiles with positive feedback in the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        trending = MoodProfile.objects.annotate(
            usage_count=Count('moodrequest'),
            positive_feedback=Count(
                'moodrequest__generatedmoodtrack__moodfeedback',
                filter=Q(
                    moodrequest__generatedmoodtrack__moodfeedback__feedback_type='like',
                    moodrequest__generatedmoodtrack__moodfeedback__created_at__gte=thirty_days_ago
                )
            )
        ).order_by('-positive_feedback', '-usage_count')[:10]

        serializer = self.get_serializer(trending, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """
        Apply a profile to create a new mood request.
        """
        profile = self.get_object()
        
        # Create a new mood request using the profile's preferences
        mood_request = MoodRequest.objects.create(
            user=request.user,
            parameters=profile.aggregated_preferences
        )
        
        # Update profile usage statistics
        profile.usage_count = profile.usage_count + 1 if profile.usage_count else 1
        profile.save()
        
        return Response(MoodRequestSerializer(mood_request).data)


class ExternalMoodReferenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the ExternalMoodReference model. Global references accessible to all authenticated users.
    """
    queryset = ExternalMoodReference.objects.all()
    serializer_class = ExternalMoodReferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_fields = ['reference_type']
    search_fields = ['data']


class MoodEmbeddingViewSet(UserSpecificViewSet):
    """
    ViewSet for the MoodEmbedding model.
    """
    queryset = MoodEmbedding.objects.all()
    serializer_class = MoodEmbeddingSerializer
    filter_fields = ['dimensionality']


class ContextualTriggerViewSet(UserSpecificViewSet):
    """
    ViewSet for the ContextualTrigger model.
    """
    queryset = ContextualTrigger.objects.all()
    serializer_class = ContextualTriggerSerializer
    search_fields = ['trigger_data']


class LiveMoodSessionViewSet(UserSpecificViewSet):
    """
    ViewSet for the LiveMoodSession model.
    """
    queryset = LiveMoodSession.objects.all()
    serializer_class = LiveMoodSessionSerializer
    filter_fields = ['active']
    search_fields = ['current_mood_state']


class CollaborativeMoodSpaceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the CollaborativeMoodSpace model.
    """
    queryset = CollaborativeMoodSpace.objects.all()
    serializer_class = CollaborativeMoodSpaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['combined_mood_state']

    def get_queryset(self):
        """
        Filter spaces where the user is a participant
        """
        user_id = self.request.user.id
        return self.queryset.filter(participant_ids__contains=[user_id])


class AdvancedMoodParameterViewSet(UserSpecificViewSet):
    """
    ViewSet for the AdvancedMoodParameter model.
    """
    queryset = AdvancedMoodParameter.objects.all()
    serializer_class = AdvancedMoodParameterSerializer
    search_fields = ['model_tweaks']


class MoodPlaylistViewSet(UserSpecificViewSet):
    """
    ViewSet for the MoodPlaylist model.
    """
    queryset = MoodPlaylist.objects.all()
    serializer_class = MoodPlaylistSerializer
    filter_fields = ['auto_update']
    search_fields = ['mood_profile']


class MoodMusicViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MoodRequestSerializer
    
    def get_queryset(self):
        return MoodRequest.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    @transaction.atomic
    async def create_multi_mood_blend(self, request):
        """
        Create a track that blends multiple moods with smooth transitions.
        """
        try:
            service = AdvancedMoodService()
            track = await service.create_multi_mood_blend(
                user_id=request.user.id,
                moods=request.data.get('moods', []),
                transition_points=request.data.get('transition_points', []),
                duration=request.data.get('duration', 180)
            )
            
            serializer = GeneratedMoodTrackSerializer(track)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to create multi-mood blend'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def emotional_curve(self, request, pk=None):
        """
        Get the emotional curve data for a track.
        """
        try:
            track = GeneratedMoodTrack.objects.get(
                id=pk,
                mood_request__user=request.user
            )
            
            return Response({
                'emotional_curve': track.metadata.get('emotional_curve', []),
                'transitions': track.metadata.get('transitions', {})
            })
            
        except GeneratedMoodTrack.DoesNotExist:
            return Response(
                {'error': 'Track not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    @transaction.atomic
    async def update_transition(self, request, pk=None):
        """
        Update transition points in an existing track.
        """
        try:
            track = GeneratedMoodTrack.objects.get(
                id=pk,
                mood_request__user=request.user
            )
            
            service = AdvancedMoodService()
            updated_track = await service.update_track_transitions(
                track_id=track.id,
                new_transition_points=request.data.get('transition_points', [])
            )
            
            serializer = GeneratedMoodTrackSerializer(updated_track)
            return Response(serializer.data)
            
        except GeneratedMoodTrack.DoesNotExist:
            return Response(
                {'error': 'Track not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to update transitions'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def trending_blends(self, request):
        """
        Get trending multi-mood blends based on user feedback.
        """
        try:
            service = AdvancedMoodService()
            trending_blends = service.get_trending_blends(
                limit=request.query_params.get('limit', 10)
            )
            
            return Response(trending_blends)
            
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch trending blends'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
