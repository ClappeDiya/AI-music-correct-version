from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import openai
import anthropic
import aiohttp
import base64
from django.conf import settings
import logging
import json
import asyncio
from .services.suno_service import SunoAPIClient

logger = logging.getLogger(__name__)

class AIProvider(ABC):
    """
    Abstract base class for AI model providers.
    """
    @abstractmethod
    async def generate_music(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate music based on parameters."""
        pass

    @abstractmethod
    async def get_model_info(self) -> Dict[str, Any]:
        """Get information about the available models."""
        pass

class OpenAIProvider(AIProvider):
    """
    OpenAI implementation for music generation.
    """
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY
        )
        self.model = settings.OPENAI_MODEL_NAME

    async def generate_music(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Convert mood parameters to a natural language prompt
            prompt = self._create_prompt(params)
            
            # Call OpenAI's music generation model
            response = await self.client.audio.generate(
                model=self.model,
                prompt=prompt,
                duration=params.get('duration', 180),  # Default 3 minutes
                response_format=params.get('format', 'mp3'),
                temperature=params.get('temperature', 0.7)
            )

            return {
                'status': 'success',
                'audio_data': response.content,
                'format': 'mp3',
                'metadata': {
                    'model': self.model,
                    'provider': 'openai',
                    'parameters': params
                }
            }

        except Exception as e:
            logger.error(f"OpenAI generation error: {str(e)}")
            raise

    async def get_model_info(self) -> Dict[str, Any]:
        models = await self.client.models.list()
        return {
            'provider': 'openai',
            'available_models': [m.id for m in models.data if m.id.startswith('music-')]
        }

    def _create_prompt(self, params: Dict[str, Any]) -> str:
        """Convert parameters to a natural language prompt."""
        mood = params.get('mood', {})
        intensity = params.get('intensity', 0.5)
        
        prompt = f"Generate {mood.get('name', 'neutral')} music with intensity {intensity}. "
        if 'description' in mood:
            prompt += f"The mood should be {mood['description']}. "
        
        if 'parameters' in params:
            if 'tempo' in params['parameters']:
                prompt += f"Use {params['parameters']['tempo']} tempo. "
            if 'genre' in params['parameters']:
                prompt += f"Style should be {params['parameters']['genre']}. "
                
        return prompt

class AnthropicProvider(AIProvider):
    """
    Anthropic implementation for music generation.
    """
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=settings.ANTHROPIC_API_KEY
        )
        self.model = settings.ANTHROPIC_MODEL_NAME

    async def generate_music(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Convert parameters to Claude-friendly format
            prompt = self._create_prompt(params)
            
            # Call Anthropic's Claude model
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                temperature=params.get('temperature', 0.7),
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Process Claude's response
            # Note: This assumes Claude can generate music directly
            # You might need to adapt this based on Claude's actual capabilities
            return {
                'status': 'success',
                'audio_data': response.content,
                'format': 'mp3',
                'metadata': {
                    'model': self.model,
                    'provider': 'anthropic',
                    'parameters': params
                }
            }

        except Exception as e:
            logger.error(f"Anthropic generation error: {str(e)}")
            raise

    async def get_model_info(self) -> Dict[str, Any]:
        # Anthropic doesn't have a models list endpoint
        # Return hardcoded list of supported models
        return {
            'provider': 'anthropic',
            'available_models': [
                'claude-3-opus-20240229',
                'claude-3-sonnet-20240229',
                'claude-3-haiku-20240307'
            ]
        }

    def _create_prompt(self, params: Dict[str, Any]) -> str:
        """Convert parameters to a Claude-friendly prompt."""
        mood = params.get('mood', {})
        intensity = params.get('intensity', 0.5)
        
        prompt = f"""Please generate music with the following characteristics:
        - Mood: {mood.get('name', 'neutral')}
        - Intensity: {intensity}
        """
        
        if 'description' in mood:
            prompt += f"- Mood description: {mood['description']}\n"
            
        if 'parameters' in params:
            if 'tempo' in params['parameters']:
                prompt += f"- Tempo: {params['parameters']['tempo']}\n"
            if 'genre' in params['parameters']:
                prompt += f"- Genre: {params['parameters']['genre']}\n"
                
        return prompt

class MiniMaxProvider(AIProvider):
    """
    MiniMax implementation for music generation.
    """
    def __init__(self):
        self.api_key = settings.MINIMAX_API_KEY
        self.model = settings.MINIMAX_MODEL_NAME
        self.upload_url = "https://api.minimax.chat/v1/music_upload"
        self.generation_url = "https://api.minimax.chat/v1/music_generation"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def _upload_reference_audio(self, audio_path: str, purpose: str) -> Dict[str, Any]:
        """
        Upload reference audio file to MiniMax.
        """
        try:
            async with aiohttp.ClientSession() as session:
                data = {
                    "purpose": purpose,
                    "file": audio_path
                }
                async with session.post(self.upload_url, headers=self.headers, json=data) as response:
                    result = await response.json()
                    if result.get("base_resp", {}).get("status_code") != 0:
                        raise Exception(f"Upload failed: {result.get('base_resp', {}).get('status_msg')}")
                    return result
        except Exception as e:
            logger.error(f"MiniMax upload error: {str(e)}")
            raise

    async def generate_music(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate music using MiniMax's API.
        """
        try:
            # Convert mood and parameters to lyrics format
            lyrics = self._create_lyrics(params)
            
            # Get reference audio IDs if provided
            voice_id = None
            instrumental_id = None
            
            if 'reference_vocal' in params:
                vocal_result = await self._upload_reference_audio(params['reference_vocal'], 'voice')
                voice_id = vocal_result.get('voice_id')
                
            if 'reference_instrumental' in params:
                instrumental_result = await self._upload_reference_audio(params['reference_instrumental'], 'instrumental')
                instrumental_id = instrumental_result.get('instrumental_id')

            # Prepare generation request
            generation_data = {
                "model": self.model,
                "lyrics": lyrics,
                "audio_setting": {
                    "sample_rate": 44100,
                    "bitrate": 256000,
                    "format": "mp3"
                }
            }
            
            # Add reference IDs if available
            if voice_id:
                generation_data["refer_voice"] = voice_id
            if instrumental_id:
                generation_data["refer_instrumental"] = instrumental_id

            # Generate music
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.generation_url,
                    headers=self.headers,
                    json=generation_data
                ) as response:
                    result = await response.json()
                    
                    if result.get("base_resp", {}).get("status_code") != 0:
                        raise Exception(f"Generation failed: {result.get('base_resp', {}).get('status_msg')}")

                    # Decode audio data
                    audio_data = base64.b64decode(result["data"]["audio"])
                    
                    return {
                        'status': 'success',
                        'audio_data': audio_data,
                        'format': 'mp3',
                        'metadata': {
                            'model': self.model,
                            'provider': 'minimax',
                            'parameters': params,
                            'voice_id': voice_id,
                            'instrumental_id': instrumental_id
                        }
                    }

        except Exception as e:
            logger.error(f"MiniMax generation error: {str(e)}")
            raise

    async def get_model_info(self) -> Dict[str, Any]:
        """
        Get MiniMax model information.
        """
        return {
            'provider': 'minimax',
            'available_models': ['music-01']  # MiniMax currently only supports one model
        }

    def _create_lyrics(self, params: Dict[str, Any]) -> str:
        """
        Convert mood parameters to lyrics format for MiniMax.
        """
        mood = params.get('mood', {})
        intensity = params.get('intensity', 0.5)
        
        # Create mood-based lyrics
        mood_name = mood.get('name', 'neutral')
        mood_desc = mood.get('description', '')
        
        # Convert mood and intensity to poetic lyrics
        lyrics = []
        lyrics.append("##")  # Start with accompaniment marker
        
        # Add mood-based lines
        if mood_desc:
            lyrics.extend(mood_desc.split('. '))
        else:
            lyrics.append(f"In a {mood_name} moment")
            lyrics.append(f"Feelings flow with {intensity} strength")
        
        # Add parameter-based lines
        if 'parameters' in params:
            if 'tempo' in params['parameters']:
                lyrics.append(f"Moving at a {params['parameters']['tempo']} pace")
            if 'genre' in params['parameters']:
                lyrics.append(f"In {params['parameters']['genre']} style")
        
        lyrics.append("##")  # End with accompaniment marker
        
        # Join with newlines and add pauses
        return "\n\n".join(lyrics)

class MubertProvider(AIProvider):
    """
    Mubert implementation for music generation.
    """
    def __init__(self):
        self.api_key = settings.MUBERT_API_KEY
        self.api_base = settings.MUBERT_API_BASE
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def _get_auth_token(self) -> str:
        """
        Get authentication token from Mubert API.
        """
        try:
            async with aiohttp.ClientSession() as session:
                auth_url = f"{self.api_base}/auth"
                async with session.post(auth_url, headers=self.headers) as response:
                    result = await response.json()
                    if 'token' not in result:
                        raise Exception("Failed to get auth token")
                    return result['token']
        except Exception as e:
            logger.error(f"Mubert auth error: {str(e)}")
            raise

    async def _wait_for_generation(self, session: aiohttp.ClientSession, task_id: str, max_retries: int = 30) -> Dict[str, Any]:
        """
        Poll generation status until complete or timeout.
        """
        status_url = f"{self.api_base}/tasks/{task_id}"
        retries = 0
        
        while retries < max_retries:
            async with session.get(status_url, headers=self.headers) as response:
                result = await response.json()
                status = result.get('status')
                
                if status == 'completed':
                    return result
                elif status == 'failed':
                    raise Exception(f"Generation failed: {result.get('error')}")
                
                retries += 1
                await asyncio.sleep(2)  # Wait 2 seconds between checks
                
        raise Exception("Generation timed out")

    def _map_mood_to_mubert_tags(self, mood: Dict[str, Any]) -> list:
        """
        Map mood parameters to Mubert-compatible tags.
        """
        mood_name = mood.get('name', 'neutral').lower()
        
        # Basic mood to tag mapping
        mood_tags = {
            'happy': ['happy', 'upbeat', 'positive'],
            'sad': ['sad', 'melancholic', 'emotional'],
            'energetic': ['energetic', 'powerful', 'dynamic'],
            'calm': ['calm', 'peaceful', 'ambient'],
            'angry': ['aggressive', 'intense', 'powerful'],
            'neutral': ['neutral', 'balanced']
        }
        
        # Get base tags for the mood
        tags = mood_tags.get(mood_name, ['neutral'])
        
        # Add genre if specified
        if 'parameters' in mood and 'genre' in mood['parameters']:
            tags.append(mood['parameters']['genre'].lower())
            
        # Add tempo if specified
        if 'parameters' in mood and 'tempo' in mood['parameters']:
            tempo = mood['parameters']['tempo'].lower()
            if tempo in ['fast', 'slow', 'moderate']:
                tags.append(tempo)
                
        return tags

    async def generate_music(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate music using Mubert's API.
        """
        try:
            # Get authentication token
            token = await self._get_auth_token()
            self.headers["X-Auth-Token"] = token
            
            # Convert mood to Mubert tags
            mood = params.get('mood', {})
            tags = self._map_mood_to_mubert_tags(mood)
            
            # Prepare generation request
            generation_data = {
                "tags": tags,
                "duration": params.get('duration', 180),
                "format": params.get('format', 'mp3'),
                "bitrate": params.get('bitrate', 320),
                "intensity": params.get('intensity', 0.5)
            }
            
            async with aiohttp.ClientSession() as session:
                # Start generation
                generate_url = f"{self.api_base}/generate"
                async with session.post(generate_url, headers=self.headers, json=generation_data) as response:
                    result = await response.json()
                    if 'task_id' not in result:
                        raise Exception("Failed to start generation")
                    
                    task_id = result['task_id']
                    
                    # Wait for generation to complete
                    generation_result = await self._wait_for_generation(session, task_id)
                    
                    # Get the generated audio
                    audio_url = generation_result.get('audio_url')
                    if not audio_url:
                        raise Exception("No audio URL in response")
                        
                    # Download the audio
                    async with session.get(audio_url) as audio_response:
                        audio_data = await audio_response.read()
                        
                        return {
                            'status': 'success',
                            'audio_data': audio_data,
                            'format': 'mp3',
                            'metadata': {
                                'provider': 'mubert',
                                'task_id': task_id,
                                'tags': tags,
                                'parameters': params
                            }
                        }

        except Exception as e:
            logger.error(f"Mubert generation error: {str(e)}")
            raise

    async def get_model_info(self) -> Dict[str, Any]:
        """
        Get Mubert API information.
        """
        try:
            async with aiohttp.ClientSession() as session:
                info_url = f"{self.api_base}/info"
                async with session.get(info_url, headers=self.headers) as response:
                    result = await response.json()
                    return {
                        'provider': 'mubert',
                        'available_models': result.get('available_models', ['default']),
                        'supported_tags': result.get('supported_tags', []),
                        'max_duration': result.get('max_duration', 600)
                    }
        except Exception as e:
            logger.error(f"Mubert info error: {str(e)}")
            return {
                'provider': 'mubert',
                'available_models': ['default'],
                'max_duration': 600
            }

class SunoProvider(AIProvider):
    """
    Suno implementation for music generation using Suno API.
    Updated to use the dedicated SunoAPIClient for better API interaction.
    """
    def __init__(self):
        self.client = SunoAPIClient()

    async def generate_music(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate music using Suno's API.
        """
        try:
            # Convert mood parameters to a natural language prompt
            prompt = self._create_prompt(params)
            
            # Extract relevant parameters
            make_instrumental = params.get('make_instrumental', False)
            custom_mode = params.get('custom_mode', False)
            
            # Additional parameters for custom mode
            kwargs = {}
            if custom_mode and 'parameters' in params:
                if 'music_style' in params['parameters']:
                    kwargs['music_style'] = params['parameters']['music_style']
                if 'genre' in params['parameters']:
                    kwargs['genre'] = params['parameters']['genre']
                if 'vocal_style' in params['parameters']:
                    kwargs['vocal_style'] = params['parameters']['vocal_style']
            
            # Generate the music
            completion_result, audio_data = await self.client.generate_music(
                prompt=prompt,
                make_instrumental=make_instrumental,
                custom_mode=custom_mode,
                **kwargs
            )
            
            # Return the result
            return {
                'status': 'success',
                'audio_data': audio_data,
                'format': 'mp3',
                'metadata': {
                    'provider': 'suno',
                    'task_id': completion_result.get('task_id'),
                    'parameters': params,
                    'generation_info': completion_result
                }
            }

        except Exception as e:
            logger.error(f"Suno generation error: {str(e)}")
            raise

    async def get_model_info(self) -> Dict[str, Any]:
        """
        Get Suno API information.
        """
        return {
            'provider': 'suno',
            'available_models': ['v3'],  # Suno API uses their latest model
            'features': {
                'lyrics_generation': True,
                'instrumental': True,
                'vocals_only': True,
                'custom_mode': True
            }
        }

    def _create_prompt(self, params: Dict[str, Any]) -> str:
        """
        Convert parameters to a natural language prompt for Suno.
        """
        mood = params.get('mood', {})
        mood_name = mood.get('name', 'neutral')
        mood_desc = mood.get('description', '')
        intensity = params.get('intensity', 0.5)
        
        # Build a detailed prompt for better results
        prompt = f"Create {mood_name} music"
        
        if mood_desc:
            prompt += f" that feels {mood_desc}"
            
        if 'parameters' in params:
            if 'genre' in params['parameters']:
                prompt += f" in {params['parameters']['genre']} style"
            if 'tempo' in params['parameters']:
                prompt += f" with {params['parameters']['tempo']} tempo"
                
        # Add intensity as emotion strength
        intensity_desc = "subtle" if intensity < 0.3 else "moderate" if intensity < 0.7 else "strong"
        prompt += f" with {intensity_desc} emotional intensity"
        
        # Add instrumentation details if available
        if 'parameters' in params and 'instrumentation' in params['parameters']:
            prompt += f". Include {params['parameters']['instrumentation']}"
            
        return prompt

def get_ai_provider(provider_name: str = None) -> AIProvider:
    """
    Factory function to get the appropriate AI provider.
    """
    if provider_name is None:
        provider_name = settings.DEFAULT_AI_PROVIDER

    providers = {
        'openai': OpenAIProvider,
        'anthropic': AnthropicProvider,
        'minimax': MiniMaxProvider,
        'mubert': MubertProvider,
        'suno': SunoProvider
    }

    if provider_name not in providers:
        raise ValueError(f"Unsupported AI provider: {provider_name}")

    return providers[provider_name]() 