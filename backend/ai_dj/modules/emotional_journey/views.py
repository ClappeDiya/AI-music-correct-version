from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count
from django.db.models.functions import ExtractHour
from .models import (
    EmotionalState,
    EmotionalJourney,
    JourneyWaypoint,
    SessionJourney,
    EmotionalSnapshot,
    JourneyFeedback,
    EmotionalAnalytics
)
from .serializers import (
    EmotionalStateSerializer,
    EmotionalJourneySerializer,
    JourneyWaypointSerializer,
    SessionJourneySerializer,
    EmotionalSnapshotSerializer,
    JourneyFeedbackSerializer,
    EmotionalAnalyticsSerializer
)

class EmotionalStateViewSet(viewsets.ModelViewSet):
    queryset = EmotionalState.objects.all()
    serializer_class = EmotionalStateSerializer
    permission_classes = [IsAuthenticated]

class EmotionalJourneyViewSet(viewsets.ModelViewSet):
    queryset = EmotionalJourney.objects.all()
    serializer_class = EmotionalJourneySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        journey = self.get_object()
        analytics = EmotionalAnalytics.objects.get_or_create(journey=journey)[0]
        return Response(EmotionalAnalyticsSerializer(analytics).data)

class JourneyWaypointViewSet(viewsets.ModelViewSet):
    queryset = JourneyWaypoint.objects.all()
    serializer_class = JourneyWaypointSerializer
    permission_classes = [IsAuthenticated]

class SessionJourneyViewSet(viewsets.ModelViewSet):
    queryset = SessionJourney.objects.all()
    serializer_class = SessionJourneySerializer
    permission_classes = [IsAuthenticated]

class EmotionalSnapshotViewSet(viewsets.ModelViewSet):
    queryset = EmotionalSnapshot.objects.all()
    serializer_class = EmotionalSnapshotSerializer
    permission_classes = [IsAuthenticated]

class JourneyFeedbackViewSet(viewsets.ModelViewSet):
    queryset = JourneyFeedback.objects.all()
    serializer_class = JourneyFeedbackSerializer
    permission_classes = [IsAuthenticated]

class EmotionalAnalyticsViewSet(viewsets.ModelViewSet):
    queryset = EmotionalAnalytics.objects.all()
    serializer_class = EmotionalAnalyticsSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def user_insights(self, request):
        user = request.user
        user_journeys = EmotionalJourney.objects.filter(created_by=user)
        
        return Response({
            'total_journeys': user_journeys.count(),
            'avg_duration': user_journeys.aggregate(
                avg_duration=Avg('duration_minutes')
            )['avg_duration'] or 0,
            'preferred_states': JourneyWaypoint.objects.filter(
                journey__in=user_journeys
            ).values('emotional_state__name').annotate(
                count=Count('id')
            ).order_by('-count')[:5],
            'peak_hours': SessionJourney.objects.filter(
                journey__in=user_journeys
            ).annotate(
                hour=ExtractHour('start_time')
            ).values('hour').annotate(
                count=Count('id')
            ).order_by('-count')[:5]
        })
