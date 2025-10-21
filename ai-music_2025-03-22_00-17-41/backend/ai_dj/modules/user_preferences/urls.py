from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PreferenceExternalizationViewSet,
    EventBasedPreferenceViewSet,
    BehaviorOverlayViewSet,
    UserCurrencyViewSet
)

router = DefaultRouter()
router.register(
    r'externalization',
    PreferenceExternalizationViewSet,
    basename='preference-externalization'
)
router.register(
    r'event-preferences',
    EventBasedPreferenceViewSet,
    basename='event-preferences'
)
router.register(
    r'behavior-overlays',
    BehaviorOverlayViewSet,
    basename='behavior-overlays'
)
router.register(
    r'currency',
    UserCurrencyViewSet,
    basename='currency'
)

urlpatterns = [
    path('', include(router.urls)),
]
