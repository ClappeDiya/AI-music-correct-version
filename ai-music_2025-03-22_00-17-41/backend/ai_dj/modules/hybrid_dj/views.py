from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from .models import (
    HumanDJPreference,
    TransitionPreset,
    HumanDJAction,
    AIRecommendation
)
from .serializers import (
    HumanDJPreferenceSerializer,
    TransitionPresetSerializer,
    HumanDJActionSerializer,
    AIRecommendationSerializer
)

class HumanDJPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = HumanDJPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HumanDJPreference.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransitionPresetViewSet(viewsets.ModelViewSet):
    serializer_class = TransitionPresetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TransitionPreset.objects.filter(
            Q(created_by=self.request.user) | Q(is_public=True)
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['POST'])
    def duplicate(self, request, pk=None):
        preset = self.get_object()
        new_preset = TransitionPreset.objects.create(
            name=f"Copy of {preset.name}",
            created_by=request.user,
            effect_type=preset.effect_type,
            duration=preset.duration,
            effect_parameters=preset.effect_parameters,
            is_public=False
        )
        serializer = self.get_serializer(new_preset)
        return Response(serializer.data)

class HumanDJActionViewSet(viewsets.ModelViewSet):
    serializer_class = HumanDJActionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = HumanDJAction.objects.filter(user=self.request.user)
        session_id = self.request.query_params.get('session_id')
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['GET'])
    def session_summary(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        actions = self.get_queryset().filter(session_id=session_id)
        summary = {
            'total_actions': actions.count(),
            'actions_by_type': {},
            'suggestions_accepted': 0,
            'suggestions_rejected': 0
        }

        for action in actions:
            action_type = action.get_action_type_display()
            summary['actions_by_type'][action_type] = (
                summary['actions_by_type'].get(action_type, 0) + 1
            )
            if action.action_type == 'suggestion_accept':
                summary['suggestions_accepted'] += 1
            elif action.action_type == 'suggestion_reject':
                summary['suggestions_rejected'] += 1

        return Response(summary)

class AIRecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = AIRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AIRecommendation.objects.all()
        session_id = self.request.query_params.get('session_id')
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset

    @action(detail=True, methods=['POST'])
    def accept(self, request, pk=None):
        recommendation = self.get_object()
        recommendation.was_accepted = True
        recommendation.save()

        # Record the action
        HumanDJAction.objects.create(
            session=recommendation.session,
            user=request.user,
            action_type='suggestion_accept',
            track=recommendation.suggested_track,
            parameters={
                'recommendation_type': recommendation.recommendation_type,
                'parameters': recommendation.parameters
            }
        )

        serializer = self.get_serializer(recommendation)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def reject(self, request, pk=None):
        recommendation = self.get_object()
        recommendation.was_accepted = False
        recommendation.save()

        # Record the action
        HumanDJAction.objects.create(
            session=recommendation.session,
            user=request.user,
            action_type='suggestion_reject',
            track=recommendation.suggested_track,
            parameters={
                'recommendation_type': recommendation.recommendation_type,
                'reason': request.data.get('reason', 'No reason provided')
            }
        )

        serializer = self.get_serializer(recommendation)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def pending(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        recommendations = self.get_queryset().filter(
            session_id=session_id,
            was_accepted=None
        ).order_by('-confidence_score')

        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)
