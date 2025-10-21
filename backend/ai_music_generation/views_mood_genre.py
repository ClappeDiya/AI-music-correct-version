from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone

from .models_mood_genre import (
    MoodTimeline,
    MoodPoint,
    GenreBlend,
    GenreWeight,
    ChordProgression,
    TransitionPoint,
    CreativeRole
)
from .serializers_mood_genre import (
    MoodTimelineSerializer,
    MoodPointSerializer,
    GenreBlendSerializer,
    GenreWeightSerializer,
    ChordProgressionSerializer,
    TransitionPointSerializer,
    CreativeRoleSerializer,
    TimelineStateSerializer,
    CollaborativeUpdateSerializer,
    MoodAnalysisSerializer,
    GenreTransitionSerializer,
    HarmonicAnalysisSerializer
)
from .services.mood_analysis import MoodAnalysisService
from .services.genre_transition import GenreTransitionService
from .services.harmonic_analysis import HarmonicAnalysisService


class MoodTimelineViewSet(viewsets.ModelViewSet):
    serializer_class = MoodTimelineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MoodTimeline.objects.filter(
            session__participants=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'])
    def add_mood_point(self, request, pk=None):
        timeline = self.get_object()
        serializer = MoodPointSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(timeline=timeline)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def analyze_mood(self, request, pk=None):
        timeline = self.get_object()
        service = MoodAnalysisService()
        analysis = service.analyze_timeline(timeline)
        
        serializer = MoodAnalysisSerializer(analysis)
        return Response(serializer.data)


class GenreBlendViewSet(viewsets.ModelViewSet):
    serializer_class = GenreBlendSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GenreBlend.objects.filter(
            session__participants=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'])
    def update_weights(self, request, pk=None):
        blend = self.get_object()
        weights_data = request.data.get('weights', [])
        
        with transaction.atomic():
            blend.genre_weights.all().delete()
            serializer = GenreWeightSerializer(
                data=weights_data,
                many=True
            )
            
            if serializer.is_valid():
                serializer.save(blend=blend)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def analyze_transition(self, request, pk=None):
        blend = self.get_object()
        service = GenreTransitionService()
        analysis = service.analyze_transition(blend)
        
        serializer = GenreTransitionSerializer(analysis)
        return Response(serializer.data)


class ChordProgressionViewSet(viewsets.ModelViewSet):
    serializer_class = ChordProgressionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChordProgression.objects.filter(
            session__participants=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['get'])
    def analyze_harmony(self, request, pk=None):
        progression = self.get_object()
        service = HarmonicAnalysisService()
        analysis = service.analyze_progression(progression)
        
        serializer = HarmonicAnalysisSerializer(analysis)
        return Response(serializer.data)


class TransitionPointViewSet(viewsets.ModelViewSet):
    serializer_class = TransitionPointSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TransitionPoint.objects.filter(
            session__participants=self.request.user
        )


class CreativeRoleViewSet(viewsets.ModelViewSet):
    serializer_class = CreativeRoleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CreativeRole.objects.filter(
            session__participants=self.request.user
        )

    def perform_create(self, serializer):
        session = serializer.validated_data['session']
        role_type = serializer.validated_data['role_type']
        
        # Check if role is already assigned
        existing_role = CreativeRole.objects.filter(
            session=session,
            role_type=role_type
        ).first()
        
        if existing_role:
            return Response(
                {'error': 'Role already assigned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save(user=self.request.user)


class CollaborativeSessionViewSet(viewsets.GenericViewSet,
                                mixins.RetrieveModelMixin):
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def timeline_state(self, request, pk=None):
        session = self.get_object()
        timestamp = float(request.query_params.get('timestamp', 0))
        
        # Get current state at timestamp
        mood_timeline = session.mood_timelines.filter(is_active=True).first()
        genre_blends = session.genre_blends.filter(
            start_time__lte=timestamp
        ).order_by('-start_time').first()
        chord_progression = session.chord_progressions.filter(
            start_time__lte=timestamp
        ).order_by('-start_time').first()
        
        state = {
            'timestamp': timestamp,
            'mood_intensities': self._get_mood_intensities(
                mood_timeline,
                timestamp
            ),
            'active_genres': self._get_active_genres(
                genre_blends,
                timestamp
            ),
            'current_chord': self._get_current_chord(
                chord_progression,
                timestamp
            ),
            'next_chord': self._get_next_chord(
                chord_progression,
                timestamp
            ),
            'upcoming_transition': self._get_upcoming_transition(
                session,
                timestamp
            )
        }
        
        serializer = TimelineStateSerializer(state)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def collaborative_update(self, request, pk=None):
        session = self.get_object()
        serializer = CollaborativeUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            update_type = serializer.validated_data['update_type']
            timestamp = serializer.validated_data['timestamp']
            user = serializer.validated_data['user']
            data = serializer.validated_data['data']
            
            # Process update based on type
            if update_type == 'mood':
                self._process_mood_update(session, user, timestamp, data)
            elif update_type == 'genre':
                self._process_genre_update(session, user, timestamp, data)
            elif update_type == 'chord':
                self._process_chord_update(session, user, timestamp, data)
            elif update_type == 'transition':
                self._process_transition_update(session, user, timestamp, data)
            
            return Response({'status': 'success'})
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def _get_mood_intensities(self, timeline, timestamp):
        if not timeline:
            return {}
            
        points = timeline.mood_points.filter(
            timestamp__lte=timestamp
        ).order_by('-timestamp')
        
        intensities = {}
        for mood_type, _ in MoodPoint._meta.get_field('mood_type').choices:
            point = points.filter(mood_type=mood_type).first()
            if point:
                intensities[mood_type] = point.intensity
            else:
                intensities[mood_type] = 0.0
                
        return intensities

    def _get_active_genres(self, blend, timestamp):
        if not blend:
            return {}
            
        return {
            weight.genre: weight.weight
            for weight in blend.genre_weights.all()
        }

    def _get_current_chord(self, progression, timestamp):
        if not progression:
            return 'N/A'
            
        chords = progression.progression
        position = (timestamp - progression.start_time) / progression.duration
        index = int(position * len(chords))
        return chords[min(index, len(chords) - 1)]

    def _get_next_chord(self, progression, timestamp):
        if not progression:
            return 'N/A'
            
        chords = progression.progression
        position = (timestamp - progression.start_time) / progression.duration
        index = int(position * len(chords))
        
        if index + 1 < len(chords):
            return chords[index + 1]
        return chords[0]  # Loop back to first chord

    def _get_upcoming_transition(self, session, timestamp):
        transition = session.transition_points.filter(
            start_time__gt=timestamp
        ).order_by('start_time').first()
        
        if transition:
            return {
                'start_time': transition.start_time,
                'duration': transition.duration,
                'type': transition.transition_type,
                'parameters': transition.parameters
            }
        return None

    def _process_mood_update(self, session, user, timestamp, data):
        timeline = session.mood_timelines.filter(is_active=True).first()
        if not timeline:
            timeline = MoodTimeline.objects.create(
                session=session,
                creator=user
            )
            
        MoodPoint.objects.create(
            timeline=timeline,
            timestamp=timestamp,
            mood_type=data['mood_type'],
            intensity=data['intensity'],
            transition_type=data.get('transition_type', 'linear')
        )

    def _process_genre_update(self, session, user, timestamp, data):
        blend = GenreBlend.objects.create(
            session=session,
            creator=user,
            start_time=timestamp,
            duration=data['duration']
        )
        
        for genre, weight in data['weights'].items():
            GenreWeight.objects.create(
                blend=blend,
                genre=genre,
                weight=weight
            )

    def _process_chord_update(self, session, user, timestamp, data):
        ChordProgression.objects.create(
            session=session,
            creator=user,
            start_time=timestamp,
            duration=data['duration'],
            progression=data['chords']
        )

    def _process_transition_update(self, session, user, timestamp, data):
        TransitionPoint.objects.create(
            session=session,
            start_time=timestamp,
            duration=data['duration'],
            transition_type=data['type'],
            parameters=data['parameters']
        )
