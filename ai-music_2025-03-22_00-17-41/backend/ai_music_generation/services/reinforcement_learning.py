from typing import Dict, Any
import numpy as np
from django.db import transaction
from ..models import UserPreference, UserFeedback, GeneratedTrack

class ReinforcementLearningService:
    """
    Service class that handles reinforcement learning for music generation.
    Uses user feedback to continuously adapt and improve music generation.
    """

    def __init__(self, user_id: int):
        self.user_id = user_id
        self.preference, _ = UserPreference.objects.get_or_create(user_id=user_id)

    def process_feedback(self, feedback: UserFeedback) -> None:
        """
        Process new feedback and update the user's preference model.
        """
        with transaction.atomic():
            self.preference.update_from_feedback(feedback)
            self._update_global_model(feedback)

    def get_generation_parameters(self) -> Dict[str, Any]:
        """
        Get parameters for music generation based on learned preferences.
        Implements epsilon-greedy strategy for exploration.
        """
        if np.random.random() < self.preference.exploration_rate:
            return self._explore_parameters()
        else:
            return self._exploit_parameters()

    def _explore_parameters(self) -> Dict[str, Any]:
        """
        Generate parameters that explore new musical possibilities.
        """
        # Randomly select from less-used genres/styles
        low_confidence_aspects = {
            k: v for k, v in self.preference.confidence_scores.items()
            if v < 0.5
        }

        return {
            'genre': self._sample_low_weight(self.preference.genre_weights),
            'instruments': self._sample_low_weight(self.preference.instrument_weights, k=3),
            'style': self._sample_low_weight(self.preference.style_weights),
            'complexity': np.random.beta(2, 2),  # Bell curve around 0.5
            'tempo': self._generate_tempo_range()
        }

    def _exploit_parameters(self) -> Dict[str, Any]:
        """
        Generate parameters based on learned preferences.
        """
        return {
            'genre': self._sample_high_weight(self.preference.genre_weights),
            'instruments': self._sample_high_weight(self.preference.instrument_weights, k=3),
            'style': self._sample_high_weight(self.preference.style_weights),
            'complexity': self.preference.complexity_preference,
            'tempo': self.preference.tempo_preference
        }

    def _update_global_model(self, feedback: UserFeedback) -> None:
        """
        Update global model with anonymized feedback if privacy settings allow.
        """
        # Check privacy settings and update global model accordingly
        pass

    @staticmethod
    def _sample_high_weight(weights: Dict[str, float], k: int = 1):
        """Sample from weights preferring higher values."""
        items = list(weights.items())
        if not items:
            return None
        
        probs = np.array([w for _, w in items])
        probs = probs / probs.sum()
        
        if k == 1:
            return np.random.choice([i for i, _ in items], p=probs)
        else:
            return list(np.random.choice([i for i, _ in items], size=k, p=probs, replace=False))

    @staticmethod
    def _sample_low_weight(weights: Dict[str, float], k: int = 1):
        """Sample from weights preferring lower values (for exploration)."""
        items = list(weights.items())
        if not items:
            return None
        
        # Invert probabilities to prefer lower weights
        probs = 1 - np.array([w for _, w in items])
        probs = probs / probs.sum()
        
        if k == 1:
            return np.random.choice([i for i, _ in items], p=probs)
        else:
            return list(np.random.choice([i for i, _ in items], size=k, p=probs, replace=False))

    @staticmethod
    def _generate_tempo_range():
        """Generate a tempo range for exploration."""
        base_tempo = np.random.randint(60, 180)
        return {
            'min': max(40, base_tempo - 20),
            'max': min(200, base_tempo + 20),
            'preferred': base_tempo
        }
