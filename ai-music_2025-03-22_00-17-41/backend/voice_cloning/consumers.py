from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import VoiceModel, VoiceModelShare

class CollaborationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.model_id = self.scope['url_route']['kwargs']['model_id']
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'voice_model_{self.model_id}'

        # Verify access
        if await self.has_access():
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    @database_sync_to_async
    def has_access(self):
        try:
            model = VoiceModel.objects.get(id=self.model_id)
            return (
                model.user_id == self.user_id or
                model.shares.filter(user_id=self.user_id).exists()
            )
        except VoiceModel.DoesNotExist:
            return False

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        event_type = content.get('type')
        if event_type == 'user_activity':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_activity',
                    'user_id': self.user_id,
                    'activity': content.get('activity')
                }
            )

    async def broadcast_activity(self, event):
        await self.send_json({
            'type': 'activity',
            'user_id': event['user_id'],
            'activity': event['activity']
        })

class VoiceModelConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.model_id = self.scope['url_route']['kwargs']['model_id']
        self.room_group_name = f'voice_model_{self.model_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        message_type = content.get('type')
        if message_type == 'analysis_update':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'analysis_update',
                    'data': content['data']
                }
            )

    async def analysis_update(self, event):
        await self.send_json(event['data']) 