from typing import Dict, Any, Optional
import json
import jwt
import uuid
from datetime import datetime, timezone
from django.conf import settings
import logging
from .models import UniversalProfileMapping, UserSettings

logger = logging.getLogger(__name__)

class UniversalProfileService:
    """Service for handling universal profile exports and mappings."""

    W3C_CONTEXT = {
        "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://schema.org/",
            "https://w3id.org/security/v2"
        ]
    }

    PREFERENCE_SCHEMAS = {
        "audio": {
            "@type": "AudioConfiguration",
            "properties": {
                "volume": {"type": "number", "minimum": 0, "maximum": 100},
                "quality": {"type": "string", "enum": ["low", "medium", "high"]},
                "latency": {"type": "number", "minimum": 0},
                "compression": {"type": "string"},
                "eq_preset": {"type": "string"}
            }
        },
        "display": {
            "@type": "DisplayPreferences",
            "properties": {
                "theme": {"type": "string", "enum": ["light", "dark", "system"]},
                "brightness": {"type": "number", "minimum": 0, "maximum": 100},
                "contrast": {"type": "number", "minimum": 0, "maximum": 100}
            }
        },
        "notifications": {
            "@type": "NotificationSettings",
            "properties": {
                "enabled": {"type": "boolean"},
                "sound": {"type": "boolean"},
                "priority": {"type": "string", "enum": ["low", "normal", "high"]}
            }
        }
    }

    @classmethod
    def create_did_document(cls, user_id: int, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Create a W3C DID document for user preferences."""
        did_uuid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"user:{user_id}"))
        did = f"did:web:{settings.ALLOWED_HOSTS[0]}:user:{did_uuid}"

        document = {
            **cls.W3C_CONTEXT,
            "id": did,
            "created": datetime.now(timezone.utc).isoformat(),
            "preferenceProfile": {
                "@type": "UserPreferences",
                "controller": did,
                "preferences": {}
            }
        }

        # Map preferences to schema-compliant format
        for category, schema in cls.PREFERENCE_SCHEMAS.items():
            if category in preferences:
                document["preferenceProfile"]["preferences"][category] = {
                    "@type": schema["@type"],
                    "settings": preferences[category]
                }

        return document

    @classmethod
    def create_portable_format(cls, 
                             user_id: int, 
                             preferences: Dict[str, Any], 
                             format_type: str = "w3c_did") -> Dict[str, Any]:
        """Create a portable format of user preferences."""
        if format_type == "w3c_did":
            return cls.create_did_document(user_id, preferences)
        
        raise ValueError(f"Unsupported format type: {format_type}")

    @classmethod
    def validate_preferences(cls, preferences: Dict[str, Any]) -> bool:
        """Validate preferences against schemas."""
        try:
            for category, schema in cls.PREFERENCE_SCHEMAS.items():
                if category in preferences:
                    category_prefs = preferences[category]
                    for key, value in category_prefs.items():
                        if key in schema["properties"]:
                            prop_schema = schema["properties"][key]
                            
                            # Type validation
                            if prop_schema["type"] == "number":
                                if not isinstance(value, (int, float)):
                                    return False
                                if "minimum" in prop_schema and value < prop_schema["minimum"]:
                                    return False
                                if "maximum" in prop_schema and value > prop_schema["maximum"]:
                                    return False
                            
                            elif prop_schema["type"] == "string":
                                if not isinstance(value, str):
                                    return False
                                if "enum" in prop_schema and value not in prop_schema["enum"]:
                                    return False
                            
                            elif prop_schema["type"] == "boolean":
                                if not isinstance(value, bool):
                                    return False
            
            return True
        except Exception as e:
            logger.error(f"Validation error: {str(e)}")
            return False

    @classmethod
    async def export_preferences(cls, 
                               user_id: int, 
                               format_type: str = "w3c_did",
                               include_metadata: bool = True) -> Dict[str, Any]:
        """Export user preferences in a portable format."""
        try:
            # Get user settings
            user_settings = await UserSettings.objects.aget(user_id=user_id)
            preferences = user_settings.preferences or {}

            # Validate preferences
            if not cls.validate_preferences(preferences):
                raise ValueError("Invalid preferences format")

            # Create portable format
            portable_format = cls.create_portable_format(user_id, preferences, format_type)

            if include_metadata:
                # Add export metadata
                portable_format["metadata"] = {
                    "exportedAt": datetime.now(timezone.utc).isoformat(),
                    "format": format_type,
                    "version": "1.0",
                    "schemas": cls.PREFERENCE_SCHEMAS
                }

            # Create or update mapping record
            mapping, _ = await UniversalProfileMapping.objects.aget_or_create(
                user_id=user_id,
                external_profile_format=format_type,
                defaults={
                    'mapping_data': portable_format
                }
            )
            mapping.mapping_data = portable_format
            await mapping.asave()

            return portable_format

        except Exception as e:
            logger.error(f"Error exporting preferences for user {user_id}: {str(e)}")
            raise

    @classmethod
    def create_jwt_token(cls, portable_format: Dict[str, Any], user_id: int) -> str:
        """Create a signed JWT token for the portable format."""
        payload = {
            "sub": f"user:{user_id}",
            "iat": datetime.now(timezone.utc).timestamp(),
            "exp": datetime.now(timezone.utc).timestamp() + (60 * 60 * 24),  # 24 hours
            "preferences": portable_format
        }
        
        return jwt.encode(
            payload,
            settings.SECRET_KEY,
            algorithm='HS256'
        )
