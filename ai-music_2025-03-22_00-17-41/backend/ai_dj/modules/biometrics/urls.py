from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'devices', views.WearableDeviceViewSet)
router.register(r'data', views.BiometricDataViewSet)
router.register(r'preferences', views.BiometricPreferenceViewSet)
router.register(r'group-state', views.GroupEmotionalStateViewSet)
router.register(r'emotional-preferences', views.EmotionalPreferenceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
