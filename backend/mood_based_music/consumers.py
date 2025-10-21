from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ValidationError
from .models import MoodRequest
import logging

logger = logging.getLogger(__name__)

class MoodGenerationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time mood music generation status updates.
    """

    async def connect(self):
        """
        Handle WebSocket connection.
        """
        try:
            # Get request ID from URL route
            self.request_id = self.scope['url_route']['kwargs']['request_id']
            
            # Verify request exists and user has access
            if not await self.can_access_request(self.request_id, self.scope["user"]):
                await self.close()
                return
                
            # Join request-specific group
            await self.channel_layer.group_add(
                f"mood_request_{self.request_id}",
                self.channel_name
            )
            
            await self.accept()
            logger.info(f"WebSocket connection established for request {self.request_id}")
            
        except Exception as e:
            logger.error(f"Error in WebSocket connection: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.
        """
        try:
            # Leave request-specific group
            await self.channel_layer.group_discard(
                f"mood_request_{self.request_id}",
                self.channel_name
            )
            logger.info(f"WebSocket connection closed for request {self.request_id}")
            
        except Exception as e:
            logger.error(f"Error in WebSocket disconnection: {str(e)}")

    async def status_update(self, event):
        """
        Handle status update messages from the channel layer.
        """
        try:
            # Send status update to WebSocket
            await self.send_json(event["message"])
            
        except Exception as e:
            logger.error(f"Error sending status update: {str(e)}")

    @database_sync_to_async
    def can_access_request(self, request_id: int, user) -> bool:
        """
        Check if user has access to the specified request.
        """
        try:
            request = MoodRequest.objects.get(id=request_id)
            return request.user == user
            
        except MoodRequest.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Error checking request access: {str(e)}")
            return False 