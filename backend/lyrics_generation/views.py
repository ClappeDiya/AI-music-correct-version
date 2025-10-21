# views.py for lyrics_generation
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
    LLMProvider, LyricPrompt, LyricDraft, LyricEdit, FinalLyrics,
    LyricTimeline, Language, LyricInfluencer, LyricModelVersion,
    LyricVrArSettings, LyricSignature, LyricAdaptiveFeedback,
    CollaborativeLyricSession, LyricShareLink, CollaboratorPresence,
    CollaborativeEdit
)
from .serializers import (
    LLMProviderSerializer, LyricPromptSerializer, LyricDraftSerializer,
    LyricEditSerializer, FinalLyricsSerializer, LyricTimelineSerializer,
    LanguageSerializer, LyricInfluencerSerializer, LyricModelVersionSerializer,
    LyricVrArSettingsSerializer, LyricSignatureSerializer,
    LyricAdaptiveFeedbackSerializer, CollaborativeLyricSessionSerializer,
    LyricShareLinkSerializer, CollaboratorPresenceSerializer,
    CollaborativeEditSerializer
)
from .mixins import UserSpecificMixin

# Existing viewsets remain unchanged...

class CollaborativeLyricSessionViewSet(UserSpecificMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing collaborative lyric editing sessions.
    """
    queryset = CollaborativeLyricSession.objects.all()
    serializer_class = CollaborativeLyricSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_share_link(self, request, pk=None):
        """Generate a new share link for the session"""
        session = self.get_object()
        if session.owner != request.user:
            return Response(
                {"detail": "Only the owner can generate share links"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LyricShareLinkSerializer(data={
            "session": session.id,
            "created_by": request.user.id,
            **request.data
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True)
    def collaborators(self, request, pk=None):
        """Get current collaborators in the session"""
        session = self.get_object()
        presences = CollaboratorPresence.objects.filter(
            session=session,
            is_active=True,
            last_seen__gte=timezone.now() - timezone.timedelta(minutes=5)
        )
        serializer = CollaboratorPresenceSerializer(presences, many=True)
        return Response(serializer.data)

class LyricShareLinkViewSet(UserSpecificMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing share links for collaborative sessions.
    """
    queryset = LyricShareLink.objects.all()
    serializer_class = LyricShareLinkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(
            session__owner=self.request.user
        )

    @action(detail=True, methods=['post'])
    def join_session(self, request, pk=None):
        """Join a collaborative session using a share link"""
        share_link = self.get_object()
        
        if not share_link.is_valid:
            return Response(
                {"detail": "This share link is no longer valid"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or update presence
        presence, created = CollaboratorPresence.objects.update_or_create(
            session=share_link.session,
            user=request.user,
            defaults={
                'is_active': True,
                'last_seen': timezone.now()
            }
        )

        # Increment usage counter
        share_link.times_used += 1
        share_link.save()

        return Response({
            "session": CollaborativeLyricSessionSerializer(share_link.session).data,
            "presence": CollaboratorPresenceSerializer(presence).data
        })

class CollaborativeEditViewSet(UserSpecificMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing collaborative edits.
    """
    queryset = CollaborativeEdit.objects.all()
    serializer_class = CollaborativeEditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(editor=self.request.user)

    def get_queryset(self):
        # Filter by session if provided
        session_id = self.request.query_params.get('session')
        queryset = super().get_queryset()
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset.order_by('-created_at')
