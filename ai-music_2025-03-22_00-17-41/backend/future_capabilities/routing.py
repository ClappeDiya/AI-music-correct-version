from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/session/(?P<session_id>\w+)/$', consumers.CollaborativeEditingConsumer.as_asgi()),
    re_path(r'ws/communication/(?P<room_name>\w+)/$', consumers.CommunicationConsumer.as_asgi()),
]
