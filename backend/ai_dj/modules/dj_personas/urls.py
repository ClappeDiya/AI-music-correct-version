from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DJPersonaViewSet, PersonaBlendViewSet, PersonaPresetViewSet

router = DefaultRouter()
router.register(r'personas', DJPersonaViewSet)
router.register(r'blends', PersonaBlendViewSet)
router.register(r'presets', PersonaPresetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
