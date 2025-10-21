from typing import Dict, Any
import spacy
from django.conf import settings

class TweakProcessor:
    """
    Service for processing natural language tweak requests.
    Uses spaCy for NLP to understand and extract musical modifications.
    """

    MUSICAL_ASPECTS = {
        'tempo': ['speed', 'pace', 'tempo', 'faster', 'slower', 'bpm'],
        'complexity': ['simple', 'complex', 'complicated', 'basic', 'intricate'],
        'instruments': ['instrument', 'piano', 'guitar', 'drums', 'bass', 'synth'],
        'style': ['style', 'genre', 'feel', 'mood', 'vibe'],
        'volume': ['volume', 'loud', 'quiet', 'soft', 'intensity'],
    }

    def __init__(self):
        """Initialize spaCy model for NLP processing."""
        self.nlp = spacy.load("en_core_web_sm")

    def process_tweak(self, feedback_text: str) -> Dict[str, Any]:
        """
        Process a natural language tweak request and return structured modifications.
        """
        doc = self.nlp(feedback_text.lower())
        
        modifications = {
            'tempo': self._extract_tempo_changes(doc),
            'complexity': self._extract_complexity_changes(doc),
            'instruments': self._extract_instrument_changes(doc),
            'style': self._extract_style_changes(doc),
            'volume': self._extract_volume_changes(doc),
        }
        
        return {k: v for k, v in modifications.items() if v is not None}

    def _extract_tempo_changes(self, doc) -> Dict[str, Any]:
        """Extract tempo-related modifications."""
        tempo_words = set(self.MUSICAL_ASPECTS['tempo'])
        
        for token in doc:
            if token.text in tempo_words:
                # Look for modifiers
                for child in token.children:
                    if child.dep_ == 'amod':
                        if child.text in ['faster', 'quicker', 'higher']:
                            return {'direction': 'increase', 'magnitude': 0.2}
                        elif child.text in ['slower', 'lower']:
                            return {'direction': 'decrease', 'magnitude': 0.2}
        return None

    def _extract_complexity_changes(self, doc) -> Dict[str, Any]:
        """Extract complexity-related modifications."""
        complexity_words = set(self.MUSICAL_ASPECTS['complexity'])
        
        for token in doc:
            if token.text in complexity_words:
                if token.text in ['simple', 'basic']:
                    return {'value': 0.3}
                elif token.text in ['complex', 'intricate']:
                    return {'value': 0.8}
        return None

    def _extract_instrument_changes(self, doc) -> Dict[str, Any]:
        """Extract instrument-related modifications."""
        instrument_words = set(self.MUSICAL_ASPECTS['instruments'])
        changes = []
        
        for token in doc:
            if token.text in instrument_words:
                if any(neg for neg in token.children if neg.dep_ == 'neg'):
                    changes.append({'instrument': token.text, 'action': 'remove'})
                else:
                    changes.append({'instrument': token.text, 'action': 'add'})
        
        return changes if changes else None

    def _extract_style_changes(self, doc) -> Dict[str, Any]:
        """Extract style-related modifications."""
        style_words = set(self.MUSICAL_ASPECTS['style'])
        
        for token in doc:
            if token.text in style_words:
                # Look for style descriptors
                for child in token.children:
                    if child.pos_ == 'ADJ':
                        return {'style': child.text}
        return None

    def _extract_volume_changes(self, doc) -> Dict[str, Any]:
        """Extract volume-related modifications."""
        volume_words = set(self.MUSICAL_ASPECTS['volume'])
        
        for token in doc:
            if token.text in volume_words:
                if token.text in ['loud', 'intensity']:
                    return {'level': 0.8}
                elif token.text in ['quiet', 'soft']:
                    return {'level': 0.3}
        return None
