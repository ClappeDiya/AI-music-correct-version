from typing import List, Dict, Any
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

class PersonaFusionService:
    """Service for handling ML-based persona fusion operations."""

    @staticmethod
    def normalize_preferences(preferences: Dict[str, Any]) -> Dict[str, float]:
        """Normalize numerical values in preferences to [0,1] range."""
        normalized = {}
        scaler = MinMaxScaler()

        for category, values in preferences.items():
            if isinstance(values, dict):
                for key, value in values.items():
                    if isinstance(value, (int, float)):
                        normalized[f"{category}.{key}"] = value
                    elif isinstance(value, bool):
                        normalized[f"{category}.{key}"] = 1.0 if value else 0.0

        if normalized:
            # Reshape for sklearn
            features = list(normalized.values())
            features = np.array(features).reshape(-1, 1)
            normalized_features = scaler.fit_transform(features).flatten()
            
            # Convert back to dict
            return dict(zip(normalized.keys(), normalized_features))
        
        return normalized

    @staticmethod
    def calculate_fusion_weights(personas: List[Dict[str, Any]]) -> List[float]:
        """Calculate weights for each persona based on usage patterns and complexity."""
        weights = []
        total_score = 0

        for persona in personas:
            # Calculate score based on various factors
            score = 1.0  # Base score
            
            # Factor 1: Complexity of settings
            settings_count = sum(1 for _ in PersonaFusionService._iter_numeric_settings(persona))
            complexity_factor = min(settings_count / 10, 1.0)  # Cap at 1.0
            score *= (1 + complexity_factor)
            
            # Factor 2: Usage frequency (if available)
            if 'usage_count' in persona:
                usage_factor = min(persona['usage_count'] / 100, 1.0)  # Cap at 1.0
                score *= (1 + usage_factor)
            
            weights.append(score)
            total_score += score
        
        # Normalize weights
        if total_score > 0:
            weights = [w / total_score for w in weights]
        else:
            weights = [1.0 / len(personas) for _ in personas]
        
        return weights

    @staticmethod
    def _iter_numeric_settings(persona: Dict[str, Any]):
        """Iterator for numeric settings in a persona."""
        for category, values in persona.items():
            if isinstance(values, dict):
                for key, value in values.items():
                    if isinstance(value, (int, float, bool)):
                        yield category, key, value

    @classmethod
    def fuse_personas(cls, 
                     personas: List[Dict[str, Any]], 
                     weights: List[float] = None) -> tuple[Dict[str, Any], float]:
        """
        Fuse multiple personas into a single profile using weighted averaging.
        Returns tuple of (fused_profile, confidence_score)
        """
        if not personas:
            raise ValueError("No personas provided for fusion")
        
        if len(personas) == 1:
            return personas[0], 1.0

        if weights is None:
            weights = cls.calculate_fusion_weights(personas)

        if len(weights) != len(personas):
            raise ValueError("Number of weights must match number of personas")

        # Normalize each persona's preferences
        normalized_personas = [cls.normalize_preferences(p) for p in personas]
        
        # Initialize fused profile
        fused_profile = {}
        confidence_scores = {}

        # Combine all unique keys
        all_keys = set()
        for p in normalized_personas:
            all_keys.update(p.keys())

        # Calculate weighted average for each key
        for key in all_keys:
            values = []
            key_weights = []
            
            for idx, persona in enumerate(normalized_personas):
                if key in persona:
                    values.append(persona[key])
                    key_weights.append(weights[idx])
            
            if values:
                # Normalize weights for available values
                sum_weights = sum(key_weights)
                if sum_weights > 0:
                    key_weights = [w / sum_weights for w in key_weights]
                
                # Calculate weighted average
                weighted_avg = sum(v * w for v, w in zip(values, key_weights))
                
                # Calculate confidence based on variance
                if len(values) > 1:
                    variance = np.var(values)
                    confidence = 1.0 / (1.0 + variance)  # Higher variance = lower confidence
                else:
                    confidence = 1.0  # Single value = full confidence
                
                # Store results
                category, setting = key.split('.', 1)
                if category not in fused_profile:
                    fused_profile[category] = {}
                fused_profile[category][setting] = weighted_avg
                confidence_scores[key] = confidence

        # Calculate overall confidence score
        overall_confidence = sum(confidence_scores.values()) / len(confidence_scores) if confidence_scores else 0.0

        # Convert normalized values back to original types based on first persona's schema
        for category, settings in fused_profile.items():
            for key, value in settings.items():
                original_type = None
                for persona in personas:
                    if category in persona and key in persona[category]:
                        original_type = type(persona[category][key])
                        break
                
                if original_type == bool:
                    settings[key] = value >= 0.5
                elif original_type == int:
                    settings[key] = round(value)
                # Float values remain as is

        return fused_profile, overall_confidence

    @staticmethod
    def preview_fusion(fused_profile: Dict[str, Any], 
                      original_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a diff between the fused profile and original profile."""
        diff = {
            'added': {},
            'modified': {},
            'removed': {},
        }

        # Find added and modified settings
        for category, settings in fused_profile.items():
            if category not in original_profile:
                diff['added'][category] = settings
            else:
                modified = {}
                for key, value in settings.items():
                    if key not in original_profile[category]:
                        modified[key] = {'new': value}
                    elif value != original_profile[category][key]:
                        modified[key] = {
                            'old': original_profile[category][key],
                            'new': value
                        }
                if modified:
                    diff['modified'][category] = modified

        # Find removed settings
        for category, settings in original_profile.items():
            if category not in fused_profile:
                diff['removed'][category] = settings
            else:
                removed = {}
                for key, value in settings.items():
                    if key not in fused_profile[category]:
                        removed[key] = value
                if removed:
                    diff['removed'][category] = removed

        return diff
