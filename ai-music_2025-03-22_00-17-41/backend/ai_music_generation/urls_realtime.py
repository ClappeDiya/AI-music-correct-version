from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views_realtime

router = DefaultRouter()
router.register(r'sessions', views_realtime.CoCreationSessionViewSet, basename='cocreation-session')
router.register(r'participants', views_realtime.SessionParticipantViewSet, basename='session-participant')
router.register(r'edits', views_realtime.RealtimeEditViewSet, basename='realtime-edit')
router.register(r'ai-contributions', views_realtime.AIContributionViewSet, basename='ai-contribution')
router.register(r'chat', views_realtime.SessionChatViewSet, basename='session-chat')

urlpatterns = [
    path('', include(router.urls)),
]
