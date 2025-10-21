from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'channels', views.VoiceChannelViewSet)
router.register(r'participants', views.VoiceParticipantViewSet)
router.register(r'dj-comments', views.DJCommentViewSet)
router.register(r'messages', views.ChatMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
