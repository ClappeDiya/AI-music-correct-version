import openai
from django.conf import settings
from typing import List, Dict, Any
from .models import ChatMessage, UserPreference, MusicFact

def generate_ai_response(
    user_message: ChatMessage,
    chat_history: List[ChatMessage],
    user_preferences: UserPreference
) -> Dict[str, Any]:
    """Generate AI response using OpenAI's GPT model."""
    
    # Prepare conversation history
    messages = []
    
    # Add system prompt
    messages.append({
        "role": "system",
        "content": (
            "You are an AI DJ assistant who is knowledgeable about music and can "
            "engage in friendly conversation about music preferences, artists, "
            "genres, and provide interesting music facts. Be conversational, "
            "engaging, and occasionally share relevant music trivia."
        )
    })
    
    # Add user preferences context
    if user_preferences:
        messages.append({
            "role": "system",
            "content": f"User preferences: Favorite genres: {user_preferences.favorite_genres}, "
                      f"Favorite artists: {user_preferences.favorite_artists}, "
                      f"Mood preferences: {user_preferences.mood_preferences}"
        })
    
    # Add chat history
    for msg in reversed(chat_history[1:]):  # Exclude current message
        role = "assistant" if msg.is_ai else "user"
        messages.append({
            "role": role,
            "content": msg.content
        })
    
    # Add current message
    messages.append({
        "role": "user",
        "content": user_message.content
    })
    
    try:
        # Get response from OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=300
        )
        
        ai_message = response.choices[0].message.content
        
        # Generate suggestions based on the conversation
        suggestion_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Generate 2-3 relevant follow-up questions or suggestions based on the conversation about music. Keep them concise and natural."
                },
                {
                    "role": "user",
                    "content": f"Previous message: {user_message.content}\nAI response: {ai_message}"
                }
            ],
            temperature=0.7,
            max_tokens=100
        )
        
        suggestions = suggestion_response.choices[0].message.content.split('\n')
        suggestions = [s.strip('- ') for s in suggestions if s.strip()]
        
        # Randomly fetch a related music fact
        music_fact = None
        if user_message.context.get('current_track') or user_message.context.get('genre'):
            fact = MusicFact.objects.filter(
                verified=True
            ).order_by('?').first()
            if fact:
                music_fact = {
                    'title': fact.title,
                    'content': fact.content,
                    'source': fact.source
                }
        
        return {
            'message': ai_message,
            'context': {
                **user_message.context,
                'analyzed_sentiment': response.choices[0].message.get('sentiment'),
                'detected_topics': response.choices[0].message.get('topics', [])
            },
            'suggestions': suggestions,
            'music_fact': music_fact
        }
        
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return {
            'message': "I apologize, but I'm having trouble processing your request right now. Could you please try again?",
            'context': user_message.context,
            'suggestions': [
                "Tell me about your favorite music",
                "What genre do you enjoy the most?",
                "Would you like a music recommendation?"
            ]
        }
