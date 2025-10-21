import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from .models_shared_training import SharedModelGroup, SharedModelMember


class SharedModelConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time shared model updates."""

    async def connect(self):
        """Handle WebSocket connection."""
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.group_name = f'shared_model_{self.group_id}'
        self.user = self.scope['user']

        # Verify user has access to the group
        try:
            has_access = await self.check_group_access()
            if not has_access:
                await self.close()
                return
        except ObjectDoesNotExist:
            await self.close()
            return

        # Add to group channel
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'training_metrics':
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'training_metrics',
                        'metrics': data.get('metrics', {})
                    }
                )
            elif message_type == 'member_update':
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'member_update',
                        'member': data.get('member', {})
                    }
                )
            elif message_type == 'contribution_update':
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'contribution_update',
                        'contribution': data.get('contribution', {})
                    }
                )

        except json.JSONDecodeError:
            pass

    async def training_metrics(self, event):
        """Send training metrics update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'training_metrics',
            'metrics': event['metrics']
        }))

    async def member_update(self, event):
        """Send member update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'member_update',
            'member': event['member']
        }))

    async def contribution_update(self, event):
        """Send contribution update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'contribution_update',
            'contribution': event['contribution']
        }))

    @database_sync_to_async
    def check_group_access(self):
        """Check if user has access to the group."""
        group = SharedModelGroup.objects.get(id=self.group_id)
        return (
            group.created_by == self.user or
            SharedModelMember.objects.filter(
                group=group,
                user=self.user
            ).exists()
        )
