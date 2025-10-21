from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

from .models import VoiceChannel, VoiceParticipant, DJComment, ChatMessage
from .serializers import (
    VoiceChannelSerializer, VoiceParticipantSerializer,
    DJCommentSerializer, ChatMessageSerializer
)

class VoiceChannelViewSet(viewsets.ModelViewSet):
    queryset = VoiceChannel.objects.all()
    serializer_class = VoiceChannelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('session_id'):
            queryset = queryset.filter(
                session_id=self.request.query_params['session_id']
            )
        return queryset.annotate(
            participant_count=Count('voiceparticipant')
        )

    @action(detail=True, methods=['POST'])
    def join(self, request, pk=None):
        channel = self.get_object()
        
        # Check if user is already in the channel
        participant, created = VoiceParticipant.objects.get_or_create(
            channel=channel,
            user=request.user,
            defaults={'peer_id': request.data.get('peer_id')}
        )
        
        if not created:
            participant.peer_id = request.data.get('peer_id')
            participant.save()
        
        serializer = VoiceParticipantSerializer(participant)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def leave(self, request, pk=None):
        channel = self.get_object()
        VoiceParticipant.objects.filter(
            channel=channel,
            user=request.user
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class VoiceParticipantViewSet(viewsets.ModelViewSet):
    queryset = VoiceParticipant.objects.all()
    serializer_class = VoiceParticipantSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['POST'])
    def toggle_mute(self, request, pk=None):
        participant = self.get_object()
        participant.is_muted = not participant.is_muted
        participant.save()
        serializer = self.get_serializer(participant)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def set_speaking(self, request, pk=None):
        participant = self.get_object()
        participant.is_speaking = request.data.get('is_speaking', False)
        participant.save()
        serializer = self.get_serializer(participant)
        return Response(serializer.data)

class DJCommentViewSet(viewsets.ModelViewSet):
    queryset = DJComment.objects.all()
    serializer_class = DJCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('session_id'):
            queryset = queryset.filter(
                session_id=self.request.query_params['session_id']
            )
        return queryset

    @action(detail=True, methods=['POST'])
    def react(self, request, pk=None):
        comment = self.get_object()
        comment.reaction_count += 1
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def mark_helpful(self, request, pk=None):
        comment = self.get_object()
        comment.was_helpful = True
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def recent_comments(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        recent_time = timezone.now() - timedelta(minutes=30)
        comments = self.queryset.filter(
            session_id=session_id,
            created_at__gte=recent_time
        ).order_by('-priority', '-created_at')
        
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('channel_id'):
            queryset = queryset.filter(
                channel_id=self.request.query_params['channel_id']
            )
        # Only get parent messages by default
        return queryset.filter(parent_message__isnull=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def reply(self, request, pk=None):
        parent_message = self.get_object()
        serializer = self.get_serializer(data={
            'channel': parent_message.channel.id,
            'content': request.data.get('content'),
            'parent_message': parent_message.id
        })
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data)
