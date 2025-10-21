from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import (
    ChatSession,
    ChatMessage,
    UserPreference,
    MusicFact,
    ChatPersonality
)
from .serializers import (
    ChatSessionSerializer,
    ChatMessageSerializer,
    UserPreferenceSerializer,
    MusicFactSerializer,
    ChatPersonalitySerializer,
    ChatResponseSerializer
)


class ChatSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['POST'])
    def send_message(self, request, pk=None):
        session = self.get_object()
        message_content = request.data.get('message')
        context = request.data.get('context', {})
        
        if not message_content:
            return Response(
                {"error": "Message content is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save user message
        user_message = ChatMessage.objects.create(
            session=session,
            content=message_content,
            context=context,
            is_ai=False
        )
        
        # Generate AI response
        ai_response = self.generate_ai_response(user_message)
        
        return Response(ChatResponseSerializer(ai_response).data)
    
    def generate_ai_response(self, user_message):
        # TODO: Integrate with LLM for response generation
        # This is a placeholder implementation
        return {
            "message": "I understand you're interested in music. Let's talk about it!",
            "context": user_message.context,
            "suggestions": ["Tell me about your favorite genre", "What artists inspire you?"],
            "music_fact": None
        }


class UserPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = UserPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MusicFactViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MusicFactSerializer
    permission_classes = [IsAuthenticated]
    queryset = MusicFact.objects.filter(verified=True)
    
    @action(detail=False, methods=['GET'])
    def random(self, request):
        fact = self.get_queryset().order_by('?').first()
        if fact:
            return Response(self.get_serializer(fact).data)
        return Response(
            {"error": "No music facts available"},
            status=status.HTTP_404_NOT_FOUND
        )


class ChatPersonalityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChatPersonalitySerializer
    permission_classes = [IsAuthenticated]
    queryset = ChatPersonality.objects.filter(active=True)
    
    @action(detail=True, methods=['POST'])
    def select(self, request, pk=None):
        personality = self.get_object()
        # Update user's chat personality preference
        UserPreference.objects.update_or_create(
            user=request.user,
            defaults={'chat_personality': personality}
        )
        return Response({"status": "personality selected"})
