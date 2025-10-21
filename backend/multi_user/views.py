from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from .models import (
    DJSession,
    SessionParticipant,
    TrackRequest,
    TrackVote,
    SessionMessage,
    SessionAnalytics
)
from .serializers import (
    DJSessionSerializer,
    CreateDJSessionSerializer,
    SessionParticipantSerializer,
    TrackRequestSerializer,
    TrackVoteSerializer,
    SessionMessageSerializer,
    SessionAnalyticsSerializer
)

class DJSessionViewSet(viewsets.ModelViewSet):
    queryset = DJSession.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateDJSessionSerializer
        return DJSessionSerializer

    def get_queryset(self):
        return self.queryset.filter(
            Q(host=self.request.user) |
            Q(participants__user=self.request.user)
        ).distinct()

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        session = self.get_object()
        join_code = request.data.get('join_code')
        
        if not join_code or join_code != session.join_code:
            return Response(
                {'error': 'Invalid join code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if session.participants.count() >= session.max_participants:
            return Response(
                {'error': 'Session is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant, created = SessionParticipant.objects.get_or_create(
            session=session,
            user=request.user,
            defaults={'role': 'participant'}
        )
        
        if not created:
            participant.is_online = True
            participant.save()
        
        return Response(SessionParticipantSerializer(participant).data)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        session = self.get_object()
        participant = session.participants.filter(user=request.user).first()
        
        if participant:
            participant.is_online = False
            participant.save()
        
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    def request_track(self, request, pk=None):
        session = self.get_object()
        participant = session.participants.get(user=request.user)
        
        track_data = request.data
        track_request = TrackRequest.objects.create(
            session=session,
            requested_by=participant,
            track_id=track_data['track_id'],
            track_title=track_data['title'],
            track_artist=track_data['artist']
        )
        
        return Response(TrackRequestSerializer(track_request).data)

    @action(detail=True, methods=['post'])
    def vote_track(self, request, pk=None):
        session = self.get_object()
        participant = session.participants.get(user=request.user)
        track_request = session.track_requests.get(
            id=request.data['track_request_id']
        )
        
        vote, created = TrackVote.objects.get_or_create(
            track_request=track_request,
            voter=participant,
            defaults={'vote': request.data['vote']}
        )
        
        if not created:
            vote.vote = request.data['vote']
            vote.save()
        
        return Response(TrackRequestSerializer(track_request).data)

class SessionParticipantViewSet(viewsets.GenericViewSet,
                              mixins.ListModelMixin,
                              mixins.RetrieveModelMixin):
    queryset = SessionParticipant.objects.all()
    serializer_class = SessionParticipantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(
            session__participants__user=self.request.user
        )

    @action(detail=True, methods=['post'])
    def update_role(self, request, pk=None):
        participant = self.get_object()
        session = participant.session
        
        if request.user != session.host:
            return Response(
                {'error': 'Only host can update roles'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        participant.role = request.data['role']
        participant.save()
        return Response(self.get_serializer(participant).data)

class TrackRequestViewSet(viewsets.ModelViewSet):
    queryset = TrackRequest.objects.all()
    serializer_class = TrackRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(
            session__participants__user=self.request.user
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        track_request = self.get_object()
        session = track_request.session
        
        if request.user != session.host:
            return Response(
                {'error': 'Only host can update track status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        track_request.status = request.data['status']
        if track_request.status == 'playing':
            track_request.played_at = timezone.now()
        track_request.save()
        
        return Response(self.get_serializer(track_request).data)

class SessionMessageViewSet(viewsets.ModelViewSet):
    queryset = SessionMessage.objects.all()
    serializer_class = SessionMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(
            session__participants__user=self.request.user
        )

    def perform_create(self, serializer):
        session = DJSession.objects.get(pk=self.request.data['session'])
        participant = session.participants.get(user=self.request.user)
        serializer.save(sender=participant)

class SessionAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SessionAnalytics.objects.all()
    serializer_class = SessionAnalyticsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(
            session__participants__user=self.request.user
        )

    @action(detail=True, methods=['get'])
    def detailed_stats(self, request, pk=None):
        analytics = self.get_object()
        session = analytics.session
        
        stats = {
            'track_stats': {
                'total_requests': session.track_requests.count(),
                'approved_requests': session.track_requests.filter(
                    status='approved'
                ).count(),
                'rejected_requests': session.track_requests.filter(
                    status='rejected'
                ).count(),
                'average_queue_time': session.track_requests.filter(
                    status='played'
                ).aggregate(avg_time=models.Avg(
                    models.F('played_at') - models.F('requested_at')
                ))['avg_time'],
            },
            'participant_stats': {
                'total_participants': session.participants.count(),
                'active_participants': session.participants.filter(
                    is_online=True
                ).count(),
                'participation_by_role': session.participants.values(
                    'role'
                ).annotate(count=Count('id')),
            },
            'engagement_stats': {
                'messages_per_hour': session.messages.count() / (
                    (timezone.now() - session.created_at).total_seconds() / 3600
                ),
                'votes_per_track': session.track_requests.annotate(
                    vote_count=Count('votes')
                ).aggregate(avg_votes=models.Avg('vote_count'))['avg_votes'],
            }
        }
        
        return Response(stats)
