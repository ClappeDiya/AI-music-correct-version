from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeatureFlagViewSet

router = DefaultRouter()
router.register(r'feature-flags', FeatureFlagViewSet)

urlpatterns = [
    path('', include(router.urls)),
]