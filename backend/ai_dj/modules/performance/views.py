from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from django.core.cache import cache
from .models import (
    CacheableTrackTransition,
    PerformanceMetric,
    DeploymentLog,
    ScalingEvent
)
from .serializers import (
    CacheableTrackTransitionSerializer,
    PerformanceMetricSerializer,
    DeploymentLogSerializer,
    ScalingEventSerializer
)
from .tasks import (
    update_cache_statistics,
    trigger_auto_scaling,
    monitor_system_health
)


class CacheableTrackTransitionViewSet(viewsets.ModelViewSet):
    serializer_class = CacheableTrackTransitionSerializer
    permission_classes = [IsAdminUser]
    queryset = CacheableTrackTransition.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            min_hits = self.request.query_params.get('min_hits', 10)
            queryset = queryset.filter(hit_count__gte=min_hits)
        return queryset

    @action(detail=False, methods=['POST'])
    def update_cache_stats(self, request):
        """Update cache hit statistics."""
        update_cache_statistics.delay()
        return Response({'status': 'Cache statistics update initiated'})

    @action(detail=True, methods=['POST'])
    def invalidate_cache(self, request, pk=None):
        """Invalidate specific cache entry."""
        transition = self.get_object()
        cache.delete(transition.cache_key)
        return Response({'status': 'Cache invalidated'})


class PerformanceMetricViewSet(viewsets.ModelViewSet):
    serializer_class = PerformanceMetricSerializer
    permission_classes = [IsAdminUser]
    queryset = PerformanceMetric.objects.all()

    @action(detail=False, methods=['GET'])
    def system_health(self, request):
        """Get current system health metrics."""
        monitor_system_health.delay()
        latest_metrics = PerformanceMetric.objects.filter(
            timestamp__gte=timezone.now() - timezone.timedelta(minutes=5)
        ).order_by('metric_type', '-timestamp').distinct('metric_type')
        
        return Response(
            PerformanceMetricSerializer(latest_metrics, many=True).data
        )


class DeploymentLogViewSet(viewsets.ModelViewSet):
    serializer_class = DeploymentLogSerializer
    permission_classes = [IsAdminUser]
    queryset = DeploymentLog.objects.all()

    @action(detail=True, methods=['POST'])
    def rollback(self, request, pk=None):
        """Initiate deployment rollback."""
        deployment = self.get_object()
        if deployment.status != 'completed':
            return Response(
                {'error': 'Can only rollback completed deployments'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create rollback deployment
        rollback = DeploymentLog.objects.create(
            deployment_type='rollback',
            version=f"{deployment.version}_rollback",
            details={
                'original_deployment': deployment.id,
                'reason': request.data.get('reason', 'Manual rollback')
            },
            affected_services=deployment.affected_services
        )

        # Update original deployment status
        deployment.status = 'rolled_back'
        deployment.save()

        return Response(DeploymentLogSerializer(rollback).data)


class ScalingEventViewSet(viewsets.ModelViewSet):
    serializer_class = ScalingEventSerializer
    permission_classes = [IsAdminUser]
    queryset = ScalingEvent.objects.all()

    @action(detail=False, methods=['POST'])
    def trigger_scaling(self, request):
        """Manually trigger auto-scaling evaluation."""
        trigger_auto_scaling.delay()
        return Response({'status': 'Auto-scaling evaluation triggered'})
