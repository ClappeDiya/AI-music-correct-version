from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserTranslationViewSet,
    SubscriptionPlanViewSet,
    FeatureFlagViewSet,
    UserSubscriptionViewSet,
    SubscriptionHistoryViewSet,
    EnvironmentSnapshotViewSet,
    UserIdentityBridgeViewSet,
    UserProfileViewSet,
    ProfileFusionViewSet,
    ProfileHistoryViewSet,
    RecommendationViewSet,
    register,
    login,
    logout,
    verify_auth,
    refresh_token
)

router = DefaultRouter()
router.register(r'translations', UserTranslationViewSet)
router.register(r'subscription-plans', SubscriptionPlanViewSet)
router.register(r'feature-flags', FeatureFlagViewSet)
router.register(r'subscriptions', UserSubscriptionViewSet)
router.register(r'subscription-history', SubscriptionHistoryViewSet)
router.register(r'environment-snapshots', EnvironmentSnapshotViewSet)
router.register(r'identity-bridges', UserIdentityBridgeViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'profile-fusions', ProfileFusionViewSet)
router.register(r'profile-history', ProfileHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('recommendations/', include([
        path('suggestions/', RecommendationViewSet.as_view({'get': 'suggestions'})),
        path('follow/', RecommendationViewSet.as_view({'post': 'follow'})),
        path('history/', RecommendationViewSet.as_view({'get': 'history'}))
    ])),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/verify/', verify_auth, name='verify_auth'),
    path('auth/token/refresh/', refresh_token, name='token_refresh'),
]
