from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from .models import VoiceEmotionData, EmotionalMusicPreference, EmotionalPlaylistTemplate
from .serializers import (
    VoiceEmotionDataSerializer,
    EmotionalMusicPreferenceSerializer,
    EmotionalPlaylistTemplateSerializer,
)

class VoiceEmotionViewSet(viewsets.ModelViewSet):
    queryset = VoiceEmotionData.objects.all()
    serializer_class = VoiceEmotionDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter queryset to only include user's session data"""
        return self.queryset.filter(session__user=self.request.user)

    @action(detail=False, methods=['get'])
    def session_emotions(self, request):
        """Get emotion data for a specific session"""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        emotions = self.get_queryset().filter(session_id=session_id)
        serializer = self.get_serializer(emotions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def emotion_stats(self, request):
        """Get aggregated emotion statistics"""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        emotions = self.get_queryset().filter(session_id=session_id)
        stats = emotions.aggregate(
            avg_energy=Avg('energy'),
            avg_valence=Avg('valence'),
            avg_tempo=Avg('tempo')
        )
        
        # Get emotion distribution
        emotion_counts = emotions.values('emotion').annotate(
            count=models.Count('id')
        )
        
        return Response({
            'stats': stats,
            'emotion_distribution': emotion_counts
        })

class EmotionalMusicPreferenceViewSet(viewsets.ModelViewSet):
    queryset = EmotionalMusicPreference.objects.all()
    serializer_class = EmotionalMusicPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter queryset to only include user's preferences"""
        return self.queryset.filter(session__user=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_preferences(self, request, pk=None):
        """Update specific preferences without requiring all fields"""
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class EmotionalPlaylistTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmotionalPlaylistTemplate.objects.all()
    serializer_class = EmotionalPlaylistTemplateSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def by_mood(self, request):
        """Get playlist templates filtered by mood"""
        mood = request.query_params.get('mood')
        if not mood:
            return Response(
                {'error': 'mood parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        templates = self.queryset.filter(target_mood=mood)
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def generate_playlist(self, request, pk=None):
        """Generate a playlist based on template and current emotion"""
        template = self.get_object()
        emotion = request.data.get('emotion')
        if not emotion:
            return Response(
                {'error': 'emotion is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Here you would implement the logic to generate a playlist
        # based on the template and current emotion
        # This is a placeholder response
        return Response({
            'message': 'Playlist generation initiated',
            'template': self.get_serializer(template).data,
            'emotion': emotion
        })
