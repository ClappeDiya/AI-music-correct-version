from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse
from ..models import LyricPrompt, LyricDraft, FinalLyrics, LyricTimeline
import json

User = get_user_model()

class LyricsEdgeCaseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_extremely_long_lyrics(self):
        """Test handling of extremely long lyrics"""
        # Create a very long prompt
        long_prompt = "Generate " + "very " * 100 + "long lyrics"
        response = self.client.post(reverse('lyric-prompts-list'), {
            'prompt_text': long_prompt,
            'provider': 1,
            'parameters': {
                'complexity': 10,
                'rhymeScheme': 'abab',
                'thematicElements': ['Epic'],
                'emotionalTone': 'Mysterious',
                'verseStructure': 'verse-chorus-bridge'
            }
        }, format='json')
        
        self.assertEqual(response.status_code, 201)
        prompt_id = response.data['id']
        
        # Create a very long draft
        long_draft = "This is " + "a very " * 1000 + "long draft"
        response = self.client.post(reverse('lyric-drafts-list'), {
            'prompt': prompt_id,
            'draft_content': long_draft
        }, format='json')
        
        self.assertEqual(response.status_code, 201)

    def test_repeated_prompts(self):
        """Test handling of repeated prompts"""
        prompt_data = {
            'prompt_text': 'This is a test prompt',
            'provider': 1,
            'parameters': {
                'complexity': 5,
                'rhymeScheme': 'aabb',
                'thematicElements': ['Love'],
                'emotionalTone': 'Joyful',
                'verseStructure': 'verse-chorus'
            }
        }
        
        # Send the same prompt multiple times
        responses = []
        for _ in range(3):
            response = self.client.post(
                reverse('lyric-prompts-list'),
                prompt_data,
                format='json'
            )
            self.assertEqual(response.status_code, 201)
            responses.append(response.data)
        
        # Verify that each response is unique
        contents = [r['prompt_text'] for r in responses]
        self.assertEqual(len(set(contents)), 3)

    def test_unaligned_timeline(self):
        """Test handling of unaligned timeline entries"""
        # Create final lyrics
        final_lyrics = FinalLyrics.objects.create(
            user=self.user,
            content='Test lyrics'
        )
        
        # Try to create overlapping timeline entries
        timeline_data1 = {
            'final_lyrics': final_lyrics.id,
            'start_time_seconds': 0,
            'end_time_seconds': 10,
            'lyric_segment': 'Segment 1'
        }
        
        timeline_data2 = {
            'final_lyrics': final_lyrics.id,
            'start_time_seconds': 5,  # Overlaps with first segment
            'end_time_seconds': 15,
            'lyric_segment': 'Segment 2'
        }
        
        response1 = self.client.post(
            reverse('lyric-timeline-list'),
            timeline_data1,
            format='json'
        )
        self.assertEqual(response1.status_code, 201)
        
        response2 = self.client.post(
            reverse('lyric-timeline-list'),
            timeline_data2,
            format='json'
        )
        self.assertEqual(response2.status_code, 400)  # Should reject overlapping segment

    def test_invalid_parameters(self):
        """Test handling of invalid parameters"""
        # Test invalid complexity value
        response = self.client.post(reverse('lyric-prompts-list'), {
            'prompt_text': 'Test prompt',
            'provider': 1,
            'parameters': {
                'complexity': 999,  # Invalid value
                'rhymeScheme': 'aabb'
            }
        }, format='json')
        self.assertEqual(response.status_code, 400)
        
        # Test invalid rhyme scheme
        response = self.client.post(reverse('lyric-prompts-list'), {
            'prompt_text': 'Test prompt',
            'provider': 1,
            'parameters': {
                'complexity': 5,
                'rhymeScheme': 'invalid'  # Invalid value
            }
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_empty_content(self):
        """Test handling of empty content"""
        # Try to create prompt with empty text
        response = self.client.post(reverse('lyric-prompts-list'), {
            'prompt_text': '',
            'provider': 1
        }, format='json')
        self.assertEqual(response.status_code, 400)
        
        # Try to create draft with empty content
        prompt = LyricPrompt.objects.create(
            user=self.user,
            prompt_text='Test prompt'
        )
        response = self.client.post(reverse('lyric-drafts-list'), {
            'prompt': prompt.id,
            'draft_content': ''
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_special_characters(self):
        """Test handling of special characters in lyrics"""
        special_chars = "!@#$%^&*()_+{}[]|\\:;\"'<>,.?/~`"
        response = self.client.post(reverse('lyric-prompts-list'), {
            'prompt_text': f'Test prompt with {special_chars}',
            'provider': 1
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn(special_chars, response.data['prompt_text']) 