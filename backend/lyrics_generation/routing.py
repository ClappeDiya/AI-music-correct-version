from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r"ws/lyrics/collaborate/(?P<session_id>[0-9a-f-]+)/$",
        consumers.CollaborativeLyricConsumer.as_asgi()
    ),
]