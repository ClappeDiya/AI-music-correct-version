import numpy as np
from typing import Dict, List, Any
from ..models_mood_genre import MoodTimeline, MoodPoint


class MoodAnalysisService:
    """Service for analyzing mood timelines and generating insights."""
    
    MOOD_GENRE_AFFINITIES = {
        'happy': ['pop', 'funk', 'latin'],
        'sad': ['blues', 'jazz', 'classical'],
        'energetic': ['rock', 'electronic', 'hip_hop'],
        'calm': ['ambient', 'folk', 'classical'],
        'tense': ['rock', 'electronic', 'hip_hop'],
        'relaxed': ['jazz', 'ambient', 'folk']
    }
    
    def analyze_timeline(self, timeline: MoodTimeline) -> Dict[str, Any]:
        """Analyze a mood timeline and generate insights."""
        points = list(timeline.mood_points.all().order_by('timestamp'))
        if not points:
            return self._empty_analysis()
        
        # Get timeline boundaries
        start_time = points[0].timestamp
        end_time = points[-1].timestamp
        
        # Generate mood intensity curves
        mood_curves = self._generate_mood_curves(points, start_time, end_time)
        
        # Calculate dominant moods
        dominant_moods = self._calculate_dominant_moods(mood_curves)
        
        # Generate genre suggestions
        suggested_genres = self._suggest_genres(dominant_moods)
        
        return {
            'section_start': start_time,
            'section_end': end_time,
            'dominant_mood': dominant_moods[0][0],
            'mood_distribution': dict(dominant_moods),
            'intensity_curve': self._sample_intensity_curve(mood_curves),
            'suggested_genres': suggested_genres
        }
    
    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis for timelines with no points."""
        return {
            'section_start': 0.0,
            'section_end': 0.0,
            'dominant_mood': 'neutral',
            'mood_distribution': {},
            'intensity_curve': [],
            'suggested_genres': []
        }
    
    def _generate_mood_curves(
        self,
        points: List[MoodPoint],
        start_time: float,
        end_time: float,
        resolution: int = 100
    ) -> Dict[str, np.ndarray]:
        """Generate continuous mood intensity curves from discrete points."""
        timeline = np.linspace(start_time, end_time, resolution)
        curves = {}
        
        # Initialize curves for each mood type
        for point in points:
            if point.mood_type not in curves:
                curves[point.mood_type] = np.zeros(resolution)
        
        # Generate curves
        for mood_type, curve in curves.items():
            mood_points = [p for p in points if p.mood_type == mood_type]
            if not mood_points:
                continue
            
            for i, t in enumerate(timeline):
                # Find surrounding points
                prev_point = None
                next_point = None
                
                for point in mood_points:
                    if point.timestamp <= t:
                        prev_point = point
                    else:
                        next_point = point
                        break
                
                # Interpolate intensity
                if prev_point and next_point:
                    # Use transition type for interpolation
                    curve[i] = self._interpolate_intensity(
                        t,
                        prev_point,
                        next_point
                    )
                elif prev_point:
                    curve[i] = prev_point.intensity
                elif next_point:
                    curve[i] = next_point.intensity
        
        return curves
    
    def _interpolate_intensity(
        self,
        t: float,
        prev_point: MoodPoint,
        next_point: MoodPoint
    ) -> float:
        """Interpolate intensity between two points based on transition type."""
        t_delta = next_point.timestamp - prev_point.timestamp
        t_progress = (t - prev_point.timestamp) / t_delta
        
        if prev_point.transition_type == 'linear':
            return prev_point.intensity + (
                next_point.intensity - prev_point.intensity
            ) * t_progress
        elif prev_point.transition_type == 'exponential':
            return prev_point.intensity + (
                next_point.intensity - prev_point.intensity
            ) * (t_progress ** 2)
        elif prev_point.transition_type == 'sudden':
            return prev_point.intensity if t_progress < 0.5 else next_point.intensity
        else:  # gradual
            return prev_point.intensity + (
                next_point.intensity - prev_point.intensity
            ) * (np.sin(t_progress * np.pi - np.pi/2) + 1) / 2
    
    def _calculate_dominant_moods(
        self,
        mood_curves: Dict[str, np.ndarray]
    ) -> List[tuple]:
        """Calculate dominant moods from intensity curves."""
        mood_averages = {
            mood: np.mean(curve)
            for mood, curve in mood_curves.items()
        }
        
        # Sort moods by average intensity
        dominant_moods = sorted(
            mood_averages.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return dominant_moods
    
    def _sample_intensity_curve(
        self,
        mood_curves: Dict[str, np.ndarray],
        samples: int = 20
    ) -> List[float]:
        """Sample the combined intensity curve for visualization."""
        if not mood_curves:
            return []
        
        # Combine all curves
        combined_curve = sum(mood_curves.values())
        
        # Normalize
        if np.max(combined_curve) > 0:
            combined_curve = combined_curve / np.max(combined_curve)
        
        # Sample points
        indices = np.linspace(
            0,
            len(combined_curve) - 1,
            samples,
            dtype=int
        )
        return combined_curve[indices].tolist()
    
    def _suggest_genres(
        self,
        dominant_moods: List[tuple],
        max_suggestions: int = 5
    ) -> List[str]:
        """Suggest genres based on dominant moods."""
        genre_scores = {}
        
        # Weight genres by mood intensity
        for mood, intensity in dominant_moods:
            if mood in self.MOOD_GENRE_AFFINITIES:
                for genre in self.MOOD_GENRE_AFFINITIES[mood]:
                    if genre not in genre_scores:
                        genre_scores[genre] = 0
                    genre_scores[genre] += intensity
        
        # Sort genres by score
        sorted_genres = sorted(
            genre_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [genre for genre, _ in sorted_genres[:max_suggestions]]
