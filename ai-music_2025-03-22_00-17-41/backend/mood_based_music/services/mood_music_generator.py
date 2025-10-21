"""
MoodMusicGenerator implementation for handling mood-based music generation.
"""
import asyncio
import logging
from typing import Dict, Any, Optional
from django.utils import timezone
from ..models import MoodRequest, GeneratedMoodTrack
from ..ai_providers import get_ai_provider

logger = logging.getLogger(__name__)

class MoodMusicGenerator:
    """
    Handles the generation of music based on mood requests.
    """
    def __init__(self):
        self._ongoing_generations = {}
        self._generation_statuses = {}

    async def generate_music(self, mood_request: MoodRequest) -> GeneratedMoodTrack:
        """
        Generate music based on the provided mood request.
        
        Args:
            mood_request: The MoodRequest object containing parameters for generation
            
        Returns:
            The generated track object
        """
        logger.info(f"Starting music generation for mood request {mood_request.id}")
        
        try:
            # Update generation status
            self._generation_statuses[str(mood_request.id)] = {
                "status": "in_progress",
                "progress": 0.0,
                "started_at": timezone.now().isoformat()
            }
            
            # Get the configured AI provider
            provider = get_ai_provider()
            
            # Prepare parameters for the AI provider
            params = {
                "mood": mood_request.mood.to_dict() if hasattr(mood_request, 'mood') and mood_request.mood else {},
                "intensity": mood_request.intensity,
                "parameters": mood_request.parameters,
                "user_id": mood_request.user.id
            }
            
            # Start background tracking of progress
            asyncio.create_task(self._update_generation_progress(mood_request.id))
            
            # Generate the music
            result = await provider.generate_music(params)
            
            # Create the track record
            track = GeneratedMoodTrack.objects.create(
                mood_request=mood_request,
                track_id=result.get("track_id", f"track_{mood_request.id}"),
                file_url=result.get("audio_url", ""),
                raw_audio=result.get("audio_data", None),
                format=result.get("format", "mp3"),
                metadata=result.get("metadata", {}),
                generation_date=timezone.now()
            )
            
            # Update status to completed
            self._generation_statuses[str(mood_request.id)] = {
                "status": "completed",
                "progress": 1.0,
                "completed_at": timezone.now().isoformat(),
                "track_id": track.id
            }
            
            logger.info(f"Completed music generation for mood request {mood_request.id}")
            return track
            
        except Exception as e:
            logger.error(f"Error generating music for mood request {mood_request.id}: {str(e)}")
            self._generation_statuses[str(mood_request.id)] = {
                "status": "failed",
                "error": str(e),
                "failed_at": timezone.now().isoformat()
            }
            raise

    def get_generation_status(self, request_id: str) -> Dict[str, Any]:
        """
        Get the current status of a music generation task.
        
        Args:
            request_id: The ID of the mood request
            
        Returns:
            A dictionary containing status information
        """
        if str(request_id) not in self._generation_statuses:
            # Check if there's a completed track
            try:
                track = GeneratedMoodTrack.objects.filter(mood_request_id=request_id).order_by('-generation_date').first()
                if track:
                    return {
                        "status": "completed",
                        "progress": 1.0,
                        "completed_at": track.generation_date.isoformat(),
                        "track_id": track.id
                    }
            except Exception as e:
                logger.error(f"Error retrieving track for status check: {str(e)}")
            
            # No status or track found
            return {
                "status": "not_found",
                "request_id": request_id
            }
        
        return self._generation_statuses[str(request_id)]

    async def cancel_generation(self, request_id: str) -> bool:
        """
        Cancel an ongoing music generation task.
        
        Args:
            request_id: The ID of the mood request to cancel
            
        Returns:
            True if successfully canceled, False otherwise
        """
        if str(request_id) in self._ongoing_generations:
            task = self._ongoing_generations[str(request_id)]
            task.cancel()
            
            self._generation_statuses[str(request_id)] = {
                "status": "canceled",
                "canceled_at": timezone.now().isoformat()
            }
            
            return True
        
        return False

    async def _update_generation_progress(self, request_id: str):
        """
        Update the progress of a generation task.
        This is a simulated progress for now - in a real implementation
        this would receive updates from the AI provider.
        """
        try:
            status_key = str(request_id)
            if status_key not in self._generation_statuses:
                return
                
            # Simulate progress updates
            progress = 0.0
            while progress < 1.0:
                progress += 0.1
                self._generation_statuses[status_key]["progress"] = min(0.95, progress)
                await asyncio.sleep(2)  # Update every 2 seconds
                
                # Stop if status changed
                if self._generation_statuses[status_key]["status"] != "in_progress":
                    break
        except Exception as e:
            logger.error(f"Error updating generation progress: {str(e)}") 