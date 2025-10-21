import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import CollaborativeLyricSession, CollaboratorPresence, CollaborativeEdit

class CollaborativeLyricConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope["url_route"]["kwargs"]["session_id"]
        self.room_group_name = f"lyrics_{self.session_id}"
        self.user = self.scope["user"]

        # Add to room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept the connection
        await self.accept()

        # Update presence
        await self.update_presence(is_connected=True)

        # Notify others
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "collaborator_joined",
                "user_id": str(self.user.id),
                "username": self.user.username,
            }
        )

    async def disconnect(self, close_code):
        # Update presence
        await self.update_presence(is_connected=False)

        # Notify others
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "collaborator_left",
                "user_id": str(self.user.id),
                "username": self.user.username,
            }
        )

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "cursor_update":
            await self.handle_cursor_update(data)
        elif action == "edit":
            await self.handle_edit(data)

    async def handle_cursor_update(self, data):
        # Update cursor position in presence
        await self.update_presence(
            cursor_position=data.get("position")
        )

        # Broadcast cursor update
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "cursor_position",
                "user_id": str(self.user.id),
                "username": self.user.username,
                "position": data.get("position"),
            }
        )

    async def handle_edit(self, data):
        # Save edit to database
        edit = await self.save_edit(data)

        # Broadcast edit
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "lyric_edit",
                "user_id": str(self.user.id),
                "username": self.user.username,
                "edit_id": edit.id,
                "content": data.get("content"),
                "edit_type": data.get("edit_type"),
                "position": data.get("position"),
                "length": data.get("length"),
            }
        )

    @database_sync_to_async
    def update_presence(self, is_connected=None, cursor_position=None):
        """Update collaborator presence"""
        updates = {"last_seen": timezone.now()}
        if is_connected is not None:
            updates["is_active"] = is_connected
        if cursor_position is not None:
            updates["cursor_position"] = cursor_position

        CollaboratorPresence.objects.update_or_create(
            session_id=self.session_id,
            user=self.user,
            defaults=updates
        )

    @database_sync_to_async
    def save_edit(self, data):
        """Save collaborative edit"""
        return CollaborativeEdit.objects.create(
            session_id=self.session_id,
            editor=self.user,
            content=data.get("content"),
            edit_type=data.get("edit_type"),
            position=data.get("position"),
            length=data.get("length"),
        )

    # Event handlers for broadcasting
    async def collaborator_joined(self, event):
        """Handle collaborator joined notification"""
        await self.send(text_data=json.dumps({
            "type": "collaborator_joined",
            "user_id": event["user_id"],
            "username": event["username"],
        }))

    async def collaborator_left(self, event):
        """Handle collaborator left notification"""
        await self.send(text_data=json.dumps({
            "type": "collaborator_left",
            "user_id": event["user_id"],
            "username": event["username"],
        }))

    async def cursor_position(self, event):
        """Handle cursor position update"""
        await self.send(text_data=json.dumps({
            "type": "cursor_position",
            "user_id": event["user_id"],
            "username": event["username"],
            "position": event["position"],
        }))

    async def lyric_edit(self, event):
        """Handle lyric edit notification"""
        await self.send(text_data=json.dumps({
            "type": "lyric_edit",
            "user_id": event["user_id"],
            "username": event["username"],
            "edit_id": event["edit_id"],
            "content": event["content"],
            "edit_type": event["edit_type"],
            "position": event["position"],
            "length": event["length"],
        }))