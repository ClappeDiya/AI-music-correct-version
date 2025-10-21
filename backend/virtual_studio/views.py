# views.py for Virtual Studio and Instrument Simulation Module
# This file contains the viewsets for the virtual studio and instrument simulation module,
# providing API endpoints for managing instruments, effects, studio sessions, tracks, presets, etc.

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .mixins import UserSpecificMixin
from .permissions import IsOwnerOrReadOnly, IsSessionOwnerOrCollaborator, IsPublicOrOwner
from .models import (
    Instrument,
    Effect,
    StudioSession,
    Track,
    TrackInstrument,
    TrackEffect,
    InstrumentPreset,
    EffectPreset,
    SessionTemplate,
    ExportedFile,
    VrArSetting,
    AiSuggestion,
    AdaptiveAutomationEvent,
)
from .serializers import (
    InstrumentSerializer,
    EffectSerializer,
    StudioSessionSerializer,
    TrackSerializer,
    TrackInstrumentSerializer,
    TrackEffectSerializer,
    InstrumentPresetSerializer,
    EffectPresetSerializer,
    SessionTemplateSerializer,
    ExportedFileSerializer,
    VrArSettingSerializer,
    AiSuggestionSerializer,
    AdaptiveAutomationEventSerializer,
)


class BaseUserAwareViewSet(UserSpecificMixin, viewsets.ModelViewSet):
    """
    Base viewset that combines UserSpecificMixin and ModelViewSet.
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]

    def perform_create(self, serializer):
        """
        Automatically set the user to the authenticated user when creating objects.
        This ensures we rely on the backend authentication rather than frontend-provided user data.
        """
        if hasattr(serializer.Meta.model, 'user'):
            serializer.save(user=self.request.user)
        elif hasattr(serializer.Meta.model, 'created_by'):
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()


class InstrumentViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Instrument model.
    """
    permission_classes = [permissions.IsAuthenticated, IsPublicOrOwner]
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer
    filterset_fields = ['name', 'instrument_type', 'is_public']
    search_fields = ['name', 'instrument_type']


class EffectViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Effect model.
    """
    permission_classes = [permissions.IsAuthenticated, IsPublicOrOwner]
    queryset = Effect.objects.all()
    serializer_class = EffectSerializer
    filterset_fields = ['name', 'effect_type', 'is_public']
    search_fields = ['name', 'effect_type']


class StudioSessionViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the StudioSession model.
    """
    permission_classes = [permissions.IsAuthenticated, IsSessionOwnerOrCollaborator]
    queryset = StudioSession.objects.all()
    serializer_class = StudioSessionSerializer
    filterset_fields = ['session_name', 'is_public']
    search_fields = ['session_name', 'description']


class TrackViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Track model.
    """
    permission_classes = [permissions.IsAuthenticated, IsSessionOwnerOrCollaborator]
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    filterset_fields = ['track_name', 'track_type', 'session']
    search_fields = ['track_name', 'track_type']


class TrackInstrumentViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the TrackInstrument model.
    """
    permission_classes = [permissions.IsAuthenticated, IsSessionOwnerOrCollaborator]
    queryset = TrackInstrument.objects.all()
    serializer_class = TrackInstrumentSerializer
    filterset_fields = ['track', 'instrument']


class TrackEffectViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the TrackEffect model.
    """
    permission_classes = [permissions.IsAuthenticated, IsSessionOwnerOrCollaborator]
    queryset = TrackEffect.objects.all()
    serializer_class = TrackEffectSerializer
    filterset_fields = ['track', 'effect']


class InstrumentPresetViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the InstrumentPreset model.
    """
    permission_classes = [permissions.IsAuthenticated, IsPublicOrOwner]
    queryset = InstrumentPreset.objects.all()
    serializer_class = InstrumentPresetSerializer
    filterset_fields = ['preset_name', 'instrument', 'is_public']
    search_fields = ['preset_name']


class EffectPresetViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the EffectPreset model.
    """
    permission_classes = [permissions.IsAuthenticated, IsPublicOrOwner]
    queryset = EffectPreset.objects.all()
    serializer_class = EffectPresetSerializer
    filterset_fields = ['preset_name', 'effect', 'is_public']
    search_fields = ['preset_name']


class SessionTemplateViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the SessionTemplate model.
    """
    permission_classes = [permissions.IsAuthenticated, IsPublicOrOwner]
    queryset = SessionTemplate.objects.all()
    serializer_class = SessionTemplateSerializer
    filterset_fields = ['template_name', 'is_public']
    search_fields = ['template_name']


class ExportedFileViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the ExportedFile model.
    """
    permission_classes = [permissions.IsAuthenticated, IsSessionOwnerOrCollaborator]
    queryset = ExportedFile.objects.all()
    serializer_class = ExportedFileSerializer
    filterset_fields = ['session', 'format']


class VrArSettingViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the VrArSetting model.
    """
    permission_classes = [permissions.IsAuthenticated, IsSessionOwnerOrCollaborator]
    queryset = VrArSetting.objects.all()
    serializer_class = VrArSettingSerializer
    filterset_fields = ['session']


class AiSuggestionViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the AiSuggestion model.
    """
    permission_classes = [permissions.IsAuthenticated, IsSessionOwnerOrCollaborator]
    queryset = AiSuggestion.objects.all()
    serializer_class = AiSuggestionSerializer
    filterset_fields = ['session', 'suggestion_type', 'applied']


class AdaptiveAutomationEventViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the AdaptiveAutomationEvent model.
    """
    permission_classes = [permissions.IsAuthenticated, IsSessionOwnerOrCollaborator]
    queryset = AdaptiveAutomationEvent.objects.all()
    serializer_class = AdaptiveAutomationEventSerializer
    filterset_fields = ['session', 'event_type']
