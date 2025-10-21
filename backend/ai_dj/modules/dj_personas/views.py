from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from .models import DJPersona, PersonaBlend, PersonaBlendComponent, PersonaPreset
from .serializers import (
    DJPersonaSerializer, PersonaBlendSerializer,
    PersonaBlendComponentSerializer, PersonaPresetSerializer
)

class DJPersonaViewSet(viewsets.ModelViewSet):
    queryset = DJPersona.objects.all()
    serializer_class = DJPersonaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(
            Q(created_by=self.request.user) | Q(is_preset=True)
        )
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['POST'])
    def duplicate(self, request, pk=None):
        persona = self.get_object()
        new_persona = DJPersona.objects.create(
            name=f"Copy of {persona.name}",
            description=persona.description,
            created_by=request.user,
            voice_style=persona.voice_style,
            transition_style=persona.transition_style,
            curation_style=persona.curation_style,
            energy_level=persona.energy_level,
            experimentalism=persona.experimentalism,
            genre_diversity=persona.genre_diversity,
            commentary_frequency=persona.commentary_frequency,
            trivia_frequency=persona.trivia_frequency
        )
        serializer = self.get_serializer(new_persona)
        return Response(serializer.data)

class PersonaBlendViewSet(viewsets.ModelViewSet):
    queryset = PersonaBlend.objects.all()
    serializer_class = PersonaBlendSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('session_id'):
            queryset = queryset.filter(
                session_id=self.request.query_params['session_id']
            )
        return queryset
    
    @action(detail=True, methods=['POST'])
    def activate(self, request, pk=None):
        blend = self.get_object()
        session_id = blend.session_id
        
        # Deactivate other blends for this session
        PersonaBlend.objects.filter(
            session_id=session_id,
            is_active=True
        ).exclude(
            id=blend.id
        ).update(is_active=False)
        
        # Activate this blend
        blend.is_active = True
        blend.save()
        
        serializer = self.get_serializer(blend)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'])
    def active_blend(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        blend = self.queryset.filter(
            session_id=session_id,
            is_active=True
        ).first()
        
        if not blend:
            return Response(
                {"error": "No active blend found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(blend)
        return Response(serializer.data)

class PersonaPresetViewSet(viewsets.ModelViewSet):
    queryset = PersonaPreset.objects.all()
    serializer_class = PersonaPresetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = self.queryset.filter(is_public=True)
        if self.request.query_params.get('category'):
            queryset = queryset.filter(
                category=self.request.query_params['category']
            )
        return queryset
    
    @action(detail=True, methods=['POST'])
    def apply_to_session(self, request, pk=None):
        preset = self.get_object()
        session_id = request.data.get('session_id')
        
        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new blend with single component
        blend = PersonaBlend.objects.create(
            session_id=session_id,
            is_active=True
        )
        
        PersonaBlendComponent.objects.create(
            blend=blend,
            persona=preset.persona,
            weight=1.0
        )
        
        # Deactivate other blends
        PersonaBlend.objects.filter(
            session_id=session_id,
            is_active=True
        ).exclude(
            id=blend.id
        ).update(is_active=False)
        
        serializer = PersonaBlendSerializer(blend)
        return Response(serializer.data)
