from typing import List, Dict, Any, Optional
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from ..models import (
    MoodRequest,
    GeneratedMoodTrack,
    MoodProfile,
    LiveMoodSession,
    CollaborativeMoodSpace,
    AdvancedMoodParameter
)
from ..ai_providers import get_ai_provider
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class AdvancedMoodService:
    """Service for handling advanced mood-based music generation features."""

    def __init__(self):
        self.ai_provider = get_ai_provider()

    @transaction.atomic
    async def create_multi_mood_blend(
        self,
        user_id: int,
        moods: List[Dict[str, Any]],
        transition_points: List[float],
        duration: int = 180
    ) -> GeneratedMoodTrack:
        """
        Create a track that blends multiple moods with smooth transitions.
        
        Args:
            user_id: The ID of the user requesting the blend
            moods: List of mood configurations with intensities
            transition_points: List of points (0-1) where transitions should occur
            duration: Total duration in seconds
        """
        # Validate inputs
        if len(moods) < 2:
            raise ValidationError(_("Multi-mood blend requires at least 2 moods"))
        if len(moods) != len(transition_points) + 1:
            raise ValidationError(_("Number of transition points must be one less than number of moods"))
        
        # Create mood request
        request = MoodRequest.objects.create(
            user_id=user_id,
            parameters={
                "type": "multi_mood_blend",
                "moods": moods,
                "transition_points": transition_points,
                "duration": duration
            }
        )

        # Generate emotional curve for transitions
        emotional_curve = self._generate_emotional_curve(moods, transition_points, duration)

        # Generate music with transitions
        generation_result = await self.generate_music_with_transitions({
            "emotional_curve": emotional_curve,
            "duration": duration,
            "user_id": user_id
        })

        # Create generated track
        track = GeneratedMoodTrack.objects.create(
            mood_request=request,
            file_url=generation_result.get("audio_url", ""),
            raw_audio=generation_result.get("audio_data", None),
            format=generation_result.get("format", "mp3"),
            metadata={
                "emotional_curve": emotional_curve,
                "transitions": self._calculate_transition_metadata(emotional_curve),
                "generation_params": generation_result.get("parameters", {})
            }
        )

        return track

    async def generate_music_with_transitions(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate music with transitions using the configured AI provider.
        
        Args:
            params: Dictionary containing emotional curve and other parameters
            
        Returns:
            Dictionary with generation results including audio data/URL
        """
        try:
            # Add additional parameters for the AI provider
            provider_params = {
                "type": "transition_blend",
                "emotional_curve": params["emotional_curve"],
                "duration": params["duration"],
                "user_id": params["user_id"]
            }
            
            # Use the same AI provider that's used for regular generation
            result = await self.ai_provider.generate_music(provider_params)
            
            return result
        except Exception as e:
            logger.error(f"Error generating music with transitions: {str(e)}")
            raise

    def _generate_emotional_curve(
        self,
        moods: List[Dict[str, Any]],
        transition_points: List[float],
        duration: int
    ) -> List[Dict[str, Any]]:
        """
        Generate a smooth emotional curve for transitions between moods.
        """
        # Calculate time points
        time_points = [0] + [int(p * duration) for p in transition_points] + [duration]
        curve = []

        for i in range(len(moods)):
            start_time = time_points[i]
            end_time = time_points[i + 1]
            start_mood = moods[i]
            end_mood = moods[i + 1] if i < len(moods) - 1 else moods[i]

            # Generate curve points for this segment
            segment_points = self._interpolate_mood_segment(
                start_mood,
                end_mood,
                start_time,
                end_time
            )
            curve.extend(segment_points)

        return curve

    def _interpolate_mood_segment(
        self,
        start_mood: Dict[str, Any],
        end_mood: Dict[str, Any],
        start_time: int,
        end_time: int,
        points_per_second: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Create smooth interpolation between two moods.
        """
        num_points = (end_time - start_time) * points_per_second
        curve = []

        for i in range(num_points):
            t = i / (num_points - 1)  # Interpolation factor (0 to 1)
            
            # Apply easing function for smoother transitions
            t = self._ease_in_out_cubic(t)
            
            # Interpolate mood parameters
            mood_point = {
                "time": start_time + (end_time - start_time) * (i / (num_points - 1)),
                "intensity": self._lerp(
                    start_mood["intensity"],
                    end_mood["intensity"],
                    t
                ),
                "parameters": self._interpolate_parameters(
                    start_mood.get("parameters", {}),
                    end_mood.get("parameters", {}),
                    t
                )
            }
            curve.append(mood_point)

        return curve

    def _ease_in_out_cubic(self, t: float) -> float:
        """
        Apply cubic easing function for smoother transitions.
        """
        if t < 0.5:
            return 4 * t * t * t
        else:
            return 1 - pow(-2 * t + 2, 3) / 2

    def _lerp(self, start: float, end: float, t: float) -> float:
        """
        Linear interpolation between two values.
        """
        return start + (end - start) * t

    def _interpolate_parameters(
        self,
        start_params: Dict[str, Any],
        end_params: Dict[str, Any],
        t: float
    ) -> Dict[str, Any]:
        """
        Interpolate between two sets of mood parameters.
        """
        result = {}
        all_keys = set(start_params.keys()) | set(end_params.keys())

        for key in all_keys:
            start_val = start_params.get(key, 0)
            end_val = end_params.get(key, 0)

            if isinstance(start_val, (int, float)) and isinstance(end_val, (int, float)):
                result[key] = self._lerp(start_val, end_val, t)
            else:
                # For non-numeric values, use the start value until halfway, then switch to end value
                result[key] = start_val if t < 0.5 else end_val

        return result

    def _calculate_transition_metadata(
        self,
        emotional_curve: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate metadata about the transitions for visualization and analysis.
        """
        transitions = []
        current_segment = {
            "start_time": emotional_curve[0]["time"],
            "start_intensity": emotional_curve[0]["intensity"]
        }

        # Detect significant changes in the curve
        threshold = 0.1  # Minimum change to consider a transition
        window_size = 5  # Points to average for smoothing

        for i in range(window_size, len(emotional_curve) - window_size):
            prev_avg = np.mean([p["intensity"] for p in emotional_curve[i-window_size:i]])
            next_avg = np.mean([p["intensity"] for p in emotional_curve[i:i+window_size]])

            if abs(next_avg - prev_avg) > threshold:
                # Found a transition point
                current_segment["end_time"] = emotional_curve[i]["time"]
                current_segment["end_intensity"] = emotional_curve[i]["intensity"]
                current_segment["duration"] = current_segment["end_time"] - current_segment["start_time"]
                transitions.append(current_segment)

                # Start new segment
                current_segment = {
                    "start_time": emotional_curve[i]["time"],
                    "start_intensity": emotional_curve[i]["intensity"]
                }

        # Add final segment
        current_segment["end_time"] = emotional_curve[-1]["time"]
        current_segment["end_intensity"] = emotional_curve[-1]["intensity"]
        current_segment["duration"] = current_segment["end_time"] - current_segment["start_time"]
        transitions.append(current_segment)

        return {
            "segments": transitions,
            "total_transitions": len(transitions) - 1,
            "average_segment_duration": np.mean([t["duration"] for t in transitions])
        }
        
    async def update_track_transitions(
        self,
        track_id: int,
        new_transition_points: List[float]
    ) -> GeneratedMoodTrack:
        """
        Update transition points in an existing track.
        
        Args:
            track_id: The ID of the track to update
            new_transition_points: New transition points (0-1)
            
        Returns:
            Updated track object
        """
        # Get the track
        track = GeneratedMoodTrack.objects.get(id=track_id)
        
        # Get the original request parameters
        request = track.mood_request
        params = request.parameters
        
        # Validate new transition points
        moods = params.get("moods", [])
        if len(moods) != len(new_transition_points) + 1:
            raise ValidationError(_("Number of transition points must be one less than number of moods"))
        
        # Update the request parameters
        params["transition_points"] = new_transition_points
        request.parameters = params
        request.save()
        
        # Generate a new emotional curve
        emotional_curve = self._generate_emotional_curve(
            moods,
            new_transition_points,
            params.get("duration", 180)
        )
        
        # Generate new music
        generation_result = await self.generate_music_with_transitions({
            "emotional_curve": emotional_curve,
            "duration": params.get("duration", 180),
            "user_id": request.user_id
        })
        
        # Update the track
        track.file_url = generation_result.get("audio_url", track.file_url)
        track.raw_audio = generation_result.get("audio_data", track.raw_audio)
        track.metadata = {
            "emotional_curve": emotional_curve,
            "transitions": self._calculate_transition_metadata(emotional_curve),
            "generation_params": generation_result.get("parameters", {})
        }
        track.save()
        
        return track
        
    def get_trending_blends(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get trending multi-mood blends based on user feedback.
        
        Args:
            limit: Maximum number of blends to return
            
        Returns:
            List of trending blends with their metadata
        """
        from django.db.models import Count, Avg
        
        # Find tracks with multi-mood blend type and positive feedback
        trending = GeneratedMoodTrack.objects.filter(
            mood_request__parameters__type="multi_mood_blend"
        ).annotate(
            feedback_count=Count('moodfeedback'),
            average_rating=Avg('moodfeedback__rating')
        ).order_by('-average_rating', '-feedback_count')[:limit]
        
        result = []
        for track in trending:
            result.append({
                "track_id": track.id,
                "file_url": track.file_url,
                "moods": track.mood_request.parameters.get("moods", []),
                "transition_points": track.mood_request.parameters.get("transition_points", []),
                "average_rating": track.average_rating if hasattr(track, 'average_rating') else 0,
                "feedback_count": track.feedback_count if hasattr(track, 'feedback_count') else 0
            })
            
        return result 