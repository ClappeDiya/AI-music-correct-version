from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MetricDataViewSet,
    AlertViewSet,
    SystemHealthViewSet,
    PerformanceMetricViewSet,
    CacheableTrackTransitionViewSet,
    DeploymentLogViewSet,
    ScalingEventViewSet
)

router = DefaultRouter()
router.register(r'metrics', MetricDataViewSet, basename='metric')
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'health', SystemHealthViewSet, basename='health')
router.register(r'performance', PerformanceMetricViewSet)
router.register(r'transitions', CacheableTrackTransitionViewSet)
router.register(r'deployments', DeploymentLogViewSet)
router.register(r'scaling', ScalingEventViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
