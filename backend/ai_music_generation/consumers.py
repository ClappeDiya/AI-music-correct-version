import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from .models_realtime import (
    CoCreationSession,
    SessionParticipant,
    RealtimeEdit,
    AIContribution,
    SessionChat
)
from .models import (
    CollaborativeSession,
    CreativeRole,
    TimelineState
)
from .services.ai_transition import AITransitionService


class CoCreationConsumer(AsyncWebsocketConsumer):
    # ... existing CoCreationConsumer implementation ...
    {{ ... }}


class CollaborativeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection."""
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.user = self.scope['user']
        self.room_group_name = f'session_{self.session_id}'

        # Validate session and role
        try:
            session = await self.get_session()
            role = await self.get_creative_role()
            
            if not session.is_active:
                await self.close()
                return
                
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

            # Send current timeline state
            await self.send_timeline_state()
            
            # Notify others about new participant
            await self.notify_participant_joined()

        except ObjectDoesNotExist:
            await self.close()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        try:
            await self.notify_participant_left()
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            print(f"Error in disconnect: {e}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            handlers = {
                'mood_update': self.handle_mood_update,
                'genre_update': self.handle_genre_update,
                'chord_update': self.handle_chord_update,
                'transition_request': self.handle_transition_request
            }
            
            handler = handlers.get(message_type)
            if handler:
                await handler(data)
            else:
                print(f"Unknown message type: {message_type}")

        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error processing message: {e}")

    async def timeline_update(self, event):
        """Handle timeline state updates."""
        message = event['message']
        await self.send(text_data=json.dumps(message))

    async def participant_update(self, event):
        """Handle participant updates."""
        message = event['message']
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def get_session(self):
        """Get the collaborative session."""
        return CollaborativeSession.objects.get(
            id=self.session_id,
            participants=self.user
        )

    @database_sync_to_async
    def get_creative_role(self):
        """Get the user's creative role in the session."""
        return CreativeRole.objects.get(
            session_id=self.session_id,
            user=self.user,
            is_active=True
        )

    @database_sync_to_async
    def get_timeline_state(self):
        """Get the current timeline state."""
        return TimelineState.objects.get(session_id=self.session_id)

    async def send_timeline_state(self):
        """Send current timeline state to the client."""
        timeline = await self.get_timeline_state()
        await self.send(text_data=json.dumps({
            'type': 'timeline_state',
            'data': {
                'mood_intensities': timeline.mood_intensities,
                'active_genres': timeline.active_genres,
                'current_progression': timeline.current_progression,
                'timestamp': timeline.timestamp
            }
        }))

    async def notify_participant_joined(self):
        """Notify other participants about new user."""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'participant_update',
                'message': {
                    'action': 'join',
                    'user_id': self.user.id,
                    'username': self.user.username
                }
            }
        )

    async def notify_participant_left(self):
        """Notify other participants about user leaving."""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'participant_update',
                'message': {
                    'action': 'leave',
                    'user_id': self.user.id,
                    'username': self.user.username
                }
            }
        )

    async def handle_mood_update(self, data):
        """Handle mood intensity updates."""
        role = await self.get_creative_role()
        if role.role_type != 'mood_designer':
            return
            
        timeline = await self.get_timeline_state()
        mood_data = data.get('data', {})
        
        # Update timeline state
        await database_sync_to_async(timeline.update_mood)(
            mood_data['mood_type'],
            mood_data['intensity'],
            mood_data['timestamp']
        )
        
        # Broadcast update
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'timeline_update',
                'message': {
                    'type': 'mood_update',
                    'data': mood_data
                }
            }
        )

    async def handle_genre_update(self, data):
        """Handle genre weight updates."""
        role = await self.get_creative_role()
        if role.role_type != 'genre_mixer':
            return
            
        timeline = await self.get_timeline_state()
        genre_data = data.get('data', {})
        
        # Update timeline state
        await database_sync_to_async(timeline.update_genres)(
            genre_data['weights']
        )
        
        # Broadcast update
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'timeline_update',
                'message': {
                    'type': 'genre_update',
                    'data': genre_data
                }
            }
        )

    async def handle_chord_update(self, data):
        """Handle chord progression updates."""
        role = await self.get_creative_role()
        if role.role_type != 'chord_progressionist':
            return
            
        timeline = await self.get_timeline_state()
        chord_data = data.get('data', {})
        
        # Update timeline state
        await database_sync_to_async(timeline.update_progression)(
            chord_data['chords']
        )
        
        # Broadcast update
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'timeline_update',
                'message': {
                    'type': 'chord_update',
                    'data': chord_data
                }
            }
        )

    async def handle_transition_request(self, data):
        """Handle transition analysis requests."""
        role = await self.get_creative_role()
        if role.role_type != 'transition_designer':
            return
            
        timeline = await self.get_timeline_state()
        transition_data = data.get('data', {})
        
        # Analyze transition
        transition_service = AITransitionService()
        analysis = await database_sync_to_async(
            transition_service.analyze_transition_point
        )(
            transition=transition_data,
            mood_timeline=timeline.mood_intensities,
            genre_blend=timeline.active_genres,
            chord_progression=timeline.current_progression
        )
        
        # Send analysis results
        await self.send(text_data=json.dumps({
            'type': 'transition_analysis',
            'data': analysis
        }))
