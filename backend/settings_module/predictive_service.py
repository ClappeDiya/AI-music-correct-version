from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone, time
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import logging
from django.db import transaction
from .models import PredictivePreferenceModel, PredictivePreferenceEvent, UserSettings

logger = logging.getLogger(__name__)

class PredictiveService:
    """Service for managing ML-based predictive preferences."""

    PREDICTION_RULES = {
        'night_mode': {
            'trigger': lambda context: time(22, 0) <= context['time'].time() <= time(6, 0),
            'preferences': {
                'display': {
                    'theme': 'dark',
                    'brightness': 40,
                    'blue_light_filter': True
                },
                'audio': {
                    'volume': 50,  # Reduced volume for night
                    'eq_preset': 'night'
                }
            }
        },
        'focus_mode': {
            'trigger': lambda context: (
                context['session_duration'] > 3600 and  # 1 hour
                context['interaction_count'] < 10  # Few interruptions
            ),
            'preferences': {
                'display': {
                    'notifications': False,
                    'minimal_ui': True
                },
                'audio': {
                    'noise_cancellation': True,
                    'volume_normalization': True
                }
            }
        },
        'high_activity': {
            'trigger': lambda context: (
                context['interaction_count'] > 30 and
                context['session_duration'] < 1800  # 30 minutes
            ),
            'preferences': {
                'display': {
                    'animations': True,
                    'advanced_controls': True
                },
                'performance': {
                    'quality': 'high',
                    'latency': 'low'
                }
            }
        }
    }

    @classmethod
    async def train_model(cls, user_id: int) -> PredictivePreferenceModel:
        """Train ML model on user's preference history."""
        # Get historical preference events
        events = await PredictivePreferenceEvent.objects.filter(
            user_id=user_id
        ).values('context_data', 'applied_preferences', 'user_accepted')

        if not events:
            raise ValueError("Insufficient data for training")

        # Prepare training data
        X = []  # Features
        y = []  # Labels

        for event in events:
            features = cls._extract_features(event['context_data'])
            X.append(features)
            y.append(1 if event['user_accepted'] else 0)

        # Train model
        model = RandomForestClassifier(n_estimators=100)
        model.fit(X, y)

        # Save model
        model_record = await PredictivePreferenceModel.objects.create(
            user_id=user_id,
            model_data={
                'feature_names': list(features.keys()),
                'n_estimators': 100,
                'trained_at': datetime.now(timezone.utc).isoformat()
            }
        )

        return model_record

    @classmethod
    def _extract_features(cls, context: Dict[str, Any]) -> Dict[str, float]:
        """Extract numerical features from context."""
        features = {
            'hour': float(context['time'].hour),
            'day_of_week': float(context['time'].weekday()),
            'session_duration': float(context['session_duration']),
            'interaction_count': float(context['interaction_count']),
            'last_change_minutes': float(context.get('last_change_minutes', 0))
        }
        return features

    @classmethod
    async def predict_preferences(cls, 
                                user_id: int, 
                                context: Dict[str, Any]) -> Tuple[Dict[str, Any], str]:
        """Predict preferences based on context."""
        # Check rule-based predictions first
        for rule_name, rule in cls.PREDICTION_RULES.items():
            if rule['trigger'](context):
                return rule['preferences'], rule_name

        # Fall back to ML model if available
        try:
            model = await PredictivePreferenceModel.objects.aget(
                user_id=user_id,
                is_active=True
            )
            
            features = cls._extract_features(context)
            prediction = model.predict([list(features.values())])[0]
            
            if prediction == 1:
                # Use most successful historical preferences
                events = await PredictivePreferenceEvent.objects.filter(
                    user_id=user_id,
                    user_accepted=True
                ).order_by('-created_at')[:5]
                
                if events:
                    return events[0].applied_preferences, 'ml_model'
        
        except PredictivePreferenceModel.DoesNotExist:
            pass
        
        return None, None

    @classmethod
    async def apply_prediction(cls, 
                             user_id: int, 
                             context: Dict[str, Any]) -> Optional[PredictivePreferenceEvent]:
        """Apply predicted preferences if confidence is high."""
        predictions, reason = await cls.predict_preferences(user_id, context)
        
        if not predictions:
            return None

        async with transaction.atomic():
            # Store original preferences
            user_settings = await UserSettings.objects.aget(user_id=user_id)
            original_prefs = user_settings.preferences.copy()

            # Apply predictions
            user_settings.preferences = cls._merge_preferences(
                user_settings.preferences,
                predictions
            )
            await user_settings.asave()

            # Create event record
            event = await PredictivePreferenceEvent.objects.acreate(
                user_id=user_id,
                context_data=context,
                original_preferences=original_prefs,
                applied_preferences=predictions,
                reason_code=reason,
                is_active=True
            )

            return event

    @classmethod
    async def revert_prediction(cls, event_id: int) -> None:
        """Revert a predictive preference change."""
        async with transaction.atomic():
            event = await PredictivePreferenceEvent.objects.aget(id=event_id)
            
            # Restore original preferences
            user_settings = await UserSettings.objects.aget(user_id=event.user_id)
            user_settings.preferences = event.original_preferences
            await user_settings.asave()
            
            # Mark event as rejected
            event.is_active = False
            event.user_accepted = False
            event.reverted_at = datetime.now(timezone.utc)
            await event.asave()

    @classmethod
    async def accept_prediction(cls, event_id: int) -> None:
        """Mark a prediction as accepted by the user."""
        event = await PredictivePreferenceEvent.objects.aget(id=event_id)
        event.user_accepted = True
        await event.asave()

    @staticmethod
    def _merge_preferences(base: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
        """Merge preference updates with base preferences."""
        merged = base.copy()
        
        for category, values in updates.items():
            if category not in merged:
                merged[category] = {}
            if isinstance(values, dict):
                merged[category].update(values)
            else:
                merged[category] = values
                
        return merged

    @classmethod
    async def get_active_predictions(cls, user_id: int) -> List[PredictivePreferenceEvent]:
        """Get active predictions for a user."""
        return await PredictivePreferenceEvent.objects.filter(
            user_id=user_id,
            is_active=True
        ).order_by('-created_at')
