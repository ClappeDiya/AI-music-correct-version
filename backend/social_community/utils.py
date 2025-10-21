from django.conf import settings
import openai
from typing import Dict, Any
import json

def validate_content_safety(content: str) -> bool:
    """
    Validate content safety using OpenAI's moderation API
    """
    try:
        response = openai.Moderation.create(input=content)
        return not response.results[0].flagged
    except Exception as e:
        logger.error(f"Content safety check failed: {str(e)}")
        return False

def validate_prompt_content(prompt: str) -> Dict[str, Any]:
    """
    Comprehensive prompt validation
    """
    results = {
        'valid': True,
        'feedback': [],
        'suggestions': [],
        'safety_score': 1.0
    }

    # Length validation
    if len(prompt) < 10:
        results['valid'] = False
        results['feedback'].append('Prompt too short')
        results['suggestions'].append('Add more context to your prompt')

    # Content safety
    if not validate_content_safety(prompt):
        results['valid'] = False
        results['feedback'].append('Content safety check failed')
        results['safety_score'] = 0.0

    return results

def get_usage_history(user) -> Dict[str, Any]:
    """
    Get detailed usage history for a user
    """
    return {
        'daily': calculate_daily_usage(user),
        'weekly': calculate_weekly_usage(user),
        'monthly': calculate_monthly_usage(user)
    } 