from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from . import consumers
from .consumers_shared_training import SharedModelConsumer

websocket_urlpatterns = [
    re_path(r'ws/cocreation/(?P<session_id>\w+)/$', consumers.CoCreationConsumer.as_asgi()),
    re_path(r'ws/shared-model/(?P<group_id>\d+)/$', SharedModelConsumer.as_asgi()),
    re_path(r'ws/collaborative/(?P<session_id>\w+)/$', consumers.CollaborativeConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
