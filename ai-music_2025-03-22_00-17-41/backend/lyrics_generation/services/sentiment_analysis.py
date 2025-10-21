from typing import Dict, List, Optional
import httpx
from django.conf import settings
from ..config import LyricsConfig

class SentimentAnalysisService:
    """Service for analyzing sentiment in lyrics"""
    
    def __init__(self):
        self.config = LyricsConfig.get_instance()
        self.client = httpx.AsyncClient(
            base_url=self.config.SENTIMENT_API_URL,
            headers={'Authorization': f'Bearer {self.config.SENTIMENT_API_KEY}'},
            timeout=30.0
        )
    
    async def analyze_lyrics(self, lyrics: str) -> Dict[str, float]:
        """
        Analyze the sentiment of lyrics text.
        Returns a dictionary of emotion scores.
        """
        try:
            response = await self.client.post('/analyze', json={
                'text': lyrics,
                'features': ['emotion', 'sentiment', 'intensity']
            })
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise ValueError(f'Failed to analyze lyrics: {str(e)}')
    
    async def compare_versions(self, original: str, edited: str) -> Dict[str, any]:
        """
        Compare sentiment between original and edited lyrics.
        Returns a comparison of emotional changes.
        """
        try:
            response = await self.client.post('/compare', json={
                'original': original,
                'edited': edited,
                'features': ['emotion_shift', 'intensity_change']
            })
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise ValueError(f'Failed to compare lyrics versions: {str(e)}')
    
    async def get_thematic_suggestions(self, current_sentiment: Dict[str, float]) -> List[str]:
        """
        Get suggestions for thematic elements based on current sentiment.
        Returns a list of suggested themes.
        """
        try:
            response = await self.client.post('/suggest', json={
                'sentiment': current_sentiment,
                'count': 5
            })
            response.raise_for_status()
            return response.json()['suggestions']
        except httpx.HTTPError as e:
            raise ValueError(f'Failed to get thematic suggestions: {str(e)}')
    
    async def detect_emotional_shifts(self, lyrics: str) -> List[Dict[str, any]]:
        """
        Detect emotional shifts within lyrics.
        Returns a list of detected shifts with their positions.
        """
        try:
            response = await self.client.post('/shifts', json={
                'text': lyrics,
                'granularity': 'verse'
            })
            response.raise_for_status()
            return response.json()['shifts']
        except httpx.HTTPError as e:
            raise ValueError(f'Failed to detect emotional shifts: {str(e)}')
    
    async def get_sentiment_timeline(self, lyrics: str, segments: List[Dict[str, any]]) -> List[Dict[str, any]]:
        """
        Generate a timeline of sentiment changes for synchronized lyrics.
        Returns a list of sentiment data points with timestamps.
        """
        try:
            response = await self.client.post('/timeline', json={
                'text': lyrics,
                'segments': segments
            })
            response.raise_for_status()
            return response.json()['timeline']
        except httpx.HTTPError as e:
            raise ValueError(f'Failed to generate sentiment timeline: {str(e)}')
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    async def __aenter__(self):
        """Context manager entry"""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        await self.close() 