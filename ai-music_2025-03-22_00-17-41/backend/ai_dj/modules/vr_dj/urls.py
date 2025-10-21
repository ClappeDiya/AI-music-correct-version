from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VRDJSessionViewSet,
    VRDJControlViewSet,
    VRDJEnvironmentViewSet,
    VRDJInteractionViewSet
)

router = DefaultRouter()
router.register(r'sessions', VRDJSessionViewSet, basename='vrdj-session')
router.register(r'controls', VRDJControlViewSet, basename='vrdj-control')
router.register(r'environments', VRDJEnvironmentViewSet, basename='vrdj-environment')
router.register(r'interactions', VRDJInteractionViewSet, basename='vrdj-interaction')

urlpatterns = [
    path('', include(router.urls)),
]
