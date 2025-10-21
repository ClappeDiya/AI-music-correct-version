from typing import Dict, List, Optional
import requests
from django.conf import settings
from functools import lru_cache
import epitran
import iso639

class TranslationService:
    """Service for handling translations and phonetic transcriptions."""
    
    def __init__(self):
        self.api_key = settings.TRANSLATION_API_KEY
        self.base_url = "https://translation.googleapis.com/language/translate/v2"
        self._epi = {}  # Epitran instances cache
        
    def translate_text(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> str:
        """Translate text using Google Cloud Translation API."""
        try:
            response = requests.post(
                f"{self.base_url}?key={self.api_key}",
                json={
                    "q": text,
                    "source": self._normalize_lang_code(source_lang),
                    "target": self._normalize_lang_code(target_lang),
                    "format": "text"
                }
            )
            response.raise_for_status()
            return response.json()['data']['translations'][0]['translatedText']
        except Exception as e:
            raise TranslationError(f"Translation failed: {str(e)}")

    def get_phonetic_guide(
        self,
        text: str,
        language: str
    ) -> Dict[str, str]:
        """Generate IPA and simplified phonetic transcriptions."""
        try:
            lang_code = self._normalize_lang_code(language)
            epi = self._get_epitran_instance(lang_code)
            
            words = text.split()
            guide = {
                'ipa': [],
                'simplified': []
            }
            
            for word in words:
                ipa = epi.transliterate(word)
                guide['ipa'].append({
                    'word': word,
                    'transcription': ipa
                })
                guide['simplified'].append({
                    'word': word,
                    'transcription': self._simplify_ipa(ipa)
                })
            
            return guide
        except Exception as e:
            raise PhoneticError(f"Phonetic guide generation failed: {str(e)}")

    @lru_cache(maxsize=100)
    def _get_epitran_instance(self, lang_code: str) -> 'epitran.Epitran':
        """Get or create an Epitran instance for the language."""
        if lang_code not in self._epi:
            self._epi[lang_code] = epitran.Epitran(f"{lang_code}-001")
        return self._epi[lang_code]

    def _simplify_ipa(self, ipa: str) -> str:
        """Convert IPA to a simplified phonetic representation."""
        # Map of IPA symbols to simplified phonetic symbols
        simplification_map = {
            'ə': 'uh',
            'ɪ': 'ih',
            'ʊ': 'oo',
            'æ': 'ae',
            'ɛ': 'eh',
            'ɔ': 'aw',
            'ʃ': 'sh',
            'θ': 'th',
            'ð': 'th',
            'ŋ': 'ng',
            'ʒ': 'zh',
            'ʤ': 'j',
            'ʧ': 'ch'
        }
        
        simplified = ipa
        for ipa_symbol, simple_symbol in simplification_map.items():
            simplified = simplified.replace(ipa_symbol, simple_symbol)
        return simplified

    @staticmethod
    def _normalize_lang_code(lang_code: str) -> str:
        """Normalize language codes to ISO 639-1."""
        try:
            lang = iso639.languages.get(part1=lang_code)
            return lang.part1
        except (KeyError, AttributeError):
            try:
                lang = iso639.languages.get(part2b=lang_code)
                return lang.part1
            except (KeyError, AttributeError):
                raise ValueError(f"Invalid language code: {lang_code}")


class TranslationError(Exception):
    """Custom exception for translation errors."""
    pass


class PhoneticError(Exception):
    """Custom exception for phonetic guide generation errors."""
    pass
