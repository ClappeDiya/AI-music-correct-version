from django.urls import re_path
from .consumers import AIAnalysisConsumer

websocket_urlpatterns = [
    re_path(r'ws/analysis(?:/(?P<analysis_id>\w+))?/$', AIAnalysisConsumer.as_asgi()),
] 