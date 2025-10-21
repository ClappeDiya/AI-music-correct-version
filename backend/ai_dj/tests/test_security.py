from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from ..models import AIDJSession, AIDJPlayHistory, Track
import json

User = get_user_model()

class SecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
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
        self.track = Track.objects.create(
            title='Test Track',
            artist='Test Artist'
        )
        self.session = AIDJSession.objects.create(
            user=self.user1,
            mood_settings={'happiness': 50}
        )
        
    def test_user_isolation(self):
        """Test that users can only access their own data"""
        # Login as user1
        self.client.force_authenticate(user=self.user1)
        
        # User1 should see their session
        response = self.client.get(reverse('aidj-sessions-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        # Login as user2
        self.client.force_authenticate(user=self.user2)
        
        # User2 should not see user1's session
        response = self.client.get(reverse('aidj-sessions-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)
        
    def test_cross_user_access_prevention(self):
        """Test prevention of cross-user access attempts"""
        self.client.force_authenticate(user=self.user2)
        
        # Attempt to access user1's session
        response = self.client.get(f"/api/ai-dj/sessions/{self.session.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        self.client.force_authenticate(user=self.user1)
        
        # Make multiple requests
        for _ in range(70):  # Exceeds MAX_API_ATTEMPTS_PER_MINUTE
            response = self.client.get(reverse('aidj-sessions-list'))
            
        # The last request should be blocked
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_security_headers(self):
        """Test security headers are properly set"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('aidj-sessions-list'))
        
        self.assertEqual(response['X-Content-Type-Options'], 'nosniff')
        self.assertEqual(response['X-Frame-Options'], 'DENY')
        self.assertTrue('Strict-Transport-Security' in response)
        self.assertTrue('Content-Security-Policy' in response)
        self.assertEqual(response['X-XSS-Protection'], '1; mode=block')
        self.assertEqual(response['Referrer-Policy'], 'same-origin')
        
    def test_voice_data_encryption(self):
        """Test voice command data is properly encrypted"""
        from ..utils.encryption import encrypt, decrypt
        
        voice_command = "play some jazz music"
        encrypted_command = encrypt(voice_command)
        
        session = AIDJSession.objects.create(
            user=self.user1,
            last_voice_command=encrypted_command
        )
        
        # Verify the stored command is encrypted
        stored_session = AIDJSession.objects.get(id=session.id)
        self.assertNotEqual(stored_session.last_voice_command, voice_command)
        
        # Verify we can decrypt it
        decrypted_command = decrypt(stored_session.last_voice_command)
        self.assertEqual(decrypted_command, voice_command) 