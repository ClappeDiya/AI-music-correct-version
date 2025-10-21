from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as django_filters
from .models import ModelCapability, ModelRouter, ModelRouterAssignment
from .router_serializers import ModelCapabilitySerializer, ModelRouterSerializer, ModelRouterAssignmentSerializer
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)


class BaseTenantAwareViewSet(viewsets.ModelViewSet):
    """
    Base viewset that extends ModelViewSet.
    No tenant functionality needed as project uses row-level security.
    """
    pass


class ModelCapabilityViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing model capabilities.
    """
    queryset = ModelCapability.objects.all()
    serializer_class = ModelCapabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['provider', 'capability_type']
    search_fields = ['capability_type']
    ordering_fields = ['confidence_score', 'latency_ms', 'created_at']

    @action(detail=False, methods=['get'])
    def by_provider(self, request):
        """
        Get capabilities grouped by provider.
        """
        provider_id = request.query_params.get('provider_id')
        if provider_id:
            capabilities = self.queryset.filter(provider_id=provider_id)
        else:
            capabilities = self.queryset.all()
        
        serializer = self.get_serializer(capabilities, many=True)
        return Response(serializer.data)


class ModelRouterViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing model routers.
    """
    queryset = ModelRouter.objects.all()
    serializer_class = ModelRouterSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['request', 'routing_strategy']
    ordering_fields = ['created_at', 'completed_at']

    @action(detail=True, methods=['post'])
    def analyze_prompt(self, request, pk=None):
        """
        Analyze the prompt and break it down into subtasks.
        """
        router = self.get_object()
        router.analyze_prompt()
        serializer = self.get_serializer(router)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def select_providers(self, request, pk=None):
        """
        Select appropriate providers for the tasks.
        """
        router = self.get_object()
        router.select_providers()
        serializer = self.get_serializer(router)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def execute_tasks(self, request, pk=None):
        """
        Execute the tasks according to the routing strategy.
        """
        router = self.get_object()
        router.execute_tasks()
        serializer = self.get_serializer(router)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def handle_failures(self, request, pk=None):
        """
        Handle any provider failures.
        """
        router = self.get_object()
        router.handle_failures()
        serializer = self.get_serializer(router)
        return Response(serializer.data)


class ModelRouterAssignmentViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing model router assignments.
    """
    queryset = ModelRouterAssignment.objects.all()
    serializer_class = ModelRouterAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['router', 'provider', 'task_type', 'status']
    ordering_fields = ['priority', 'started_at', 'completed_at']

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """
        Execute the assigned task.
        """
        assignment = self.get_object()
        assignment.execute()
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def record_result(self, request, pk=None):
        """
        Record the result of task execution.
        """
        assignment = self.get_object()
        result = request.data.get('result')
        assignment.record_result(result)
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def handle_error(self, request, pk=None):
        """
        Handle and record task execution error.
        """
        assignment = self.get_object()
        error = request.data.get('error')
        assignment.handle_error(error)
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)
