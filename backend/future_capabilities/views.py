# views.py for future_capabilities
# This file contains the viewsets for the future_capabilities app, providing API endpoints for managing various future-oriented features.

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters import rest_framework as filters
from django.db.models import Q, Count, Avg
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .cache import cached_response, handle_bulk_operation, BulkOperationError
from .error_handling import (
    handle_api_error,
    APIError,
    ResourceNotFoundError,
    ValidationAPIError,
    RateLimitExceededError
)
from .models import (
    VREnvironmentConfig,
    CollaborationSession,
    CollaborationActivityLog,
    AIPluginRegistry,
    UserStyleProfile,
    DeviceIntegrationConfig,
    BiofeedbackDataLog,
    ThirdPartyIntegration,
    MiniAppRegistry,
    UserFeedbackLog,
    FeatureRoadmap,
    MicroserviceRegistry,
    MicrofluidicInstrumentConfig,
    DimensionalityModel,
    AIAgentPartnership,
    SynestheticMapping,
    SemanticLayer,
    PipelineEvolutionLog,
    InterstellarLatencyConfig,
    DAWControlState,
    VRInteractionLog,
    NeuralDevice,
    NeuralSignal,
    NeuralControl,
    WearableDevice,
    BiofeedbackData,
    BiofeedbackEvent,
    PluginDeveloper,
    Plugin,
    PluginInstallation,
    PluginRating,
    PluginUsageLog,
    FeatureSurvey,
    SurveyResponse,
    FeatureUsageAnalytics
)
from .serializers import (
    VREnvironmentConfigSerializer,
    CollaborationSessionSerializer,
    CollaborationActivityLogSerializer,
    AIPluginRegistrySerializer,
    UserStyleProfileSerializer,
    DeviceIntegrationConfigSerializer,
    BiofeedbackDataLogSerializer,
    ThirdPartyIntegrationSerializer,
    MiniAppRegistrySerializer,
    UserFeedbackLogSerializer,
    FeatureRoadmapSerializer,
    MicroserviceRegistrySerializer,
    MicrofluidicInstrumentConfigSerializer,
    DimensionalityModelSerializer,
    AIAgentPartnershipSerializer,
    SynestheticMappingSerializer,
    SemanticLayerSerializer,
    PipelineEvolutionLogSerializer,
    InterstellarLatencyConfigSerializer,
    DAWControlStateSerializer,
    VRInteractionLogSerializer,
    NeuralDeviceSerializer,
    NeuralSignalSerializer,
    NeuralControlSerializer,
    WearableDeviceSerializer,
    BiofeedbackDataSerializer,
    BiofeedbackEventSerializer,
    PluginDeveloperSerializer,
    PluginSerializer,
    PluginInstallationSerializer,
    PluginRatingSerializer,
    PluginUsageLogSerializer,
    FeatureSurveySerializer,
    SurveyResponseSerializer,
    FeatureUsageAnalyticsSerializer,
    FeatureRequestSerializer,
    FeatureRequestVoteSerializer
)
from .permissions import (
    IsAdminOrReadOnly,
    HasRequiredRole,
    IsOwnerOrAdmin
)
from django.utils import timezone
from django.db.models import Count
from rest_framework.decorators import api_view
from rest_framework.filters import DjangoFilterBackend
from rest_framework.filters import OrderingFilter


class BaseSecureViewSet(viewsets.ModelViewSet):
    """
    Base viewset that implements user-specific security and filtering.
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter queryset based on user's role and permissions.
        """
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_superuser:
            return queryset
            
        if hasattr(self, 'user_field'):
            return queryset.filter(**{self.user_field: user.id})
            
        if hasattr(self, 'role_field'):
            return queryset.filter(
                Q(**{self.role_field + '__in': user.get_roles()}) |
                Q(created_by=user.id)
            )
            
        return queryset


class VREnvironmentConfigViewSet(BaseSecureViewSet):
    """
    ViewSet for managing VR environment configurations.
    """
    queryset = VREnvironmentConfig.objects.all()
    serializer_class = VREnvironmentConfigSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_fields = ['environment_name']
    search_fields = ['environment_name']

    @cached_response(timeout=3600)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @cached_response(timeout=3600)
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @handle_api_error
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple VR environments at once."""
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        
        successful_items, failed_items = handle_bulk_operation(
            serializer.validated_data,
            lambda item: self.perform_create(self.get_serializer(data=item))
        )

        return Response({
            'successful': successful_items,
            'failed': failed_items
        }, status=status.HTTP_201_CREATED if not failed_items else status.HTTP_207_MULTI_STATUS)


class CollaborationSessionViewSet(BaseSecureViewSet):
    """
    ViewSet for managing collaboration sessions.
    """
    queryset = CollaborationSession.objects.all()
    serializer_class = CollaborationSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_fields = ['session_name', 'active']
    search_fields = ['session_name']
    user_field = 'participant_user_ids__contains'

    def get_queryset(self):
        """
        Filter sessions where user is a participant
        """
        queryset = super().get_queryset()
        if not self.request.user.is_superuser:
            queryset = queryset.filter(
                Q(participant_user_ids__contains=[self.request.user.id]) |
                Q(created_by=self.request.user.id)
            )
        return queryset

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        session = self.get_object()
        if not request.user.has_perm('future_capabilities.change_collaborationsession'):
            return Response(
                {'error': 'Insufficient permissions'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        session.active = True
        session.save()
        return Response({'status': 'session activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        session = self.get_object()
        if not request.user.has_perm('future_capabilities.change_collaborationsession'):
            return Response(
                {'error': 'Insufficient permissions'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        session.active = False
        session.save()
        return Response({'status': 'session deactivated'})


class CollaborationActivityLogViewSet(BaseSecureViewSet):
    """
    ViewSet for managing collaboration activity logs.
    """
    queryset = CollaborationActivityLog.objects.all()
    serializer_class = CollaborationActivityLogSerializer
    permission_classes = [IsAuthenticated]
    filter_fields = ['session', 'user_id', 'action_type']
    search_fields = ['action_detail']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_superuser:
            return queryset.filter(
                Q(user_id=user.id) |
                Q(session__participant_user_ids__contains=[user.id]) |
                Q(session__moderators__contains=[user.id])
            )
        return queryset


class AIPluginRegistryViewSet(BaseSecureViewSet):
    """
    ViewSet for managing AI plugin registry.
    """
    queryset = AIPluginRegistry.objects.all()
    serializer_class = AIPluginRegistrySerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_fields = ['plugin_name', 'version', 'access_level', 'approved']
    search_fields = ['plugin_name', 'plugin_description']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            return queryset.filter(
                Q(access_level='public') |
                Q(created_by=user)
            ).filter(approved=True)
        return queryset


class UserStyleProfileViewSet(BaseSecureViewSet):
    """
    ViewSet for managing user style profiles.
    """
    queryset = UserStyleProfile.objects.all()
    serializer_class = UserStyleProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    search_fields = ['user_id']
    user_field = 'user_id'


class DeviceIntegrationConfigViewSet(BaseSecureViewSet):
    """
    ViewSet for managing device integration configurations.
    """
    queryset = DeviceIntegrationConfig.objects.all()
    serializer_class = DeviceIntegrationConfigSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filter_fields = ['device_type', 'status', 'security_level']
    search_fields = ['device_type']
    user_field = 'user'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            return queryset.filter(user=user)
        return queryset


class BiofeedbackDataLogViewSet(BaseSecureViewSet):
    """
    ViewSet for managing biofeedback data logs.
    """
    queryset = BiofeedbackDataLog.objects.all()
    serializer_class = BiofeedbackDataLogSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    search_fields = ['user_id']
    user_field = 'user_id'


class ThirdPartyIntegrationViewSet(BaseSecureViewSet):
    """
    ViewSet for managing third-party integrations.
    """
    queryset = ThirdPartyIntegration.objects.all()
    serializer_class = ThirdPartyIntegrationSerializer
    permission_classes = [IsAuthenticated, HasRequiredRole]
    filter_fields = ['partner_name', 'integration_type', 'status', 'security_level']
    search_fields = ['partner_name']
    required_role = 'integration_manager'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.has_perm('future_capabilities.manage_critical_integrations'):
            return queryset.exclude(security_level='critical')
        return queryset


class MiniAppRegistryViewSet(BaseSecureViewSet):
    """
    ViewSet for managing mini-app registry.
    """
    queryset = MiniAppRegistry.objects.all()
    serializer_class = MiniAppRegistrySerializer
    permission_classes = [IsAuthenticated]
    filter_fields = ['app_name', 'status', 'security_audit_status', 'access_level']
    search_fields = ['app_name', 'app_description']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            return queryset.filter(
                Q(access_level='public') |
                Q(developer=user) |
                Q(access_level='beta', status='approved')
            )
        return queryset


class UserFeedbackLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user feedback logs.
    """
    queryset = UserFeedbackLog.objects.all()
    serializer_class = UserFeedbackLogSerializer
    filter_fields = ['user_id', 'feedback_type']
    search_fields = ['feedback_content']


class FeatureRoadmapViewSet(BaseSecureViewSet):
    """
    ViewSet for managing feature roadmap.
    """
    queryset = FeatureRoadmap.objects.all()
    serializer_class = FeatureRoadmapSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_fields = ['feature_name', 'status', 'priority_level', 'visibility']
    search_fields = ['feature_name']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.has_perm('future_capabilities.view_private_features'):
            return queryset.filter(
                Q(visibility='public') |
                Q(visibility='beta_users', created_by=user)
            )
        return queryset


class MicroserviceRegistryViewSet(BaseSecureViewSet):
    """
    ViewSet for managing microservice registry.
    """
    queryset = MicroserviceRegistry.objects.all()
    serializer_class = MicroserviceRegistrySerializer
    permission_classes = [IsAuthenticated, HasRequiredRole]
    filter_fields = ['service_name', 'status', 'security_classification']
    search_fields = ['service_name']
    required_role = 'service_manager'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.has_perm('future_capabilities.manage_critical_services'):
            return queryset.exclude(security_classification='critical')
        return queryset


class MicrofluidicInstrumentConfigViewSet(BaseSecureViewSet):
    """
    ViewSet for managing microfluidic instrument configurations.
    """
    queryset = MicrofluidicInstrumentConfig.objects.all()
    serializer_class = MicrofluidicInstrumentConfigSerializer
    permission_classes = [IsAuthenticated, HasRequiredRole]
    filter_fields = ['instrument_name', 'operational_status', 'access_level']
    search_fields = ['instrument_name']
    required_role = 'instrument_operator'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            return queryset.filter(access_level__in=user.get_access_levels())
        return queryset


class DimensionalityModelViewSet(BaseSecureViewSet):
    """
    ViewSet for managing dimensionality models.
    """
    queryset = DimensionalityModel.objects.all()
    serializer_class = DimensionalityModelSerializer
    permission_classes = [IsAuthenticated, HasRequiredRole]
    filter_fields = ['model_name', 'status', 'access_level']
    search_fields = ['model_name']
    required_role = 'data_scientist'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            return queryset.filter(
                Q(access_level='public') |
                Q(access_level='internal', created_by=user)
            ).exclude(status='development')
        return queryset


class AIAgentPartnershipViewSet(BaseSecureViewSet):
    """
    ViewSet for managing AI agent partnerships.
    """
    queryset = AIAgentPartnership.objects.all()
    serializer_class = AIAgentPartnershipSerializer
    permission_classes = [IsAuthenticated, HasRequiredRole]
    filter_fields = ['agent_name', 'associated_task', 'status', 'security_clearance']
    search_fields = ['agent_name', 'associated_task']
    required_role = 'ai_manager'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.has_perm('future_capabilities.grant_security_clearance'):
            return queryset.filter(security_clearance__in=['basic', 'enhanced'])
        return queryset


class SynestheticMappingViewSet(BaseSecureViewSet):
    """
    ViewSet for managing synesthetic mappings.
    """
    queryset = SynestheticMapping.objects.all()
    serializer_class = SynestheticMappingSerializer
    permission_classes = [IsAuthenticated]
    filter_fields = ['mapping_name', 'mapping_type', 'validation_status', 'access_scope']
    search_fields = ['mapping_name']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.has_perm('future_capabilities.validate_mappings'):
            return queryset.filter(
                Q(access_scope='global', validation_status='validated') |
                Q(access_scope='personal', created_by=user) |
                Q(access_scope='shared', validation_status__in=['validated', 'experimental'])
            )
        return queryset


class SemanticLayerViewSet(BaseSecureViewSet):
    """
    ViewSet for managing semantic layers.
    """
    queryset = SemanticLayer.objects.all()
    serializer_class = SemanticLayerSerializer
    permission_classes = [IsAuthenticated, HasRequiredRole]
    filter_fields = ['layer_name', 'layer_type', 'complexity_level', 'access_mode']
    search_fields = ['layer_name']
    required_role = 'semantic_analyst'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.has_perm('future_capabilities.edit_semantic_layers'):
            return queryset.filter(
                Q(access_mode='read_only') |
                Q(access_mode='collaborative', complexity_level__in=user.get_complexity_levels())
            )
        return queryset


class PipelineEvolutionLogViewSet(BaseSecureViewSet):
    """
    ViewSet for managing pipeline evolution logs.
    """
    queryset = PipelineEvolutionLog.objects.all()
    serializer_class = PipelineEvolutionLogSerializer
    permission_classes = [IsAuthenticated, HasRequiredRole]
    filter_fields = ['pipeline_name', 'evolution_stage', 'criticality_level']
    search_fields = ['pipeline_name']
    required_role = 'pipeline_manager'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.has_perm('future_capabilities.view_critical_pipelines'):
            return queryset.exclude(criticality_level='critical')
        return queryset


class InterstellarLatencyConfigViewSet(BaseSecureViewSet):
    """
    ViewSet for managing interstellar latency configurations.
    """
    queryset = InterstellarLatencyConfig.objects.all()
    serializer_class = InterstellarLatencyConfigSerializer
    permission_classes = [IsAuthenticated, HasRequiredRole]
    filter_fields = ['scenario_name', 'scenario_type', 'reliability_rating', 'security_protocol']
    search_fields = ['scenario_name']
    required_role = 'latency_engineer'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.has_perm('future_capabilities.access_classified_scenarios'):
            return queryset.exclude(security_protocol='classified')
        return queryset


class DAWControlStateViewSet(BaseSecureViewSet):
    """
    ViewSet for managing DAW control states with real-time sync.
    """
    queryset = DAWControlState.objects.all()
    serializer_class = DAWControlStateSerializer
    permission_classes = [IsAuthenticated]
    filter_fields = ['control_id', 'environment', 'immersive_mode']
    search_fields = ['control_id']
    user_field = 'user'

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """
        Update multiple control states at once.
        """
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_bulk_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_bulk_create(self, serializer):
        """
        Create multiple control states with user context.
        """
        serializer.save(user=self.request.user)


class VRInteractionLogViewSet(BaseSecureViewSet):
    """
    ViewSet for managing VR interaction logs with analytics support.
    """
    queryset = VRInteractionLog.objects.all()
    serializer_class = VRInteractionLogSerializer
    permission_classes = [IsAuthenticated]
    filter_fields = ['interaction_type']
    search_fields = ['details']
    user_field = 'user'

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        Get analytics data for VR interactions.
        """
        user = request.user
        data = {
            'total_interactions': self.get_queryset().count(),
            'interactions_by_type': self.get_queryset().values('interaction_type').annotate(
                count=models.Count('id')
            ),
            'recent_interactions': self.get_serializer(
                self.get_queryset().order_by('-timestamp')[:10],
                many=True
            ).data
        }
        return Response(data)


class NeuralDeviceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing neural interface devices.
    """
    serializer_class = NeuralDeviceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NeuralDevice.objects.filter(user_id=self.request.user.id)

    @action(detail=True, methods=['post'])
    def calibrate(self, request, pk=None):
        """
        Initiate device calibration process.
        """
        device = self.get_object()
        device.connection_status = 'calibrating'
        device.last_calibration = timezone.now()
        device.save()
        return Response({'status': 'calibration_started'})

    @action(detail=True, methods=['post'])
    def reset_safety_thresholds(self, request, pk=None):
        """
        Reset device safety thresholds to defaults.
        """
        device = self.get_object()
        device.safety_thresholds = {
            'min_confidence': 0.6,
            'max_duration': 3600,  # 1 hour
            'signal_timeout': 5000  # 5 seconds
        }
        device.save()
        return Response({'status': 'thresholds_reset'})


class NeuralSignalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling neural signal data with privacy considerations.
    """
    serializer_class = NeuralSignalSerializer
    permission_classes = [IsAuthenticated]

    @handle_api_error
    @action(detail=False, methods=['post'])
    def bulk_process(self, request):
        """Process multiple neural signals in bulk."""
        with transaction.atomic():
            signals = request.data.get('signals', [])
            successful_items, failed_items = handle_bulk_operation(
                signals,
                lambda signal: self.perform_create(self.get_serializer(data=signal))
            )

            return Response({
                'successful': successful_items,
                'failed': failed_items
            }, status=status.HTTP_201_CREATED if not failed_items else status.HTTP_207_MULTI_STATUS)

    def get_queryset(self):
        # Only return recent signals (last 5 minutes) to limit data exposure
        recent_time = timezone.now() - timedelta(minutes=5)
        return NeuralSignal.objects.filter(
            user_id=self.request.user.id,
            timestamp__gte=recent_time
        ).select_related('device')

    def perform_create(self, serializer):
        # Enforce signal quality and privacy checks
        device = serializer.validated_data['device']
        if device.signal_quality < device.safety_thresholds.get('min_confidence', 0.6):
            raise ValidationError("Signal quality below safety threshold")
        
        # Strip any sensitive metadata before saving
        metadata = serializer.validated_data.get('metadata', {})
        safe_metadata = {
            k: v for k, v in metadata.items()
            if k in ['signal_source', 'processing_method', 'quality_metrics']
        }
        serializer.save(
            user_id=self.request.user.id,
            metadata=safe_metadata
        )


class NeuralControlViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing neural signal to music control mappings.
    """
    serializer_class = NeuralControlSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NeuralControl.objects.filter(user_id=self.request.user.id)

    @action(detail=True, methods=['post'])
    def test_mapping(self, request, pk=None):
        """
        Test a control mapping with sample data.
        """
        control = self.get_object()
        test_value = float(request.data.get('test_value', 0.5))
        
        # Apply mapping function
        if control.mapping_function == 'linear':
            output = test_value
        elif control.mapping_function == 'exponential':
            output = test_value ** 2
        elif control.mapping_function == 'logarithmic':
            output = math.log(test_value + 1) / math.log(2)
        else:  # threshold
            output = 1.0 if test_value >= 0.5 else 0.0
            
        # Scale to output range
        out_min = control.output_range['min']
        out_max = control.output_range['max']
        scaled_output = out_min + (out_max - out_min) * output
        
        return Response({
            'input': test_value,
            'output': scaled_output,
            'mapping': control.mapping_function
        })

    @action(detail=False, methods=['post'])
    def batch_update(self, request):
        """
        Update multiple control mappings at once.
        """
        controls = request.data.get('controls', [])
        updated = []
        
        for control_data in controls:
            control_id = control_data.pop('id')
            try:
                control = NeuralControl.objects.get(
                    id=control_id,
                    user_id=self.request.user.id
                )
                serializer = self.get_serializer(
                    control,
                    data=control_data,
                    partial=True
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                updated.append(control_id)
            except NeuralControl.DoesNotExist:
                continue
                
        return Response({
            'updated_controls': updated,
            'count': len(updated)
        })


class WearableDeviceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing wearable devices with privacy controls.
    """
    serializer_class = WearableDeviceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WearableDevice.objects.filter(user_id=self.request.user.id)

    @action(detail=True, methods=['post'])
    def connect(self, request, pk=None):
        """
        Connect to a wearable device.
        """
        device = self.get_object()
        device.connection_status = 'connected'
        device.last_sync = timezone.now()
        device.save()
        return Response({'status': 'connected'})


class BiofeedbackDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling biofeedback data with privacy considerations.
    """
    serializer_class = BiofeedbackDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return recent data (last hour) to limit exposure
        recent_time = timezone.now() - timedelta(hours=1)
        return BiofeedbackData.objects.filter(
            user_id=self.request.user.id,
            timestamp__gte=recent_time
        ).select_related('device')

    def perform_create(self, serializer):
        # Ensure data privacy by strictly associating with user
        serializer.save(user_id=self.request.user.id)


class BiofeedbackEventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing music-related biofeedback events.
    """
    serializer_class = BiofeedbackEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BiofeedbackEvent.objects.filter(
            user_id=self.request.user.id
        ).select_related('trigger_data')


class PluginDeveloperViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing plugin developers.
    """
    serializer_class = PluginDeveloperSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return PluginDeveloper.objects.all()
        return PluginDeveloper.objects.filter(user_id=self.request.user.id)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Verify a plugin developer.
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        developer = self.get_object()
        developer.is_verified = True
        developer.verification_date = timezone.now()
        developer.save()
        
        return Response({'status': 'verified'})


class PluginViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing plugins.
    """
    serializer_class = PluginSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['type', 'is_certified']
    ordering_fields = ['name', 'created_at', 'updated_at']

    @cached_response(timeout=1800)  # Cache for 30 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @cached_response(timeout=1800)
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @handle_api_error
    @action(detail=False, methods=['post'])
    def bulk_install(self, request):
        """Install multiple plugins at once."""
        plugin_ids = request.data.get('plugin_ids', [])
        
        def install_plugin(plugin_id):
            plugin = self.get_object()
            return self.install(request, pk=plugin_id).data

        successful_items, failed_items = handle_bulk_operation(
            plugin_ids,
            install_plugin
        )

        return Response({
            'successful': successful_items,
            'failed': failed_items
        }, status=status.HTTP_200_OK if not failed_items else status.HTTP_207_MULTI_STATUS)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Plugin.objects.all()
        
        # Regular users can only see certified plugins
        return Plugin.objects.filter(is_certified=True)

    @action(detail=True, methods=['post'])
    def certify(self, request, pk=None):
        """
        Certify a plugin.
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        plugin = self.get_object()
        plugin.is_certified = True
        plugin.certification_date = timezone.now()
        plugin.save()
        
        return Response({'status': 'certified'})

    @action(detail=True, methods=['post'])
    def install(self, request, pk=None):
        """
        Install a plugin for the current user.
        """
        plugin = self.get_object()
        
        # Check if plugin is already installed
        if PluginInstallation.objects.filter(
            user_id=request.user.id,
            plugin=plugin
        ).exists():
            return Response(
                {'error': 'Plugin already installed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify plugin certification
        if not plugin.is_certified:
            return Response(
                {'error': 'Cannot install uncertified plugin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create installation
        installation = PluginInstallation.objects.create(
            user_id=request.user.id,
            plugin=plugin,
            granted_permissions=plugin.required_permissions
        )
        
        return Response({
            'status': 'installed',
            'installation_id': installation.id
        })


class PluginInstallationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing plugin installations.
    """
    serializer_class = PluginInstallationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PluginInstallation.objects.filter(
            user_id=self.request.user.id
        ).select_related('plugin')

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        """
        Toggle plugin enabled status.
        """
        installation = self.get_object()
        installation.is_enabled = not installation.is_enabled
        installation.save()
        
        return Response({
            'status': 'enabled' if installation.is_enabled else 'disabled'
        })

    @action(detail=True, methods=['post'])
    def update_settings(self, request, pk=None):
        """
        Update plugin settings.
        """
        installation = self.get_object()
        settings = request.data.get('settings', {})
        
        # Merge new settings with existing ones
        installation.settings.update(settings)
        installation.save()
        
        return Response({'settings': installation.settings})


class PluginRatingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing plugin ratings.
    """
    serializer_class = PluginRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PluginRating.objects.filter(
            user_id=self.request.user.id
        ).select_related('plugin')

    def create(self, request, *args, **kwargs):
        """
        Create or update a rating.
        """
        plugin_id = request.data.get('plugin')
        
        # Check if rating exists
        try:
            rating = PluginRating.objects.get(
                user_id=request.user.id,
                plugin_id=plugin_id
            )
            serializer = self.get_serializer(rating, data=request.data)
        except PluginRating.DoesNotExist:
            serializer = self.get_serializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        serializer.save(user_id=request.user.id)
        
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def execute_plugin(request):
    """
    Execute a plugin action.
    """
    installation_id = request.data.get('installation_id')
    action_type = request.data.get('action_type')
    parameters = request.data.get('parameters', {})
    
    try:
        installation = PluginInstallation.objects.select_related('plugin').get(
            id=installation_id,
            user_id=request.user.id
        )
    except PluginInstallation.DoesNotExist:
        return Response(
            {'error': 'Installation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not installation.is_enabled:
        return Response(
            {'error': 'Plugin is disabled'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create usage log
    usage_log = PluginUsageLog.objects.create(
        installation=installation,
        action_type=action_type,
        accessed_data=parameters.get('data_access', [])
    )
    
    try:
        # Execute plugin action (placeholder for actual execution)
        result = {
            'success': True,
            'output': f"Executed {action_type} on {installation.plugin.name}"
        }
        
        # Update performance metrics
        usage_log.performance_metrics = {
            'execution_time': 0.5,  # Example metric
            'memory_usage': 1024    # Example metric
        }
        usage_log.save()
        
        # Update last used timestamp
        installation.last_used = timezone.now()
        installation.save()
        
        return Response(result)
        
    except Exception as e:
        usage_log.error_log = str(e)
        usage_log.save()
        
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_neural_signal(request):
    """
    Process incoming neural signals and apply control mappings.
    """
    signal_data = request.data
    device_id = signal_data.get('device_id')
    
    try:
        device = NeuralDevice.objects.get(
            id=device_id,
            user_id=request.user.id
        )
    except NeuralDevice.DoesNotExist:
        return Response(
            {'error': 'Device not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check device status and signal quality
    if device.connection_status != 'connected':
        return Response(
            {'error': 'Device not properly connected'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if device.signal_quality < device.safety_thresholds.get('min_confidence', 0.6):
        return Response(
            {'error': 'Signal quality below threshold'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Process and store the signal
    signal_serializer = NeuralSignalSerializer(data={
        'device': device.id,
        'signal_type': signal_data.get('signal_type'),
        'processed_value': signal_data.get('value'),
        'confidence_score': signal_data.get('confidence'),
        'metadata': {
            'signal_source': signal_data.get('source'),
            'processing_method': signal_data.get('processing'),
            'quality_metrics': signal_data.get('quality')
        }
    })
    signal_serializer.is_valid(raise_exception=True)
    signal = signal_serializer.save(user_id=request.user.id)
    
    # Apply control mappings
    active_controls = NeuralControl.objects.filter(
        user_id=request.user.id,
        signal_type=signal.signal_type,
        enabled=True
    )
    
    control_updates = []
    for control in active_controls:
        try:
            # Scale and map the signal value
            input_min = control.input_range['min']
            input_max = control.input_range['max']
            normalized_value = (signal.processed_value - input_min) / (input_max - input_min)
            
            if control.mapping_function == 'exponential':
                mapped_value = normalized_value ** 2
            elif control.mapping_function == 'logarithmic':
                mapped_value = math.log(normalized_value + 1) / math.log(2)
            elif control.mapping_function == 'threshold':
                mapped_value = 1.0 if normalized_value >= 0.5 else 0.0
            else:  # linear
                mapped_value = normalized_value
            
            out_min = control.output_range['min']
            out_max = control.output_range['max']
            final_value = out_min + (out_max - out_min) * mapped_value
            
            control_updates.append({
                'control': control.name,
                'parameter': control.control_parameter,
                'value': final_value
            })
            
        except Exception as e:
            # If any mapping fails, use fallback value
            control_updates.append({
                'control': control.name,
                'parameter': control.control_parameter,
                'value': control.fallback_value,
                'fallback_used': True
            })
    
    return Response({
        'signal_id': signal.id,
        'control_updates': control_updates
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_biofeedback(request):
    """
    Process incoming biofeedback data and generate music suggestions.
    """
    data = request.data
    device_id = data.get('device_id')
    
    try:
        device = WearableDevice.objects.get(
            id=device_id,
            user_id=request.user.id
        )
    except WearableDevice.DoesNotExist:
        return Response(
            {'error': 'Device not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Store biofeedback data
    biofeedback_data = BiofeedbackData.objects.create(
        user_id=request.user.id,
        device=device,
        data_type=data.get('data_type'),
        value=data.get('value'),
        unit=data.get('unit')
    )
    
    # Generate music suggestions based on biofeedback
    suggestions = []
    events = []
    
    if data.get('data_type') == 'heart_rate':
        heart_rate = float(data.get('value', 0))
        
        # Suggest tempo changes based on heart rate
        if heart_rate > 120:
            suggestions.append({
                'type': 'tempo',
                'value': min(heart_rate, 180),  # Cap at 180 BPM
                'confidence': 0.8,
                'message': 'Increased tempo to match elevated heart rate'
            })
            
            events.append(BiofeedbackEvent(
                user_id=request.user.id,
                event_type='tempo_change',
                trigger_data=biofeedback_data,
                previous_state={'tempo': 120},
                new_state={'tempo': min(heart_rate, 180)},
                confidence_score=0.8
            ))
            
        elif heart_rate < 60:
            suggestions.append({
                'type': 'tempo',
                'value': max(heart_rate, 60),  # Minimum 60 BPM
                'confidence': 0.8,
                'message': 'Decreased tempo to match resting heart rate'
            })
            
            events.append(BiofeedbackEvent(
                user_id=request.user.id,
                event_type='tempo_change',
                trigger_data=biofeedback_data,
                previous_state={'tempo': 120},
                new_state={'tempo': max(heart_rate, 60)},
                confidence_score=0.8
            ))
    
    elif data.get('data_type') == 'step_count':
        steps_per_minute = float(data.get('value', 0))
        
        if steps_per_minute > 0:
            # Suggest rhythm changes based on walking/running pace
            suggestions.append({
                'type': 'rhythm',
                'value': steps_per_minute,
                'confidence': 0.7,
                'message': 'Adjusted rhythm to match movement pace'
            })
            
            events.append(BiofeedbackEvent(
                user_id=request.user.id,
                event_type='energy_adjustment',
                trigger_data=biofeedback_data,
                previous_state={'rhythm': 'normal'},
                new_state={'rhythm': 'dynamic'},
                confidence_score=0.7
            ))
    
    # Save all events
    BiofeedbackEvent.objects.bulk_create(events)
    
    return Response({
        'data_id': biofeedback_data.id,
        'suggestions': suggestions,
        'events_created': len(events)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_monitoring(request):
    """
    Toggle biofeedback monitoring for a user.
    """
    enabled = request.data.get('enabled', False)
    
    # Update all user's devices
    WearableDevice.objects.filter(user_id=request.user.id).update(
        connection_status='connected' if enabled else 'disconnected'
    )
    
    return Response({
        'status': 'monitoring_enabled' if enabled else 'monitoring_disabled'
    })


class FeatureSurveyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing feature surveys.
    """
    serializer_class = FeatureSurveySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['feature_category', 'is_active']
    ordering_fields = ['created_at', 'priority_level']

    def get_queryset(self):
        # Regular users can only see active surveys
        if not self.request.user.is_staff:
            return FeatureSurvey.objects.filter(
                is_active=True,
                start_date__lte=timezone.now(),
                end_date__gte=timezone.now()
            )
        return FeatureSurvey.objects.all()

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Toggle survey active status.
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        survey = self.get_object()
        survey.is_active = not survey.is_active
        survey.save()
        
        return Response({
            'status': 'activated' if survey.is_active else 'deactivated'
        })


class SurveyResponseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing survey responses.
    """
    serializer_class = SurveyResponseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return SurveyResponse.objects.all().select_related('survey')
        return SurveyResponse.objects.filter(
            user_id=self.request.user.id
        ).select_related('survey')

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get summary statistics for survey responses.
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        survey_id = request.query_params.get('survey_id')
        
        responses = SurveyResponse.objects.filter(survey_id=survey_id)
        total_responses = responses.count()
        
        if total_responses == 0:
            return Response({
                'total_responses': 0,
                'average_interest': 0,
                'average_importance': 0,
                'would_use_percentage': 0
            })
        
        avg_interest = responses.aggregate(Avg('interest_level'))['interest_level__avg']
        avg_importance = responses.aggregate(Avg('importance_level'))['importance_level__avg']
        would_use_count = responses.filter(would_use=True).count()
        
        return Response({
            'total_responses': total_responses,
            'average_interest': round(avg_interest, 2),
            'average_importance': round(avg_importance, 2),
            'would_use_percentage': round((would_use_count / total_responses) * 100, 2)
        })


class FeatureAnalyticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing feature usage analytics.
    """
    serializer_class = FeatureUsageAnalyticsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['feature_category', 'feature_name']
    ordering_fields = ['timestamp', 'success_rate']

    @cached_response(timeout=900)  # Cache for 15 minutes
    def feature_metrics(self, request):
        """Get aggregated metrics for feature usage."""
        try:
            metrics = self.get_queryset().aggregate(
                total_usage=Count('id'),
                avg_success_rate=Avg('success_rate'),
                avg_duration=Avg('duration')
            )
            return Response(metrics)
        except Exception as e:
            raise APIError("Failed to retrieve feature metrics", details={"error": str(e)})

    @handle_api_error
    @action(detail=False, methods=['post'])
    def bulk_log(self, request):
        """Log multiple feature usage events at once."""
        events = request.data.get('events', [])
        
        successful_items, failed_items = handle_bulk_operation(
            events,
            lambda event: self.perform_create(self.get_serializer(data=event))
        )

        return Response({
            'successful': successful_items,
            'failed': failed_items
        }, status=status.HTTP_201_CREATED if not failed_items else status.HTTP_207_MULTI_STATUS)

    def get_queryset(self):
        if self.request.user.is_staff:
            return FeatureUsageAnalytics.objects.all()
        return FeatureUsageAnalytics.objects.filter(user_id=self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_feature_usage(request):
    """
    Log feature usage analytics.
    """
    feature_name = request.data.get('feature_name')
    feature_category = request.data.get('feature_category')
    session_duration = request.data.get('session_duration')
    interaction_count = request.data.get('interaction_count', 0)
    success_rate = request.data.get('success_rate', 1.0)
    errors = request.data.get('errors', 0)
    metrics = request.data.get('metrics', {})
    feedback = request.data.get('feedback', '')
    
    analytics = FeatureUsageAnalytics.objects.create(
        user_id=request.user.id,
        feature_name=feature_name,
        feature_category=feature_category,
        session_duration=timedelta(seconds=float(session_duration)),
        interaction_count=interaction_count,
        success_rate=success_rate,
        errors_encountered=errors,
        performance_metrics=metrics,
        user_feedback=feedback
    )
    
    return Response({
        'status': 'logged',
        'analytics_id': analytics.id
    })


class FeatureRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user-submitted feature requests that can be voted on by other users.
    """
    serializer_class = FeatureRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['category', 'status']
    ordering_fields = ['created_at', 'priority']

    def get_queryset(self):
        # Annotate with vote count for sorting
        return FeatureRequest.objects.annotate(
            vote_count=Count('votes')
        ).order_by('-vote_count', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        """
        Vote for a feature request. Each user can vote once per feature request.
        """
        feature_request = self.get_object()
        
        # Check if user has already voted
        if FeatureRequestVote.objects.filter(feature_request=feature_request, user=request.user).exists():
            return Response(
                {"detail": "You have already voted for this feature request."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the vote
        vote = FeatureRequestVote.objects.create(
            feature_request=feature_request,
            user=request.user
        )
        
        serializer = self.get_serializer(feature_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def unvote(self, request, pk=None):
        """
        Remove a vote from a feature request.
        """
        feature_request = self.get_object()
        
        # Check if vote exists
        vote = FeatureRequestVote.objects.filter(feature_request=feature_request, user=request.user).first()
        if not vote:
            return Response(
                {"detail": "You have not voted for this feature request."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the vote
        vote.delete()
        
        serializer = self.get_serializer(feature_request)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def top_voted(self, request):
        """
        Get top voted feature requests.
        """
        queryset = self.get_queryset()[:10]  # Get top 10
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """
        Get feature requests submitted by the requesting user.
        """
        queryset = FeatureRequest.objects.filter(user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_votes(self, request):
        """
        Get feature requests voted on by the requesting user.
        """
        voted_request_ids = FeatureRequestVote.objects.filter(
            user=request.user
        ).values_list('feature_request_id', flat=True)
        
        queryset = FeatureRequest.objects.filter(id__in=voted_request_ids)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
