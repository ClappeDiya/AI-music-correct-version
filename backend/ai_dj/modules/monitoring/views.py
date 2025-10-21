from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from .models import MetricData, Alert, SystemHealth, PerformanceMetric, CacheableTrackTransition, DeploymentLog, ScalingEvent
from .serializers import (
    MetricDataSerializer,
    AlertSerializer,
    SystemHealthSerializer,
    PerformanceMetricSerializer,
    CacheableTrackTransitionSerializer,
    DeploymentLogSerializer,
    ScalingEventSerializer
)


class MetricDataViewSet(viewsets.ModelViewSet):
    serializer_class = MetricDataSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = MetricData.objects.all()
        metric_type = self.request.query_params.get('type')
        if metric_type:
            queryset = queryset.filter(metric_type=metric_type)
        
        # Time range filtering
        start_time = self.request.query_params.get('start')
        end_time = self.request.query_params.get('end')
        if start_time:
            queryset = queryset.filter(timestamp__gte=start_time)
        if end_time:
            queryset = queryset.filter(timestamp__lte=end_time)
        
        return queryset
    
    @action(detail=False, methods=['GET'])
    def aggregates(self, request):
        """Get aggregated metrics for dashboard."""
        now = timezone.now()
        hour_ago = now - timezone.timedelta(hours=1)
        
        metrics = MetricData.objects.filter(
            timestamp__gte=hour_ago
        ).values('metric_type').annotate(
            avg_value=models.Avg('value'),
            max_value=models.Max('value'),
            min_value=models.Min('value')
        )
        
        return Response(metrics)


class AlertViewSet(viewsets.ModelViewSet):
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Alert.objects.all()
        if not self.request.user.is_staff:
            # Non-staff users only see active alerts
            queryset = queryset.filter(resolved_at__isnull=True)
        return queryset
    
    @action(detail=True, methods=['POST'])
    def resolve(self, request, pk=None):
        """Resolve an alert."""
        alert = self.get_object()
        if alert.resolved_at:
            return Response(
                {'error': 'Alert already resolved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        alert.resolved_at = timezone.now()
        alert.resolved_by = request.user
        alert.save()
        
        return Response(AlertSerializer(alert).data)


class SystemHealthViewSet(viewsets.ModelViewSet):
    serializer_class = SystemHealthSerializer
    permission_classes = [IsAdminUser]
    queryset = SystemHealth.objects.all()
    
    @action(detail=False, methods=['GET'])
    def status(self, request):
        """Get overall system health status."""
        components = SystemHealth.objects.all()
        overall_status = 'healthy'
        
        if components.filter(status='down').exists():
            overall_status = 'down'
        elif components.filter(status='degraded').exists():
            overall_status = 'degraded'
        
        return Response({
            'status': overall_status,
            'components': SystemHealthSerializer(components, many=True).data
        })
    
    @action(detail=False, methods=['POST'])
    def check(self, request):
        """Trigger a health check of all components."""
        from .tasks import perform_health_check
        perform_health_check.delay()
        return Response({'status': 'Health check initiated'})


class PerformanceMetricViewSet(viewsets.ModelViewSet):
    queryset = PerformanceMetric.objects.all()
    serializer_class = PerformanceMetricSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def latest_metrics(self, request):
        latest = self.queryset.order_by('metric_type', '-timestamp').distinct('metric_type')
        serializer = self.get_serializer(latest, many=True)
        return Response(serializer.data)


class CacheableTrackTransitionViewSet(viewsets.ModelViewSet):
    queryset = CacheableTrackTransition.objects.all()
    serializer_class = CacheableTrackTransitionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def increment_hits(self, request, pk=None):
        transition = self.get_object()
        transition.hit_count += 1
        transition.last_accessed = timezone.now()
        transition.save()
        serializer = self.get_serializer(transition)
        return Response(serializer.data)


class DeploymentLogViewSet(viewsets.ModelViewSet):
    queryset = DeploymentLog.objects.all()
    serializer_class = DeploymentLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def complete_deployment(self, request, pk=None):
        deployment = self.get_object()
        deployment.status = 'completed'
        deployment.completed_at = timezone.now()
        deployment.save()
        serializer = self.get_serializer(deployment)
        return Response(serializer.data)


class ScalingEventViewSet(viewsets.ModelViewSet):
    queryset = ScalingEvent.objects.all()
    serializer_class = ScalingEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def recent_events(self, request):
        recent = self.queryset.filter(
            timestamp__gte=timezone.now() - timezone.timedelta(hours=24)
        )
        serializer = self.get_serializer(recent, many=True)
        return Response(serializer.data)
