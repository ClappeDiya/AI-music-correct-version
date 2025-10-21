from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CacheableTrackTransitionViewSet,
    PerformanceMetricViewSet,
    DeploymentLogViewSet,
    ScalingEventViewSet
)

router = DefaultRouter()
router.register(r'cache-transitions', CacheableTrackTransitionViewSet, basename='cache-transitions')
router.register(r'metrics', PerformanceMetricViewSet, basename='metrics')
router.register(r'deployments', DeploymentLogViewSet, basename='deployments')
router.register(r'scaling-events', ScalingEventViewSet, basename='scaling-events')

urlpatterns = [
    path('', include(router.urls)),
]
