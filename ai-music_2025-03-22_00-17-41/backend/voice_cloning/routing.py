from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/voice-cloning/(?P<model_id>\w+)/$', consumers.VoiceModelConsumer.as_asgi()),
] 