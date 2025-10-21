from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse
from ..models import LyricPrompt, LyricDraft, FinalLyrics, LyricTimeline

User = get_user_model()

class LyricsUserIsolationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create two test users
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        
        # Create test data for user1
        self.client.force_authenticate(user=self.user1)
        self.prompt1 = LyricPrompt.objects.create(
            user=self.user1,
            prompt_text='Test prompt for user1'
        )
        self.draft1 = LyricDraft.objects.create(
            prompt=self.prompt1,
            draft_content='Test draft content for user1'
        )
        self.final_lyrics1 = FinalLyrics.objects.create(
            user=self.user1,
            content='Test final lyrics for user1'
        )

    def test_prompt_isolation(self):
        """Test that users can only access their own prompts"""
        # User1 should see their prompt
        response = self.client.get(reverse('lyric-prompts-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['prompt_text'], 'Test prompt for user1')
        
        # User2 should see no prompts
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(reverse('lyric-prompts-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_draft_isolation(self):
        """Test that users can only access drafts from their own prompts"""
        # User1 should see their draft
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('lyric-drafts-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['draft_content'], 'Test draft content for user1')
        
        # User2 should see no drafts
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(reverse('lyric-drafts-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_final_lyrics_isolation(self):
        """Test that users can only access their own final lyrics"""
        # User1 should see their final lyrics
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('final-lyrics-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['content'], 'Test final lyrics for user1')
        
        # User2 should see no final lyrics
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(reverse('final-lyrics-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_cross_user_access_prevention(self):
        """Test that users cannot access or modify each other's data"""
        # Try to access user1's prompt detail as user2
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(reverse('lyric-prompts-detail', kwargs={'pk': self.prompt1.id}))
        self.assertEqual(response.status_code, 404)
        
        # Try to modify user1's draft as user2
        response = self.client.patch(
            reverse('lyric-drafts-detail', kwargs={'pk': self.draft1.id}),
            {'draft_content': 'Modified by user2'}
        )
        self.assertEqual(response.status_code, 404)
        
        # Try to delete user1's final lyrics as user2
        response = self.client.delete(
            reverse('final-lyrics-detail', kwargs={'pk': self.final_lyrics1.id})
        )
        self.assertEqual(response.status_code, 404) 