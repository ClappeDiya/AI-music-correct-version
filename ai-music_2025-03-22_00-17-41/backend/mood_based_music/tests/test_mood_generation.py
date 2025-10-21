from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from ..models import Mood, GeneratedMoodTrack, MoodFeedback
from ..services import MoodGenerationService
import json

User = get_user_model()

class MoodGenerationUnitTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.mood = Mood.objects.create(
            name='Happy',
            description='Upbeat and joyful',
            intensity=0.8
        )
        self.service = MoodGenerationService()

    def test_mood_generation_with_different_intensities(self):
        """Test that different intensities produce different outputs"""
        # Test low intensity
        track1 = self.service.generate_track(
            user=self.user,
            mood=self.mood,
            intensity=0.2
        )
        
        # Test high intensity
        track2 = self.service.generate_track(
            user=self.user,
            mood=self.mood,
            intensity=0.9
        )
        
        self.assertNotEqual(track1.audio_features, track2.audio_features)
        self.assertLess(track1.audio_features['energy'], track2.audio_features['energy'])

    def test_user_specific_feedback(self):
        """Test that feedback is properly isolated per user"""
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        
        track = self.service.generate_track(
            user=self.user,
            mood=self.mood,
            intensity=0.5
        )
        
        # Create feedback for both users
        feedback1 = MoodFeedback.objects.create(
            user=self.user,
            track=track,
            feedback_type='like'
        )
        
        feedback2 = MoodFeedback.objects.create(
            user=user2,
            track=track,
            feedback_type='dislike'
        )
        
        # Verify each user only sees their own feedback
        user1_feedback = MoodFeedback.objects.filter(user=self.user)
        user2_feedback = MoodFeedback.objects.filter(user=user2)
        
        self.assertEqual(user1_feedback.count(), 1)
        self.assertEqual(user2_feedback.count(), 1)
        self.assertEqual(user1_feedback.first().feedback_type, 'like')
        self.assertEqual(user2_feedback.first().feedback_type, 'dislike')

class MoodGenerationIntegrationTests(APITestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.mood = Mood.objects.create(
            name='Happy',
            description='Upbeat and joyful',
            intensity=0.8
        )
        self.client.force_authenticate(user=self.user)

    def test_concurrent_generation_isolation(self):
        """Test that concurrent generations don't interfere with each other"""
        # Simulate multiple concurrent requests
        response1 = self.client.post(reverse('generate-mood-track'), {
            'mood_id': self.mood.id,
            'intensity': 0.5
        })
        
        response2 = self.client.post(reverse('generate-mood-track'), {
            'mood_id': self.mood.id,
            'intensity': 0.7
        })
        
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        
        # Verify tracks are different
        track1_id = response1.json()['id']
        track2_id = response2.json()['id']
        self.assertNotEqual(track1_id, track2_id)

    def test_feedback_loop_integration(self):
        """Test the complete feedback loop flow"""
        # Generate a track
        response = self.client.post(reverse('generate-mood-track'), {
            'mood_id': self.mood.id,
            'intensity': 0.5
        })
        track_id = response.json()['id']
        
        # Submit feedback
        feedback_response = self.client.post(
            reverse('submit-mood-feedback', kwargs={'track_id': track_id}),
            {'feedback_type': 'like', 'notes': 'Great track!'}
        )
        self.assertEqual(feedback_response.status_code, status.HTTP_201_CREATED)
        
        # Verify feedback is recorded
        track = GeneratedMoodTrack.objects.get(id=track_id)
        self.assertEqual(track.feedback.count(), 1)
        self.assertEqual(track.feedback.first().feedback_type, 'like')
        
        # Verify analytics are updated
        analytics_response = self.client.get(
            reverse('track-analytics', kwargs={'track_id': track_id})
        )
        self.assertEqual(analytics_response.status_code, status.HTTP_200_OK)
        self.assertIn('feedback', analytics_response.json())

    def test_cross_user_data_isolation(self):
        """Test that users cannot access each other's data"""
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        
        # Generate track as user1
        response = self.client.post(reverse('generate-mood-track'), {
            'mood_id': self.mood.id,
            'intensity': 0.5
        })
        track_id = response.json()['id']
        
        # Try to access as user2
        self.client.force_authenticate(user=user2)
        response = self.client.get(
            reverse('track-detail', kwargs={'track_id': track_id})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_rls_enforcement(self):
        """Test Row Level Security enforcement"""
        # Generate tracks for both users
        response1 = self.client.post(reverse('generate-mood-track'), {
            'mood_id': self.mood.id,
            'intensity': 0.5
        })
        
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=user2)
        response2 = self.client.post(reverse('generate-mood-track'), {
            'mood_id': self.mood.id,
            'intensity': 0.5
        })
        
        # Verify each user only sees their own tracks
        self.client.force_authenticate(user=self.user)
        user1_tracks = self.client.get(reverse('user-tracks')).json()
        self.assertEqual(len(user1_tracks), 1)
        self.assertEqual(user1_tracks[0]['id'], response1.json()['id'])
        
        self.client.force_authenticate(user=user2)
        user2_tracks = self.client.get(reverse('user-tracks')).json()
        self.assertEqual(len(user2_tracks), 1)
        self.assertEqual(user2_tracks[0]['id'], response2.json()['id']) 