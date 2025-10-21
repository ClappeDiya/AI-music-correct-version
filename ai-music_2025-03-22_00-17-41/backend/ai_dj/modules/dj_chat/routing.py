from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/dj_chat/(?P<session_id>\w+)/$', consumers.DJChatConsumer.as_asgi()),
]
