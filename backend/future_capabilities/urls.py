# urls.py for future_capabilities
# This file defines the URL patterns for the future_capabilities app, including API endpoints for managing various future-oriented features.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VREnvironmentConfigViewSet,
    CollaborationSessionViewSet,
    CollaborationActivityLogViewSet,
    AIPluginRegistryViewSet,
    UserStyleProfileViewSet,
    DeviceIntegrationConfigViewSet,
    BiofeedbackDataLogViewSet,
    ThirdPartyIntegrationViewSet,
    MiniAppRegistryViewSet,
    UserFeedbackLogViewSet,
    FeatureRoadmapViewSet,
    MicroserviceRegistryViewSet,
    MicrofluidicInstrumentConfigViewSet,
    DimensionalityModelViewSet,
    AIAgentPartnershipViewSet,
    SynestheticMappingViewSet,
    SemanticLayerViewSet,
    PipelineEvolutionLogViewSet,
    InterstellarLatencyConfigViewSet,
    DAWControlStateViewSet,
    VRInteractionLogViewSet,
    NeuralDeviceViewSet,
    NeuralSignalViewSet,
    NeuralControlViewSet,
    WearableDeviceViewSet,
    BiofeedbackDataViewSet,
    BiofeedbackEventViewSet,
    PluginDeveloperViewSet,
    PluginViewSet,
    PluginInstallationViewSet,
    PluginRatingViewSet,
    FeatureSurveyViewSet,
    SurveyResponseViewSet,
    FeatureAnalyticsViewSet,
    FeatureRequestViewSet,
)

# Create a router and register our viewsets with it
router = DefaultRouter()

# Register viewsets with appropriate base names
router.register(r'vr-environments', VREnvironmentConfigViewSet)
router.register(r'collaboration-sessions', CollaborationSessionViewSet)
router.register(r'collaboration-logs', CollaborationActivityLogViewSet)
router.register(r'ai-plugins', AIPluginRegistryViewSet)
router.register(r'user-styles', UserStyleProfileViewSet)
router.register(r'device-integrations', DeviceIntegrationConfigViewSet)
router.register(r'biofeedback-logs', BiofeedbackDataLogViewSet)
router.register(r'third-party-integrations', ThirdPartyIntegrationViewSet)
router.register(r'mini-apps', MiniAppRegistryViewSet)
router.register(r'user-feedback', UserFeedbackLogViewSet)
router.register(r'feature-roadmap', FeatureRoadmapViewSet)
router.register(r'microservices', MicroserviceRegistryViewSet)
router.register(r'microfluidic-instruments', MicrofluidicInstrumentConfigViewSet)
router.register(r'dimensionality-models', DimensionalityModelViewSet)
router.register(r'ai-partnerships', AIAgentPartnershipViewSet)
router.register(r'synesthetic-mappings', SynestheticMappingViewSet)
router.register(r'semantic-layers', SemanticLayerViewSet)
router.register(r'pipeline-evolution', PipelineEvolutionLogViewSet)
router.register(r'interstellar-latency', InterstellarLatencyConfigViewSet)
router.register(r'daw-controls', DAWControlStateViewSet)
router.register(r'vr-interactions', VRInteractionLogViewSet)
router.register(r'neural-devices', NeuralDeviceViewSet, basename='neural-device')
router.register(r'neural-signals', NeuralSignalViewSet, basename='neural-signal')
router.register(r'neural-controls', NeuralControlViewSet, basename='neural-control')
router.register(r'wearable-devices', WearableDeviceViewSet, basename='wearable-device')
router.register(r'biofeedback-data', BiofeedbackDataViewSet, basename='biofeedback-data')
router.register(r'biofeedback-events', BiofeedbackEventViewSet, basename='biofeedback-event')
router.register(r'plugin-developers', PluginDeveloperViewSet, basename='plugin-developer')
router.register(r'plugins', PluginViewSet, basename='plugin')
router.register(r'plugin-installations', PluginInstallationViewSet, basename='plugin-installation')
router.register(r'plugin-ratings', PluginRatingViewSet, basename='plugin-rating')
router.register(r'feature-surveys', FeatureSurveyViewSet, basename='feature-survey')
router.register(r'survey-responses', SurveyResponseViewSet, basename='survey-response')
router.register(r'feature-analytics', FeatureAnalyticsViewSet, basename='feature-analytics')
router.register(r'feature-requests', FeatureRequestViewSet, basename='feature-request')

urlpatterns = [
    path('', include(router.urls)),
    path('process-neural-signal/', process_neural_signal, name='process-neural-signal'),
    path('process-biofeedback/', process_biofeedback, name='process-biofeedback'),
    path('toggle-monitoring/', toggle_monitoring, name='toggle-monitoring'),
    path('execute-plugin/', execute_plugin, name='execute-plugin'),
    path('log-feature-usage/', log_feature_usage, name='log-feature-usage'),
]

# Set the app namespace
app_name = 'future_capabilities'
