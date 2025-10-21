"""
Suno API service module.
Implements comprehensive interactions with the Suno API for music generation.
"""
import os
import json
import logging
import asyncio
import aiohttp
from typing import Dict, Any, List, Optional, Tuple
from django.conf import settings

logger = logging.getLogger(__name__)

class SunoAPIClient:
    """
    Client for interacting with the Suno API.
    Follows the documentation at https://docs.sunoapi.org/
    """
    
    def __init__(self):
        self.api_key = os.getenv('SUNO_API_KEY', settings.SUNO_API_KEY)
        self.api_base = os.getenv('SUNO_API_BASE', settings.SUNO_API_BASE)
        
    async def create_generation(self, 
                                prompt: str, 
                                make_instrumental: bool = False, 
                                vocals_only: bool = False,
                                custom_mode: bool = False,
                                music_style: Optional[str] = None,
                                genre: Optional[str] = None,
                                vocal_style: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a music generation task using Suno API.
        
        Args:
            prompt: The text description prompt for the music
            make_instrumental: Whether to generate instrumental-only track
            vocals_only: Whether to generate vocals-only track
            custom_mode: Whether to use custom mode with more parameters
            music_style: Musical style for custom mode
            genre: Musical genre for custom mode
            vocal_style: Vocal style for custom mode
            
        Returns:
            Dictionary containing the task ID and other information
        """
        create_url = f"{self.api_base}/api/v3/generations"
        
        # Build the generation request payload
        generation_data = {
            "prompt": prompt,
        }
        
        # Add optional parameters
        if make_instrumental:
            generation_data["make_instrumental"] = True
            
        if vocals_only:
            generation_data["vocals_only"] = True
            
        # Add custom mode parameters if applicable
        if custom_mode:
            if music_style:
                generation_data["music_style"] = music_style
            if genre:
                generation_data["genre"] = genre
            if vocal_style:
                generation_data["vocal_style"] = vocal_style
        
        try:
            async with aiohttp.ClientSession() as session:
                # Update headers to use Bearer authentication
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                }
                
                async with session.post(
                    create_url, 
                    headers=headers, 
                    json=generation_data
                ) as response:
                    if response.status != 200 and response.status != 201:
                        error_text = await response.text()
                        error_msg = f"Failed to create generation task: HTTP {response.status} - {error_text}"
                        logger.error(error_msg)
                        raise Exception(error_msg)
                    
                    result = await response.json()
                    
                    # Extract task ID from response
                    task_id = result.get('id')
                    if not task_id:
                        raise Exception("No task ID returned from API")
                    
                    return {
                        "task_id": task_id,
                        "status": "pending",
                        "created_at": result.get('created_at')
                    }
                    
        except Exception as e:
            logger.error(f"Suno API create_generation error: {str(e)}")
            raise
    
    async def get_generation_status(self, task_id: str) -> Dict[str, Any]:
        """
        Check the status of a generation task.
        
        Args:
            task_id: The task ID from the creation response
            
        Returns:
            Dictionary with the current status information
        """
        status_url = f"{self.api_base}/api/v3/generations/{task_id}"
        
        try:
            async with aiohttp.ClientSession() as session:
                # Update headers to use Bearer authentication
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                }
                
                async with session.get(status_url, headers=headers) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        error_msg = f"Failed to check generation status: HTTP {response.status} - {error_text}"
                        logger.error(error_msg)
                        raise Exception(error_msg)
                    
                    result = await response.json()
                    
                    # Map API response to our internal format
                    status = result.get('status', '')
                    if status == 'complete':
                        status = 'completed'
                    elif status == 'in_progress':
                        status = 'processing'
                    
                    return {
                        "task_id": task_id,
                        "status": status,
                        "audio_url": result.get('audio_url') or result.get('url') or result.get('audio'),
                        "error_message": result.get('error'),
                        "progress": result.get('progress'),
                        "created_at": result.get('created_at'),
                        "completed_at": result.get('completed_at')
                    }
                    
        except Exception as e:
            logger.error(f"Suno API get_generation_status error: {str(e)}")
            raise
    
    async def wait_for_completion(self, 
                                 task_id: str, 
                                 timeout_seconds: int = 300, 
                                 check_interval: int = 5) -> Dict[str, Any]:
        """
        Wait for the generation task to complete with timeout.
        
        Args:
            task_id: The task ID to check
            timeout_seconds: Maximum time to wait in seconds
            check_interval: Time between status checks in seconds
            
        Returns:
            Final generation result with audio URL
        """
        max_checks = timeout_seconds // check_interval
        checks = 0
        
        while checks < max_checks:
            result = await self.get_generation_status(task_id)
            
            status = result.get('status')
            if status == 'completed':
                return result
            elif status == 'failed':
                raise Exception(f"Generation task failed: {result.get('error_message', 'Unknown error')}")
            
            # Wait before checking again
            await asyncio.sleep(check_interval)
            checks += 1
            
        raise Exception(f"Generation timed out after {timeout_seconds} seconds")
    
    async def download_audio(self, audio_url: str) -> bytes:
        """
        Download the generated audio file.
        
        Args:
            audio_url: URL of the generated audio
            
        Returns:
            Audio data as bytes
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(audio_url) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to download audio: HTTP {response.status}")
                    
                    return await response.read()
                    
        except Exception as e:
            logger.error(f"Suno API download_audio error: {str(e)}")
            raise
    
    async def generate_music(self, 
                            prompt: str, 
                            wait_for_completion: bool = True,
                            make_instrumental: bool = False,
                            custom_mode: bool = False,
                            **kwargs) -> Tuple[Dict[str, Any], Optional[bytes]]:
        """
        Generate music using the Suno API with one-shot operation.
        
        Args:
            prompt: Text description of the music to generate
            wait_for_completion: Whether to wait for generation to complete
            make_instrumental: Whether to generate instrumental-only track
            custom_mode: Whether to use custom mode
            **kwargs: Additional parameters for custom mode
            
        Returns:
            Tuple of (generation_info, audio_data)
            If wait_for_completion is False, audio_data will be None
        """
        # Create the generation task
        task_result = await self.create_generation(
            prompt=prompt,
            make_instrumental=make_instrumental,
            custom_mode=custom_mode,
            **kwargs
        )
        
        task_id = task_result['task_id']
        
        if not wait_for_completion:
            return task_result, None
        
        # Wait for the task to complete
        completion_result = await self.wait_for_completion(task_id)
        
        # Download the audio
        audio_url = completion_result.get('audio_url')
        if not audio_url:
            raise Exception("No audio URL in completed result")
            
        audio_data = await self.download_audio(audio_url)
        
        return completion_result, audio_data 