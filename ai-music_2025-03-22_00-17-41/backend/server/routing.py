from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from ai_dj.modules.dj_chat import routing as dj_chat_routing
from music_education.routing import websocket_urlpatterns as music_education_ws_patterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            dj_chat_routing.websocket_urlpatterns + music_education_ws_patterns
        )
    ),
})
