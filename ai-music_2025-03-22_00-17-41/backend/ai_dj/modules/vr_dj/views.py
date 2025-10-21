from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import VRDJSession, VRDJControl, VRDJEnvironment, VRDJInteraction
from .serializers import (
    VRDJSessionSerializer,
    VRDJControlSerializer,
    VRDJEnvironmentSerializer,
    VRDJInteractionSerializer
)


class VRDJSessionViewSet(viewsets.ModelViewSet):
    serializer_class = VRDJSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VRDJSession.objects.filter(
            Q(user=self.request.user) |
            Q(is_collaborative=True)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def join_collaborative(self, request, pk=None):
        session = self.get_object()
        if not session.is_collaborative:
            return Response(
                {"error": "This session is not collaborative"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add user to collaborative session
        session.collaborators.add(request.user)
        return Response({"status": "joined"})


class VRDJControlViewSet(mixins.CreateModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.ListModelMixin,
                        viewsets.GenericViewSet):
    serializer_class = VRDJControlSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VRDJControl.objects.filter(
            session__user=self.request.user
        )

    @action(detail=False, methods=['POST'])
    def batch_update(self, request):
        controls = request.data.get('controls', [])
        serializer = self.get_serializer(data=controls, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class VRDJEnvironmentViewSet(viewsets.ModelViewSet):
    serializer_class = VRDJEnvironmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VRDJEnvironment.objects.filter(
            session__user=self.request.user
        )

    @action(detail=True, methods=['POST'])
    def apply_preset(self, request, pk=None):
        environment = self.get_object()
        preset_name = request.data.get('preset')
        
        # Apply preset configuration
        if preset_name in ['ambient', 'dynamic', 'reactive']:
            environment.lighting_preset = preset_name
            environment.save()
            return Response(self.get_serializer(environment).data)
        
        return Response(
            {"error": "Invalid preset"},
            status=status.HTTP_400_BAD_REQUEST
        )


class VRDJInteractionViewSet(mixins.CreateModelMixin,
                            mixins.RetrieveModelMixin,
                            mixins.ListModelMixin,
                            viewsets.GenericViewSet):
    serializer_class = VRDJInteractionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VRDJInteraction.objects.filter(
            session__user=self.request.user
        )

    @action(detail=False, methods=['GET'])
    def session_stats(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        interactions = self.get_queryset().filter(session_id=session_id)
        stats = {
            'total_interactions': interactions.count(),
            'interaction_types': {},
            'average_success_rating': None
        }

        # Calculate interaction type distribution
        for interaction in interactions:
            interaction_type = interaction.interaction_type
            stats['interaction_types'][interaction_type] = (
                stats['interaction_types'].get(interaction_type, 0) + 1
            )

        # Calculate average success rating
        success_ratings = [
            i.success_rating for i in interactions
            if i.success_rating is not None
        ]
        if success_ratings:
            stats['average_success_rating'] = sum(success_ratings) / len(success_ratings)

        return Response(stats)
