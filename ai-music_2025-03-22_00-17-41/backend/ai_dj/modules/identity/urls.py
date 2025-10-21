from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IdentityBridgeViewSet,
    IdentityVerificationViewSet,
    LoginSessionViewSet
)

router = DefaultRouter()
router.register(r'bridges', IdentityBridgeViewSet, basename='identity-bridge')
router.register(r'verification', IdentityVerificationViewSet, basename='identity-verification')
router.register(r'sessions', LoginSessionViewSet, basename='login-session')

urlpatterns = [
    path('', include(router.urls)),
]
