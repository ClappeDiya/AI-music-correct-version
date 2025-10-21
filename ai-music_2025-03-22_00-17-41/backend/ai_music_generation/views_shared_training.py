from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models_shared_training import (
    SharedModelGroup,
    SharedModelMember,
    TrainingContribution,
    ModelTrainingJob
)
from .serializers_shared_training import (
    SharedModelGroupSerializer,
    SharedModelGroupDetailSerializer,
    SharedModelMemberSerializer,
    TrainingContributionSerializer,
    ModelTrainingJobSerializer
)
from .services.shared_model_training import SharedModelTrainingService


class SharedModelGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing shared model groups.
    """
    serializer_class = SharedModelGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return groups user is a member of"""
        user = self.request.user
        return SharedModelGroup.objects.filter(
            Q(created_by=user) |
            Q(members__user=user)
        ).distinct()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SharedModelGroupDetailSerializer
        return SharedModelGroupSerializer

    def perform_create(self, serializer):
        """Create group and add creator as admin"""
        group = serializer.save(created_by=self.request.user)
        SharedModelMember.objects.create(
            group=group,
            user=self.request.user,
            role='admin'
        )

    @action(detail=True, methods=['post'])
    def invite_member(self, request, pk=None):
        """Invite a new member to the group"""
        group = self.get_object()
        
        # Check if user has admin rights
        if not group.members.filter(
            user=request.user,
            role='admin'
        ).exists():
            return Response(
                {'detail': 'Only admins can invite members'},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        role = request.data.get('role', 'contributor')
        
        if role not in ['admin', 'contributor', 'viewer']:
            return Response(
                {'detail': 'Invalid role'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create membership
        member = SharedModelMember.objects.create(
            group=group,
            user_id=user_id,
            role=role
        )

        return Response(
            SharedModelMemberSerializer(member).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def contribute_track(self, request, pk=None):
        """Add a track to the group's training dataset"""
        group = self.get_object()
        member = get_object_or_404(
            SharedModelMember,
            group=group,
            user=request.user
        )

        serializer = TrainingContributionSerializer(data=request.data)
        if serializer.is_valid():
            contribution = serializer.save(
                group=group,
                contributor=member
            )
            
            # Update member's contribution count
            member.contribution_count += 1
            member.save()

            return Response(
                TrainingContributionSerializer(contribution).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def start_training(self, request, pk=None):
        """Start a new training job for the group's model"""
        group = self.get_object()
        
        # Check if user has admin rights
        if not group.members.filter(
            user=request.user,
            role='admin'
        ).exists():
            return Response(
                {'detail': 'Only admins can start training'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if there's already a training job in progress
        if group.training_jobs.filter(
            status__in=['queued', 'running']
        ).exists():
            return Response(
                {'detail': 'Training already in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create new training job
        job = ModelTrainingJob.objects.create(group=group)
        
        # Update group status
        group.training_status = 'training'
        group.save()

        # Start training process asynchronously
        training_service = SharedModelTrainingService()
        training_service.start_training_job(job.id)

        return Response(
            ModelTrainingJobSerializer(job).data,
            status=status.HTTP_201_CREATED
        )


class SharedModelMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing group members.
    """
    serializer_class = SharedModelMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return memberships for groups user is involved in"""
        user = self.request.user
        return SharedModelMember.objects.filter(
            Q(group__created_by=user) |
            Q(group__members__user=user)
        ).distinct()

    def perform_update(self, serializer):
        """Update member role"""
        member = self.get_object()
        
        # Check if user has admin rights
        if not member.group.members.filter(
            user=self.request.user,
            role='admin'
        ).exists():
            return Response(
                {'detail': 'Only admins can update member roles'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer.save()


class TrainingContributionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing training contributions.
    """
    serializer_class = TrainingContributionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return contributions for groups user is involved in"""
        user = self.request.user
        return TrainingContribution.objects.filter(
            Q(group__created_by=user) |
            Q(group__members__user=user)
        ).distinct()

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Review a training contribution"""
        contribution = self.get_object()
        
        # Check if user has admin rights
        if not contribution.group.members.filter(
            user=request.user,
            role='admin'
        ).exists():
            return Response(
                {'detail': 'Only admins can review contributions'},
                status=status.HTTP_403_FORBIDDEN
            )

        status = request.data.get('status')
        if status not in ['approved', 'rejected']:
            return Response(
                {'detail': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        contribution.status = status
        contribution.review_notes = request.data.get('review_notes', '')
        contribution.save()

        return Response(
            TrainingContributionSerializer(contribution).data
        )


class ModelTrainingJobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing training jobs.
    """
    serializer_class = ModelTrainingJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return training jobs for groups user is involved in"""
        user = self.request.user
        return ModelTrainingJob.objects.filter(
            Q(group__created_by=user) |
            Q(group__members__user=user)
        ).distinct()
