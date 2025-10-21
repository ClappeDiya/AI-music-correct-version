from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from .views import RecommendationViewSet, api_root, root_redirect
from django.views.generic import RedirectView

router = DefaultRouter()

recommendation_urls = [
    path('suggestions/', 
         RecommendationViewSet.as_view({'get': 'suggestions'}), 
         name='recommendation-suggestions'),
    path('follow/', 
         RecommendationViewSet.as_view({'post': 'follow'}), 
         name='recommendation-follow'),
    path('history/', 
         RecommendationViewSet.as_view({'get': 'history'}), 
         name='recommendation-history'),
]

urlpatterns = [
    path('', root_redirect, name='root'),
    path('admin/', admin.site.urls),
    path('api/v1/', include([
        path('', api_root, name='api-root'),
        path('', include(router.urls)),
        path('recommendations/', include(recommendation_urls)),
        path('', include('user_management.urls')),
        path('analytics/', include('data_analytics.urls')),
        path('music-education/', include('music_education.urls', namespace='music_education_dash')),
        # Keep this URL pattern for backward compatibility
        # Prevents future URL inconsistencies
        path('music_education/', include('music_education.urls', namespace='music_education_legacy')),
        # AI DJ modules
        path('monitoring/', include('ai_dj.modules.monitoring.urls')),
        path('identity/', include('ai_dj.modules.identity.urls')),
        path('user-preferences/', include('ai_dj.modules.user_preferences.urls')),
        path('voice-chat/', include('ai_dj.modules.voice_chat.urls')),
        path('dj-chat/', include('ai_dj.modules.dj_chat.urls')),
        path('vr-dj/', include('ai_dj.modules.vr_dj.urls')),
        path('biometrics/', include('ai_dj.modules.biometrics.urls')),
        path('data-privacy/', include('ai_dj.modules.data_privacy.urls')),
        path('emotional-journey/', include('ai_dj.modules.emotional_journey.urls')),
        path('hybrid-dj/', include('ai_dj.modules.hybrid_dj.urls')),
    ])),
    
    # Include voice_cloning URLs at the standard path
    path('api/voice_cloning/', include('voice_cloning.urls')),
    
    # Include AI DJ URLs at the standard path
    path('api/ai_dj/', include('ai_dj.urls')),
    
    # Include Virtual Studio URLs at the standard path
    path('api/virtual_studio/', include('virtual_studio.urls', namespace='virtual_studio_api')),
    
    # Include AI Music Generation URLs at the standard path
    path('api/ai-music-requests/', include('ai_music_generation.urls')),
    
    # Include Mood Based Music URLs at the standard path
    path('api/', include('mood_based_music.urls')),
    
    # Add a legacy/alternative path for virtual studio endpoints
    path('api/v1/virtual_studio/', include('virtual_studio.urls', namespace='virtual_studio_legacy')),
    
    # Redirect /api/voice/ to /api/voice_cloning/
    path('api/voice/<path:path>', 
         RedirectView.as_view(url='/api/voice_cloning/%(path)s', permanent=False), 
         name='voice-redirect'),
    # Handle root /api/voice/ requests
    path('api/voice/', 
         RedirectView.as_view(url='/api/voice_cloning/', permanent=False), 
         name='voice-root-redirect'),
]
