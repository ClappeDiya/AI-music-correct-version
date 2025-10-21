import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatSession, ChatMessage, UserPreference
from .llm import generate_ai_response

User = get_user_model()

class DJChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'chat_{self.session_id}'

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
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'chat_message':
            message = data.get('message')
            context = data.get('context', {})
            
            # Save user message
            user_message = await self.save_message(
                message,
                context,
                is_ai=False
            )
            
            # Broadcast user message
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'context': context,
                    'is_ai': False
                }
            )
            
            # Generate and save AI response
            ai_response = await self.generate_response(user_message)
            
            # Broadcast AI response
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': ai_response['message'],
                    'context': ai_response['context'],
                    'is_ai': True,
                    'suggestions': ai_response.get('suggestions'),
                    'music_fact': ai_response.get('music_fact')
                }
            )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, content, context, is_ai):
        session = ChatSession.objects.get(id=self.session_id)
        return ChatMessage.objects.create(
            session=session,
            content=content,
            context=context,
            is_ai=is_ai
        )

    @database_sync_to_async
    def generate_response(self, user_message):
        # Get user preferences for context
        user_prefs = UserPreference.objects.get_or_create(
            user=user_message.session.user
        )[0]
        
        # Get chat history for context
        chat_history = list(ChatMessage.objects.filter(
            session=user_message.session
        ).order_by('-created_at')[:5])
        
        # Generate AI response using LLM
        response = generate_ai_response(
            user_message=user_message,
            chat_history=chat_history,
            user_preferences=user_prefs
        )
        
        # Save AI message
        ChatMessage.objects.create(
            session=user_message.session,
            content=response['message'],
            context=response['context'],
            is_ai=True
        )
        
        return response
