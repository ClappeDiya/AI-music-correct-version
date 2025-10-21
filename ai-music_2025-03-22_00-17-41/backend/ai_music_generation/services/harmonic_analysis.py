import numpy as np
from typing import Dict, List, Any
from ..models_mood_genre import ChordProgression


class HarmonicAnalysisService:
    """Service for analyzing chord progressions and harmonic structure."""
    
    CHORD_FUNCTIONS = {
        'I': ['C', 'AM7'],
        'ii': ['Dm', 'Dm7'],
        'iii': ['Em', 'Em7'],
        'IV': ['F', 'FMaj7'],
        'V': ['G', 'G7'],
        'vi': ['Am', 'Am7'],
        'vii': ['Bdim', 'Bm7b5']
    }
    
    GENRE_HARMONY_PREFERENCES = {
        'jazz': {
            'extensions': True,
            'complexity': 'high',
            'common_progressions': [
                'ii-V-I',
                'iii-vi-ii-V',
                'I-vi-ii-V'
            ]
        },
        'rock': {
            'extensions': False,
            'complexity': 'medium',
            'common_progressions': [
                'I-IV-V',
                'I-V-vi-IV',
                'i-III-VII'
            ]
        },
        'classical': {
            'extensions': False,
            'complexity': 'high',
            'common_progressions': [
                'I-IV-V-I',
                'I-vi-IV-V',
                'ii-V-I'
            ]
        },
        'folk': {
            'extensions': False,
            'complexity': 'low',
            'common_progressions': [
                'I-IV-I-V',
                'I-V-vi-IV',
                'vi-IV-I-V'
            ]
        }
    }
    
    def analyze_progression(
        self,
        progression: ChordProgression
    ) -> Dict[str, Any]:
        """Analyze a chord progression."""
        chords = progression.progression
        
        # Determine key
        key = self._determine_key(chords)
        
        # Analyze chord functions
        chord_functions = self._analyze_chord_functions(chords, key)
        
        # Calculate tension points
        tension_points = self._calculate_tension_points(chord_functions)
        
        # Generate resolution suggestions
        resolution_suggestions = self._generate_resolution_suggestions(
            chord_functions,
            tension_points
        )
        
        # Analyze genre compatibility
        genre_compatibility = self._analyze_genre_compatibility(
            chord_functions,
            chords
        )
        
        return {
            'progression_id': progression.id,
            'key': key,
            'chord_functions': chord_functions,
            'tension_points': tension_points,
            'resolution_suggestions': resolution_suggestions,
            'genre_compatibility': genre_compatibility
        }
    
    def _determine_key(self, chords: List[str]) -> str:
        """Determine the likely key of a progression."""
        # Simple implementation - could be expanded with more sophisticated analysis
        return 'C'  # Default to C for now
    
    def _analyze_chord_functions(
        self,
        chords: List[str],
        key: str
    ) -> List[str]:
        """Analyze the function of each chord in the progression."""
        functions = []
        
        for chord in chords:
            # Simple implementation - could be expanded
            function = self._get_chord_function(chord, key)
            functions.append(function)
        
        return functions
    
    def _get_chord_function(self, chord: str, key: str) -> str:
        """Get the function of a chord in a given key."""
        # Simple implementation - could be expanded
        for function, chord_list in self.CHORD_FUNCTIONS.items():
            if chord in chord_list:
                return function
        return 'Unknown'
    
    def _calculate_tension_points(
        self,
        chord_functions: List[str]
    ) -> List[float]:
        """Calculate tension points in the progression."""
        tension_points = []
        
        for i in range(len(chord_functions)):
            tension = self._calculate_chord_tension(
                chord_functions[i],
                chord_functions[i-1] if i > 0 else None
            )
            tension_points.append(tension)
        
        return tension_points
    
    def _calculate_chord_tension(
        self,
        current_function: str,
        previous_function: str = None
    ) -> float:
        """Calculate tension value for a chord based on its function."""
        base_tension = {
            'I': 0.1,
            'ii': 0.4,
            'iii': 0.5,
            'IV': 0.3,
            'V': 0.7,
            'vi': 0.4,
            'vii': 0.8
        }
        
        tension = base_tension.get(current_function, 0.5)
        
        if previous_function:
            # Adjust tension based on progression
            if previous_function == 'V' and current_function != 'I':
                tension += 0.2  # Unresolved dominant
            elif previous_function == 'vii' and current_function != 'I':
                tension += 0.3  # Unresolved diminished
        
        return min(tension, 1.0)
    
    def _generate_resolution_suggestions(
        self,
        chord_functions: List[str],
        tension_points: List[float]
    ) -> List[str]:
        """Generate suggestions for resolving tension."""
        suggestions = []
        
        for i, (function, tension) in enumerate(zip(chord_functions, tension_points)):
            if tension > 0.6:
                if function == 'V':
                    suggestions.append(f"Consider resolving to I after {i+1}th chord")
                elif function == 'vii':
                    suggestions.append(f"Strong resolution needed after {i+1}th chord")
                elif tension > 0.8:
                    suggestions.append(f"High tension at {i+1}th chord - consider cadence")
        
        return suggestions
    
    def _analyze_genre_compatibility(
        self,
        chord_functions: List[str],
        chords: List[str]
    ) -> Dict[str, float]:
        """Analyze how well the progression fits different genres."""
        compatibility = {}
        
        for genre, preferences in self.GENRE_HARMONY_PREFERENCES.items():
            score = self._calculate_genre_compatibility(
                chord_functions,
                chords,
                preferences
            )
            compatibility[genre] = score
        
        return compatibility
    
    def _calculate_genre_compatibility(
        self,
        chord_functions: List[str],
        chords: List[str],
        preferences: Dict[str, Any]
    ) -> float:
        """Calculate compatibility score for a specific genre."""
        score = 0.0
        
        # Check progression patterns
        progression_str = '-'.join(chord_functions)
        for common_prog in preferences['common_progressions']:
            if common_prog in progression_str:
                score += 0.3
        
        # Check complexity
        complexity_score = self._evaluate_complexity(
            chords,
            preferences['complexity']
        )
        score += complexity_score * 0.4
        
        # Check extensions
        extensions_score = self._evaluate_extensions(
            chords,
            preferences['extensions']
        )
        score += extensions_score * 0.3
        
        return min(score, 1.0)
    
    def _evaluate_complexity(
        self,
        chords: List[str],
        target_complexity: str
    ) -> float:
        """Evaluate if progression complexity matches target."""
        unique_chords = len(set(chords))
        
        if target_complexity == 'high':
            return min(unique_chords / 8, 1.0)
        elif target_complexity == 'medium':
            return 1.0 - abs(unique_chords - 5) / 5
        else:  # low
            return 1.0 - min(unique_chords / 4, 1.0)
    
    def _evaluate_extensions(
        self,
        chords: List[str],
        wants_extensions: bool
    ) -> float:
        """Evaluate if chord extensions match preference."""
        extension_count = sum(
            1 for chord in chords if any(
                ext in chord for ext in ['7', '9', '11', '13']
            )
        )
        
        if wants_extensions:
            return min(extension_count / len(chords), 1.0)
        else:
            return 1.0 - min(extension_count / len(chords), 1.0)
