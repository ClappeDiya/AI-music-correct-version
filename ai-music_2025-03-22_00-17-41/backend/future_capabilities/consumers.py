import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from .models import (
    VRSession, 
    NeuralSignal, 
    Plugin, 
    BiofeedbackData,
    CollaborationSession, 
    CollaborationActivityLog
)
from .serializers import (
    VRSessionSerializer,
    NeuralSignalSerializer,
    PluginSerializer,
    BiofeedbackDataSerializer
)

class BaseAsyncConsumer(AsyncWebsocketConsumer):
    """Base consumer with common functionality."""
    
    async def send_error(self, message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    @database_sync_to_async
    def get_user_permissions(self, user):
        return list(user.get_all_permissions())


class VRSessionConsumer(BaseAsyncConsumer):
    """Consumer for VR session real-time updates."""

    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'vr_session_{self.session_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            
            if action == 'update_position':
                await self.update_position(data)
            elif action == 'interact_object':
                await self.handle_interaction(data)
            elif action == 'sync_state':
                await self.sync_session_state(data)
            else:
                await self.send_error('Invalid action')
                
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON format')
        except Exception as e:
            await self.send_error(str(e))

    @database_sync_to_async
    def update_session_state(self, session_id, state_data):
        try:
            session = VRSession.objects.get(id=session_id)
            serializer = VRSessionSerializer(session, data=state_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return serializer.data
            return None
        except ObjectDoesNotExist:
            return None

    async def update_position(self, data):
        state_data = await self.update_session_state(self.session_id, {
            'position': data.get('position'),
            'rotation': data.get('rotation')
        })
        if state_data:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_state',
                    'state': state_data
                }
            )

    async def broadcast_state(self, event):
        await self.send(text_data=json.dumps(event['state']))


class NeuralSignalConsumer(BaseAsyncConsumer):
    """Consumer for real-time neural signal processing."""

    async def connect(self):
        self.device_id = self.scope['url_route']['kwargs']['device_id']
        self.room_name = f'neural_device_{self.device_id}'
        
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            signal_type = data.get('signal_type')
            signal_data = data.get('signal_data')
            
            processed_data = await self.process_neural_signal(signal_type, signal_data)
            await self.send(text_data=json.dumps(processed_data))
            
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON format')
        except Exception as e:
            await self.send_error(str(e))

    @database_sync_to_async
    def process_neural_signal(self, signal_type, signal_data):
        signal = NeuralSignal.objects.create(
            device_id=self.device_id,
            signal_type=signal_type,
            signal_data=signal_data
        )
        return NeuralSignalSerializer(signal).data


class PluginStateConsumer(BaseAsyncConsumer):
    """Consumer for plugin state synchronization."""

    async def connect(self):
        self.plugin_id = self.scope['url_route']['kwargs']['plugin_id']
        self.room_name = f'plugin_{self.plugin_id}'
        
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            
            if action == 'update_state':
                await self.update_plugin_state(data)
            elif action == 'sync_request':
                await self.sync_plugin_state()
            else:
                await self.send_error('Invalid action')
                
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON format')
        except Exception as e:
            await self.send_error(str(e))

    @database_sync_to_async
    def update_plugin_state(self, data):
        try:
            plugin = Plugin.objects.get(id=self.plugin_id)
            serializer = PluginSerializer(plugin, data=data.get('state'), partial=True)
            if serializer.is_valid():
                serializer.save()
                return serializer.data
            return None
        except ObjectDoesNotExist:
            return None

    async def broadcast_state(self, event):
        await self.send(text_data=json.dumps(event['state']))


class BiofeedbackConsumer(BaseAsyncConsumer):
    """Consumer for real-time biofeedback data processing."""

    async def connect(self):
        self.device_id = self.scope['url_route']['kwargs']['device_id']
        self.room_name = f'biofeedback_device_{self.device_id}'
        
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            data_type = data.get('data_type')
            biofeedback_data = data.get('data')
            
            processed_data = await self.process_biofeedback(data_type, biofeedback_data)
            await self.send(text_data=json.dumps(processed_data))
            
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON format')
        except Exception as e:
            await self.send_error(str(e))

    @database_sync_to_async
    def process_biofeedback(self, data_type, biofeedback_data):
        data = BiofeedbackData.objects.create(
            device_id=self.device_id,
            data_type=data_type,
            data_points=biofeedback_data
        )
        return BiofeedbackDataSerializer(data).data


class CollaborativeEditingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'session_{self.session_id}'
        self.user = self.scope['user']

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept the connection
        await self.accept()

        # Notify others about new user
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_join',
                'user_id': str(self.user.id),
                'username': self.user.username,
            }
        )

        # Send current session state
        session_state = await self.get_session_state()
        await self.send(text_data=json.dumps({
            'type': 'session_state',
            'state': session_state
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Notify others about user leaving
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_leave',
                'user_id': str(self.user.id),
                'username': self.user.username,
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action_type = data.get('type')

        if action_type == 'cursor_move':
            # Handle cursor movement
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'cursor_update',
                    'user_id': str(self.user.id),
                    'username': self.user.username,
                    'position': data.get('position'),
                    'element_id': data.get('element_id')
                }
            )
        elif action_type == 'edit':
            # Handle edits with version control
            edit_data = data.get('edit_data')
            version = await self.save_edit(edit_data)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'edit_made',
                    'user_id': str(self.user.id),
                    'username': self.user.username,
                    'edit_data': edit_data,
                    'version': version
                }
            )

    async def cursor_update(self, event):
        # Send cursor update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'cursor_update',
            'user_id': event['user_id'],
            'username': event['username'],
            'position': event['position'],
            'element_id': event['element_id']
        }))

    async def edit_made(self, event):
        # Send edit update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'edit_made',
            'user_id': event['user_id'],
            'username': event['username'],
            'edit_data': event['edit_data'],
            'version': event['version']
        }))

    async def user_join(self, event):
        # Send user join notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_join',
            'user_id': event['user_id'],
            'username': event['username']
        }))

    async def user_leave(self, event):
        # Send user leave notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_leave',
            'user_id': event['user_id'],
            'username': event['username']
        }))

    @database_sync_to_async
    def get_session_state(self):
        try:
            session = CollaborationSession.objects.get(id=self.session_id)
            return {
                'id': str(session.id),
                'name': session.session_name,
                'participants': list(session.participant_user_ids),
                'track_data': session.track_ref,
                'version': session.version
            }
        except ObjectDoesNotExist:
            return None

    @database_sync_to_async
    def save_edit(self, edit_data):
        session = CollaborationSession.objects.get(id=self.session_id)
        
        # Create activity log
        CollaborationActivityLog.objects.create(
            session=session,
            user_id=self.user.id,
            action_type='edit',
            action_detail=edit_data
        )

        # Update session version
        session.version += 1
        session.save()

        return session.version


class CommunicationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'comm_{self.room_name}'
        self.user_id = self.scope.get('user').id if self.scope.get('user') else None

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send user joined message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_join',
                'user_id': self.user_id,
                'username': self.scope.get('user').username if self.scope.get('user') else f"User {self.user_id}"
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Send user left message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_leave',
                'user_id': self.user_id
            }
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')

            if message_type == 'chat_message':
                await self.handle_chat_message(text_data_json)
            elif message_type == 'pinned_note':
                await self.handle_pinned_note(text_data_json)
            elif message_type in ['todo_add', 'todo_update']:
                await self.handle_todo(text_data_json)
            elif message_type == 'call_signal':
                await self.handle_call_signal(text_data_json)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def handle_chat_message(self, data):
        message = await self.save_chat_message(data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def handle_pinned_note(self, data):
        note = await self.save_pinned_note(data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'pinned_note',
                'note': note
            }
        )

    async def handle_todo(self, data):
        todo = await self.save_todo(data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'todo_update',
                'todo': todo
            }
        )

    async def handle_call_signal(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'call_signal',
                'signal': data.get('signal'),
                'from_user': self.user_id
            }
        )

    @database_sync_to_async
    def save_chat_message(self, data):
        channel = CommunicationChannel.objects.get(id=self.room_name)
        message = ChatMessage.objects.create(
            channel=channel,
            user_id=self.user_id,
            message_type='chat',
            content=data.get('content')
        )
        return ChatMessageSerializer(message).data

    @database_sync_to_async
    def save_pinned_note(self, data):
        channel = CommunicationChannel.objects.get(id=self.room_name)
        note = ChatMessage.objects.create(
            channel=channel,
            user_id=self.user_id,
            message_type='pinned_note',
            content=data.get('content'),
            metadata=data.get('metadata')
        )
        return ChatMessageSerializer(note).data

    @database_sync_to_async
    def save_todo(self, data):
        channel = CommunicationChannel.objects.get(id=self.room_name)
        if data['type'] == 'todo_add':
            todo = ChatMessage.objects.create(
                channel=channel,
                user_id=self.user_id,
                message_type='todo',
                content=data.get('content'),
                metadata={'completed': False}
            )
        else:  # todo_update
            todo = ChatMessage.objects.get(id=data.get('id'))
            todo.metadata['completed'] = data.get('completed')
            todo.save()
        return ChatMessageSerializer(todo).data

    # Message handlers
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def pinned_note(self, event):
        await self.send(text_data=json.dumps({
            'type': 'pinned_note',
            'note': event['note']
        }))

    async def todo_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'todo_update',
            'todo': event['todo']
        }))

    async def call_signal(self, event):
        if event['from_user'] != self.user_id:  # Don't send back to sender
            await self.send(text_data=json.dumps({
                'type': 'call_signal',
                'signal': event['signal'],
                'from_user': event['from_user']
            }))

    async def user_join(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_join',
            'user_id': event['user_id'],
            'username': event['username']
        }))

    async def user_leave(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_leave',
            'user_id': event['user_id']
        }))
