from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HumanDJPreferenceViewSet,
    TransitionPresetViewSet,
    HumanDJActionViewSet,
    AIRecommendationViewSet
)

router = DefaultRouter()
router.register(r'preferences', HumanDJPreferenceViewSet, basename='preference')
router.register(r'presets', TransitionPresetViewSet, basename='preset')
router.register(r'actions', HumanDJActionViewSet, basename='action')
router.register(r'recommendations', AIRecommendationViewSet, basename='recommendation')

urlpatterns = [
    path('', include(router.urls)),
]
