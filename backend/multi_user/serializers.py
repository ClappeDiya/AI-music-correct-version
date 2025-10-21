from rest_framework import serializers
from django.db.models import Count
from .models import (
    DJSession,
    SessionParticipant,
    TrackRequest,
    TrackVote,
    SessionMessage,
    SessionAnalytics
)

class SessionParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.URLField(source='user.profile.avatar_url', read_only=True)

    class Meta:
        model = SessionParticipant
        fields = [
            'id',
            'username',
            'avatar',
            'role',
            'joined_at',
            'last_active',
            'is_online',
        ]

class TrackVoteSerializer(serializers.ModelSerializer):
    voter_name = serializers.CharField(source='voter.user.username', read_only=True)

    class Meta:
        model = TrackVote
        fields = ['id', 'vote', 'voter_name', 'voted_at']

class TrackRequestSerializer(serializers.ModelSerializer):
    requested_by = SessionParticipantSerializer(read_only=True)
    votes = serializers.SerializerMethodField()
    vote_count = serializers.SerializerMethodField()

    class Meta:
        model = TrackRequest
        fields = [
            'id',
            'track_id',
            'track_title',
            'track_artist',
            'requested_by',
            'requested_at',
            'status',
            'played_at',
            'position_in_queue',
            'votes',
            'vote_count',
        ]

    def get_votes(self, obj):
        return {
            'up': obj.votes.filter(vote='up').count(),
            'down': obj.votes.filter(vote='down').count(),
        }

    def get_vote_count(self, obj):
        votes = self.get_votes(obj)
        return votes['up'] - votes['down']

class SessionMessageSerializer(serializers.ModelSerializer):
    sender = SessionParticipantSerializer(read_only=True)

    class Meta:
        model = SessionMessage
        fields = [
            'id',
            'sender',
            'message_type',
            'content',
            'sent_at',
            'metadata',
        ]

class SessionAnalyticsSerializer(serializers.ModelSerializer):
    engagement_rate = serializers.SerializerMethodField()
    popular_tracks = serializers.SerializerMethodField()

    class Meta:
        model = SessionAnalytics
        fields = [
            'id',
            'peak_participants',
            'total_tracks_played',
            'total_votes',
            'total_messages',
            'average_track_rating',
            'most_requested_genres',
            'participant_engagement',
            'session_duration',
            'engagement_rate',
            'popular_tracks',
        ]

    def get_engagement_rate(self, obj):
        if obj.peak_participants == 0:
            return 0
        total_interactions = (
            obj.total_votes +
            obj.total_messages +
            obj.total_tracks_played
        )
        return (total_interactions / obj.peak_participants) * 100

    def get_popular_tracks(self, obj):
        return (
            TrackRequest.objects.filter(session=obj.session)
            .annotate(vote_count=Count('votes'))
            .order_by('-vote_count')
            .values('track_title', 'track_artist', 'vote_count')[:5]
        )

class DJSessionSerializer(serializers.ModelSerializer):
    host = serializers.StringRelatedField()
    participants = SessionParticipantSerializer(many=True, read_only=True)
    current_track = serializers.SerializerMethodField()
    queue = serializers.SerializerMethodField()
    analytics = SessionAnalyticsSerializer(read_only=True)

    class Meta:
        model = DJSession
        fields = [
            'id',
            'name',
            'host',
            'is_active',
            'created_at',
            'updated_at',
            'max_participants',
            'is_public',
            'join_code',
            'settings',
            'participants',
            'current_track',
            'queue',
            'analytics',
        ]
        read_only_fields = ['join_code']

    def get_current_track(self, obj):
        current = (
            obj.track_requests
            .filter(status='playing')
            .first()
        )
        if current:
            return TrackRequestSerializer(current).data
        return None

    def get_queue(self, obj):
        queue = (
            obj.track_requests
            .filter(status='approved')
            .order_by('position_in_queue')
        )
        return TrackRequestSerializer(queue, many=True).data

class CreateDJSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DJSession
        fields = [
            'name',
            'max_participants',
            'is_public',
            'settings',
        ]

    def create(self, validated_data):
        # Generate a unique join code
        import random
        import string
        while True:
            join_code = ''.join(
                random.choices(string.ascii_uppercase + string.digits, k=6)
            )
            if not DJSession.objects.filter(join_code=join_code).exists():
                break

        validated_data['join_code'] = join_code
        validated_data['host'] = self.context['request'].user
        return super().create(validated_data)
