from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models_realtime import (
    CoCreationSession,
    SessionParticipant,
    RealtimeEdit,
    AIContribution,
    SessionChat
)
from .serializers_realtime import (
    CoCreationSessionSerializer,
    SessionParticipantSerializer,
    RealtimeEditSerializer,
    AIContributionSerializer,
    SessionChatSerializer
)


class CoCreationSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing co-creation sessions.
    """
    serializer_class = CoCreationSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return sessions where user is either creator or participant
        """
        user = self.request.user
        return CoCreationSession.objects.filter(
            Q(created_by=user) |
            Q(participants__user=user)
        ).distinct()

    def perform_create(self, serializer):
        """Create a new session and add creator as first participant"""
        session = serializer.save(created_by=self.request.user)
        SessionParticipant.objects.create(
            session=session,
            user=self.request.user,
            role='producer'  # Creator is automatically the producer
        )

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join an existing session"""
        session = self.get_object()
        
        # Check if user is already a participant
        if SessionParticipant.objects.filter(session=session, user=request.user).exists():
            return Response(
                {'detail': 'Already a participant'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if session is full
        if session.participants.count() >= session.max_participants:
            return Response(
                {'detail': 'Session is full'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Add user as participant
        participant = SessionParticipant.objects.create(
            session=session,
            user=request.user,
            role='observer'  # New participants start as observers
        )

        return Response(
            SessionParticipantSerializer(participant).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a session"""
        session = self.get_object()
        participant = get_object_or_404(
            SessionParticipant,
            session=session,
            user=request.user
        )
        participant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """Change a participant's role"""
        session = self.get_object()
        
        # Only producer can change roles
        if not session.participants.filter(
            user=request.user,
            role='producer'
        ).exists():
            return Response(
                {'detail': 'Only the producer can change roles'},
                status=status.HTTP_403_FORBIDDEN
            )

        participant = get_object_or_404(
            SessionParticipant,
            session=session,
            id=request.data.get('participant_id')
        )
        
        new_role = request.data.get('role')
        if new_role not in ['producer', 'composer', 'arranger', 'performer', 'observer']:
            return Response(
                {'detail': 'Invalid role'},
                status=status.HTTP_400_BAD_REQUEST
            )

        participant.role = new_role
        participant.save()

        return Response(SessionParticipantSerializer(participant).data)

    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """End a session"""
        session = self.get_object()
        
        # Only producer can end session
        if not session.participants.filter(
            user=request.user,
            role='producer'
        ).exists():
            return Response(
                {'detail': 'Only the producer can end the session'},
                status=status.HTTP_403_FORBIDDEN
            )

        session.active = False
        session.save()

        return Response({'detail': 'Session ended'})


class SessionParticipantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing session participants.
    """
    serializer_class = SessionParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return participants for sessions user is involved in"""
        user = self.request.user
        return SessionParticipant.objects.filter(
            Q(session__created_by=user) |
            Q(session__participants__user=user)
        ).distinct()


class RealtimeEditViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing realtime edits.
    """
    serializer_class = RealtimeEditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return edits for sessions user is involved in"""
        user = self.request.user
        return RealtimeEdit.objects.filter(
            Q(session__created_by=user) |
            Q(session__participants__user=user)
        ).distinct()

    def perform_create(self, serializer):
        participant = get_object_or_404(
            SessionParticipant,
            session_id=self.request.data.get('session'),
            user=self.request.user
        )
        
        # Check if participant has edit permissions
        if participant.role not in ['producer', 'composer', 'arranger']:
            return Response(
                {'detail': 'No permission to make edits'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer.save(participant=participant)


class AIContributionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing AI contributions.
    """
    serializer_class = AIContributionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return AI contributions for sessions user is involved in"""
        user = self.request.user
        return AIContribution.objects.filter(
            Q(session__created_by=user) |
            Q(session__participants__user=user)
        ).distinct()

    def perform_create(self, serializer):
        participant = get_object_or_404(
            SessionParticipant,
            session_id=self.request.data.get('session'),
            user=self.request.user
        )
        
        # Check if participant can request AI contributions
        if participant.role not in ['producer', 'composer', 'arranger']:
            return Response(
                {'detail': 'No permission to request AI contributions'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer.save(requested_by=participant)


class SessionChatViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing session chat messages.
    """
    serializer_class = SessionChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return chat messages for sessions user is involved in"""
        user = self.request.user
        return SessionChat.objects.filter(
            Q(session__created_by=user) |
            Q(session__participants__user=user)
        ).distinct()

    def perform_create(self, serializer):
        participant = get_object_or_404(
            SessionParticipant,
            session_id=self.request.data.get('session'),
            user=self.request.user
        )
        serializer.save(participant=participant)
