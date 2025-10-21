from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models_mood_genre import CoCreationSession as CollaborativeSession, CreativeRole, TransitionPoint, TimelineState
from .serializers_collaboration import (
    CollaborativeSessionSerializer,
    CreativeRoleSerializer,
    TimelineStateSerializer,
    MoodUpdateSerializer,
    GenreUpdateSerializer,
    ChordUpdateSerializer
)
from .services.ai_transition import AITransitionService
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

class CollaborativeSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing collaborative music sessions."""
    serializer_class = CollaborativeSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CollaborativeSession.objects.filter(
            participants=self.request.user
        ).distinct()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a new collaborative session."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        
        # Add creator as first participant
        session.participants.add(request.user)
        
        # Initialize timeline state
        TimelineState.objects.create(
            session=session,
            mood_intensities={},
            active_genres=[],
            current_progression=[]
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join an existing collaborative session."""
        session = self.get_object()
        session.participants.add(request.user)
        
        # Broadcast participant update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{session.id}",
            {
                "type": "participant_update",
                "message": {
                    "action": "join",
                    "user_id": request.user.id
                }
            }
        )
        
        return Response({"status": "joined"})

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a collaborative session."""
        session = self.get_object()
        session.participants.remove(request.user)
        
        # Broadcast participant update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{session.id}",
            {
                "type": "participant_update",
                "message": {
                    "action": "leave",
                    "user_id": request.user.id
                }
            }
        )
        
        return Response({"status": "left"})

class CreativeRoleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing creative roles in collaborative sessions."""
    serializer_class = CreativeRoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CreativeRole.objects.filter(
            session__participants=self.request.user
        )

    @action(detail=False, methods=['get'])
    def available_roles(self, request):
        """Get available roles for a session."""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        taken_roles = CreativeRole.objects.filter(
            session_id=session_id
        ).values_list('role_type', flat=True)
        
        available_roles = [
            'mood_designer',
            'genre_mixer',
            'chord_progressionist',
            'transition_designer'
        ]
        
        return Response({
            "available_roles": [
                role for role in available_roles
                if role not in taken_roles
            ]
        })

class TimelineStateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing collaborative timeline state."""
    serializer_class = TimelineStateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TimelineState.objects.filter(
            session__participants=self.request.user
        )

    @action(detail=True, methods=['post'])
    def update_mood(self, request, pk=None):
        """Update mood intensities."""
        timeline = self.get_object()
        serializer = MoodUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Update mood intensities
        mood_data = serializer.validated_data
        timeline.mood_intensities.setdefault(
            mood_data['mood_type'], []
        ).append({
            'timestamp': mood_data['timestamp'],
            'intensity': mood_data['intensity']
        })
        timeline.save()
        
        # Broadcast update
        self._broadcast_update(timeline.session_id, 'mood_update', mood_data)
        return Response(mood_data)

    @action(detail=True, methods=['post'])
    def update_genres(self, request, pk=None):
        """Update genre weights."""
        timeline = self.get_object()
        serializer = GenreUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Update genre weights
        genre_data = serializer.validated_data
        timeline.active_genres = genre_data['weights']
        timeline.save()
        
        # Broadcast update
        self._broadcast_update(timeline.session_id, 'genre_update', genre_data)
        return Response(genre_data)

    @action(detail=True, methods=['post'])
    def update_progression(self, request, pk=None):
        """Update chord progression."""
        timeline = self.get_object()
        serializer = ChordUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Update chord progression
        chord_data = serializer.validated_data
        timeline.current_progression = chord_data['chords']
        timeline.save()
        
        # Broadcast update
        self._broadcast_update(timeline.session_id, 'chord_update', chord_data)
        return Response(chord_data)

    @action(detail=True, methods=['post'])
    def analyze_transition(self, request, pk=None):
        """Analyze a transition point."""
        timeline = self.get_object()
        
        # Initialize AI service
        transition_service = AITransitionService()
        
        # Analyze transition
        analysis = transition_service.analyze_transition_point(
            transition=request.data,
            mood_timeline=timeline.mood_intensities,
            genre_blend=timeline.active_genres,
            chord_progression=timeline.current_progression
        )
        
        return Response(analysis)

    def _broadcast_update(self, session_id: int, update_type: str, data: dict):
        """Broadcast an update to all session participants."""
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{session_id}",
            {
                "type": "timeline_update",
                "message": {
                    "type": update_type,
                    "data": data
                }
            }
        )
