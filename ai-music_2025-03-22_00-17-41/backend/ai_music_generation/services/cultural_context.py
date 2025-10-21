from typing import Dict, List, Optional
from django.db import models
from django.core.cache import cache
import json
from pathlib import Path

class CulturalElement(models.Model):
    """Model for storing cultural elements and their meanings."""
    tradition = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    description = models.TextField()
    significance = models.TextField()
    common_usage = models.TextField()
    related_elements = models.JSONField(default=list)
    
    class Meta:
        indexes = [
            models.Index(fields=['tradition', 'category']),
            models.Index(fields=['name']),
        ]


class CulturalContextService:
    """Service for managing and retrieving cultural context information."""
    
    def __init__(self):
        self._load_cultural_database()
    
    def _load_cultural_database(self):
        """Load or initialize the cultural elements database."""
        # Check if we need to populate the database
        if CulturalElement.objects.count() == 0:
            self._populate_database()
    
    def _populate_database(self):
        """Populate database with cultural elements from JSON files."""
        data_dir = Path(__file__).parent.parent / 'data' / 'cultural'
        
        if not data_dir.exists():
            return
        
        for file_path in data_dir.glob('*.json'):
            tradition = file_path.stem
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                for category, elements in data.items():
                    for element in elements:
                        CulturalElement.objects.create(
                            tradition=tradition,
                            category=category,
                            **element
                        )
            except Exception as e:
                print(f"Error loading {file_path}: {str(e)}")

    def get_cultural_context(
        self,
        tradition: str,
        text: str,
        category: Optional[str] = None
    ) -> Dict:
        """Get cultural context for text elements."""
        cache_key = f"cultural_context:{tradition}:{category}:{text}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        # Extract relevant elements from text
        elements = self._extract_cultural_elements(
            text,
            tradition,
            category
        )
        
        # Build context dictionary
        context = {
            'elements': elements,
            'general_notes': self._get_general_notes(tradition),
            'recommendations': self._get_cultural_recommendations(
                tradition,
                elements
            )
        }
        
        # Cache the result
        cache.set(cache_key, context, timeout=3600)  # Cache for 1 hour
        return context

    def _extract_cultural_elements(
        self,
        text: str,
        tradition: str,
        category: Optional[str] = None
    ) -> List[Dict]:
        """Extract cultural elements mentioned in text."""
        elements = []
        query = CulturalElement.objects.filter(tradition=tradition)
        
        if category:
            query = query.filter(category=category)
        
        # Get all relevant elements
        for element in query:
            if element.name.lower() in text.lower():
                elements.append({
                    'name': element.name,
                    'category': element.category,
                    'description': element.description,
                    'significance': element.significance,
                    'common_usage': element.common_usage,
                    'related': self._get_related_elements(element)
                })
        
        return elements

    def _get_related_elements(
        self,
        element: CulturalElement
    ) -> List[Dict]:
        """Get details of related cultural elements."""
        related = []
        for related_name in element.related_elements:
            try:
                related_element = CulturalElement.objects.get(
                    name=related_name,
                    tradition=element.tradition
                )
                related.append({
                    'name': related_element.name,
                    'category': related_element.category,
                    'description': related_element.description
                })
            except CulturalElement.DoesNotExist:
                continue
        return related

    def _get_general_notes(self, tradition: str) -> Dict:
        """Get general cultural notes for a tradition."""
        try:
            notes = CulturalElement.objects.get(
                tradition=tradition,
                category='general',
                name='overview'
            )
            return {
                'overview': notes.description,
                'key_concepts': json.loads(notes.significance),
                'etiquette': json.loads(notes.common_usage)
            }
        except CulturalElement.DoesNotExist:
            return {
                'overview': '',
                'key_concepts': [],
                'etiquette': []
            }

    def _get_cultural_recommendations(
        self,
        tradition: str,
        elements: List[Dict]
    ) -> List[str]:
        """Generate cultural recommendations based on elements."""
        recommendations = []
        
        # Add general recommendations
        recommendations.extend(self._get_general_recommendations(tradition))
        
        # Add element-specific recommendations
        for element in elements:
            category = element['category']
            if category == 'instrument':
                recommendations.extend(
                    self._get_instrument_recommendations(tradition, element)
                )
            elif category == 'scale':
                recommendations.extend(
                    self._get_scale_recommendations(tradition, element)
                )
            elif category == 'rhythm':
                recommendations.extend(
                    self._get_rhythm_recommendations(tradition, element)
                )
        
        return list(set(recommendations))  # Remove duplicates

    def _get_general_recommendations(
        self,
        tradition: str
    ) -> List[str]:
        """Get general cultural recommendations."""
        try:
            element = CulturalElement.objects.get(
                tradition=tradition,
                category='recommendations',
                name='general'
            )
            return json.loads(element.description)
        except CulturalElement.DoesNotExist:
            return []

    def _get_instrument_recommendations(
        self,
        tradition: str,
        element: Dict
    ) -> List[str]:
        """Get instrument-specific recommendations."""
        try:
            recommendations = CulturalElement.objects.get(
                tradition=tradition,
                category='recommendations',
                name=f"instrument_{element['name']}"
            )
            return json.loads(recommendations.description)
        except CulturalElement.DoesNotExist:
            return []

    def _get_scale_recommendations(
        self,
        tradition: str,
        element: Dict
    ) -> List[str]:
        """Get scale-specific recommendations."""
        try:
            recommendations = CulturalElement.objects.get(
                tradition=tradition,
                category='recommendations',
                name=f"scale_{element['name']}"
            )
            return json.loads(recommendations.description)
        except CulturalElement.DoesNotExist:
            return []

    def _get_rhythm_recommendations(
        self,
        tradition: str,
        element: Dict
    ) -> List[str]:
        """Get rhythm-specific recommendations."""
        try:
            recommendations = CulturalElement.objects.get(
                tradition=tradition,
                category='recommendations',
                name=f"rhythm_{element['name']}"
            )
            return json.loads(recommendations.description)
        except CulturalElement.DoesNotExist:
            return []
