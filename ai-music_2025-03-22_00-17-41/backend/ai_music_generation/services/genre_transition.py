import numpy as np
from typing import Dict, List, Any
from ..models_mood_genre import GenreBlend, GenreWeight


class GenreTransitionService:
    """Service for analyzing and generating genre transitions."""
    
    GENRE_COMPATIBILITY = {
        'rock': {
            'metal': 0.9,
            'punk': 0.8,
            'blues': 0.7,
            'funk': 0.6,
            'electronic': 0.5
        },
        'jazz': {
            'blues': 0.9,
            'funk': 0.8,
            'latin': 0.7,
            'classical': 0.6,
            'rock': 0.4
        },
        'classical': {
            'jazz': 0.7,
            'ambient': 0.6,
            'electronic': 0.5,
            'folk': 0.5,
            'rock': 0.3
        },
        'electronic': {
            'hip_hop': 0.8,
            'rock': 0.6,
            'ambient': 0.7,
            'funk': 0.6,
            'jazz': 0.4
        },
        'folk': {
            'country': 0.9,
            'blues': 0.7,
            'rock': 0.5,
            'jazz': 0.4,
            'classical': 0.4
        },
        'hip_hop': {
            'electronic': 0.8,
            'funk': 0.7,
            'rock': 0.6,
            'jazz': 0.5,
            'latin': 0.5
        }
    }
    
    TRANSITION_TECHNIQUES = {
        'rhythmic_bridge': {
            'description': 'Use rhythm as a bridge between genres',
            'compatibility': ['rock', 'funk', 'hip_hop', 'latin']
        },
        'harmonic_bridge': {
            'description': 'Use harmonic progression to transition',
            'compatibility': ['jazz', 'classical', 'folk', 'blues']
        },
        'textural_fade': {
            'description': 'Gradually fade textures between genres',
            'compatibility': ['ambient', 'electronic', 'classical']
        },
        'motif_based': {
            'description': 'Use a common motif across genres',
            'compatibility': ['jazz', 'classical', 'rock', 'folk']
        },
        'percussion_transition': {
            'description': 'Use percussion to bridge rhythmic changes',
            'compatibility': ['latin', 'funk', 'hip_hop', 'electronic']
        }
    }
    
    def analyze_transition(
        self,
        blend: GenreBlend,
        next_blend: GenreBlend = None
    ) -> Dict[str, Any]:
        """Analyze genre transition and suggest techniques."""
        # Get current genre weights
        current_genres = {
            weight.genre: weight.weight
            for weight in blend.genre_weights.all()
        }
        
        # Get target genre weights
        if next_blend:
            target_genres = {
                weight.genre: weight.weight
                for weight in next_blend.genre_weights.all()
            }
        else:
            # If no next blend, use current as target
            target_genres = current_genres
        
        # Calculate compatibility
        compatibility = self._calculate_compatibility(
            current_genres,
            target_genres
        )
        
        # Suggest transition techniques
        techniques = self._suggest_techniques(
            current_genres,
            target_genres
        )
        
        return {
            'transition_start': blend.start_time,
            'transition_end': (
                blend.start_time + blend.duration
            ),
            'source_genres': current_genres,
            'target_genres': target_genres,
            'suggested_techniques': techniques,
            'compatibility_score': compatibility
        }
    
    def _calculate_compatibility(
        self,
        source_genres: Dict[str, float],
        target_genres: Dict[str, float]
    ) -> float:
        """Calculate compatibility score between genre sets."""
        if not source_genres or not target_genres:
            return 0.0
        
        total_score = 0.0
        total_weight = 0.0
        
        for source_genre, source_weight in source_genres.items():
            for target_genre, target_weight in target_genres.items():
                if source_genre == target_genre:
                    score = 1.0
                else:
                    score = self._get_genre_compatibility(
                        source_genre,
                        target_genre
                    )
                
                weight = source_weight * target_weight
                total_score += score * weight
                total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0.0
    
    def _get_genre_compatibility(
        self,
        genre1: str,
        genre2: str
    ) -> float:
        """Get compatibility score between two genres."""
        if genre1 in self.GENRE_COMPATIBILITY:
            if genre2 in self.GENRE_COMPATIBILITY[genre1]:
                return self.GENRE_COMPATIBILITY[genre1][genre2]
        if genre2 in self.GENRE_COMPATIBILITY:
            if genre1 in self.GENRE_COMPATIBILITY[genre2]:
                return self.GENRE_COMPATIBILITY[genre2][genre1]
        return 0.3  # Default compatibility for unknown combinations
    
    def _suggest_techniques(
        self,
        source_genres: Dict[str, float],
        target_genres: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """Suggest transition techniques based on genres."""
        techniques = []
        
        for technique, info in self.TRANSITION_TECHNIQUES.items():
            score = self._calculate_technique_score(
                technique,
                info,
                source_genres,
                target_genres
            )
            
            if score > 0.5:  # Only suggest techniques with good compatibility
                techniques.append({
                    'name': technique,
                    'description': info['description'],
                    'compatibility_score': score,
                    'parameters': self._generate_technique_parameters(
                        technique,
                        source_genres,
                        target_genres
                    )
                })
        
        # Sort by compatibility score
        techniques.sort(key=lambda x: x['compatibility_score'], reverse=True)
        return techniques
    
    def _calculate_technique_score(
        self,
        technique: str,
        info: Dict[str, Any],
        source_genres: Dict[str, float],
        target_genres: Dict[str, float]
    ) -> float:
        """Calculate compatibility score for a transition technique."""
        compatible_genres = set(info['compatibility'])
        score = 0.0
        total_weight = 0.0
        
        # Check source genres
        for genre, weight in source_genres.items():
            if genre in compatible_genres:
                score += weight
            total_weight += weight
        
        # Check target genres
        for genre, weight in target_genres.items():
            if genre in compatible_genres:
                score += weight
            total_weight += weight
        
        return score / (2 * total_weight) if total_weight > 0 else 0.0
    
    def _generate_technique_parameters(
        self,
        technique: str,
        source_genres: Dict[str, float],
        target_genres: Dict[str, float]
    ) -> Dict[str, Any]:
        """Generate specific parameters for a transition technique."""
        if technique == 'rhythmic_bridge':
            return {
                'duration_ratio': 0.3,
                'rhythm_complexity': self._calculate_rhythm_complexity(
                    source_genres,
                    target_genres
                ),
                'tempo_curve': 'exponential'
            }
        elif technique == 'harmonic_bridge':
            return {
                'duration_ratio': 0.4,
                'key_center': self._suggest_key_center(
                    source_genres,
                    target_genres
                ),
                'progression_complexity': 'medium'
            }
        elif technique == 'textural_fade':
            return {
                'duration_ratio': 0.5,
                'layer_count': 4,
                'crossfade_curve': 'sigmoid'
            }
        elif technique == 'motif_based':
            return {
                'duration_ratio': 0.35,
                'motif_length': 4,
                'variation_count': 3
            }
        elif technique == 'percussion_transition':
            return {
                'duration_ratio': 0.25,
                'groove_complexity': 'high',
                'layer_fade_duration': 2.0
            }
        return {}
    
    def _calculate_rhythm_complexity(
        self,
        source_genres: Dict[str, float],
        target_genres: Dict[str, float]
    ) -> str:
        """Calculate appropriate rhythm complexity for transition."""
        complex_genres = {'hip_hop', 'latin', 'funk', 'jazz'}
        
        # Calculate weighted complexity
        total_complexity = 0.0
        total_weight = 0.0
        
        for genres in [source_genres, target_genres]:
            for genre, weight in genres.items():
                if genre in complex_genres:
                    total_complexity += weight
                total_weight += weight
        
        complexity_ratio = total_complexity / (2 * total_weight) if total_weight > 0 else 0.5
        
        if complexity_ratio > 0.7:
            return 'high'
        elif complexity_ratio > 0.4:
            return 'medium'
        return 'low'
    
    def _suggest_key_center(
        self,
        source_genres: Dict[str, float],
        target_genres: Dict[str, float]
    ) -> str:
        """Suggest a key center for harmonic transition."""
        # Simple implementation - could be expanded based on genre characteristics
        return 'C_major'  # Default to C major for now
