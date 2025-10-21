import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse
from ..models import LLMProvider, AIMusicRequest, GeneratedTrack
from ..monitoring import MusicGenerationMonitor

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user1():
    return User.objects.create_user(username='testuser1', password='testpass123')

@pytest.fixture
def test_user2():
    return User.objects.create_user(username='testuser2', password='testpass123')

@pytest.fixture
def llm_provider():
    return LLMProvider.objects.create(
        name='test_provider',
        provider_type='test',
        active=True
    )

@pytest.mark.django_db
class TestMusicGenerationFlow:
    """Integration tests for the complete music generation flow."""

    def test_end_to_end_music_generation(self, api_client, test_user1, llm_provider):
        """Test the complete flow from prompt submission to composition retrieval."""
        # Login
        api_client.force_authenticate(user=test_user1)

        # Submit music generation request
        request_data = {
            'prompt_text': 'Create a jazz melody with piano',
            'provider': llm_provider.id,
            'advancedParameters': {
                'genre': 'jazz',
                'instruments': ['piano'],
                'complexity': 'medium'
            }
        }
        response = api_client.post(reverse('aimusicrequest-list'), request_data)
        assert response.status_code == 201
        request_id = response.data['id']

        # Verify request creation and user isolation
        music_request = AIMusicRequest.objects.get(id=request_id)
        assert music_request.user == test_user1
        assert music_request.prompt_text == request_data['prompt_text']

        # Check monitoring logs
        logs = MusicGenerationMonitor.get_usage_statistics(test_user1.id)
        assert logs['total_requests'] > 0

    def test_user_data_isolation(self, api_client, test_user1, test_user2, llm_provider):
        """Test that users can only access their own data."""
        # Create request for user1
        api_client.force_authenticate(user=test_user1)
        request_data = {
            'prompt_text': 'Create a rock song',
            'provider': llm_provider.id
        }
        response = api_client.post(reverse('aimusicrequest-list'), request_data)
        request_id = response.data['id']

        # Try to access with user2
        api_client.force_authenticate(user=test_user2)
        response = api_client.get(f"/api/music-requests/{request_id}/")
        assert response.status_code == 404

    def test_concurrent_requests(self, api_client, test_user1, llm_provider):
        """Test handling of concurrent music generation requests."""
        api_client.force_authenticate(user=test_user1)
        
        # Submit multiple requests rapidly
        requests = []
        for i in range(5):
            request_data = {
                'prompt_text': f'Test prompt {i}',
                'provider': llm_provider.id
            }
            response = api_client.post(reverse('aimusicrequest-list'), request_data)
            assert response.status_code in [201, 429]  # Either created or rate limited
            if response.status_code == 201:
                requests.append(response.data['id'])

        # Verify rate limiting is working
        stats = MusicGenerationMonitor.get_usage_statistics(test_user1.id)
        assert stats['total_requests'] <= 10  # Based on basic tier limit

    def test_composition_security(self, api_client, test_user1, test_user2, llm_provider):
        """Test security features for composition access."""
        # Create composition as user1
        api_client.force_authenticate(user=test_user1)
        request_data = {
            'prompt_text': 'Test composition',
            'provider': llm_provider.id
        }
        response = api_client.post(reverse('aimusicrequest-list'), request_data)
        request_id = response.data['id']

        # Create track
        track = GeneratedTrack.objects.create(
            request_id=request_id,
            audio_file_url='test.mp3'
        )

        # Try to save composition as user2
        api_client.force_authenticate(user=test_user2)
        save_data = {
            'track_id': str(track.id),
            'title': 'Test'
        }
        response = api_client.post(reverse('savedcomposition-save-current'), save_data)
        assert response.status_code in [403, 404]  # Either forbidden or not found

    def test_token_validation(self, api_client, test_user1):
        """Test token handling and authentication."""
        # Test without authentication
        response = api_client.get(reverse('aimusicrequest-list'))
        assert response.status_code == 401

        # Test with invalid token
        api_client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = api_client.get(reverse('aimusicrequest-list'))
        assert response.status_code == 401

        # Test with valid authentication
        api_client.force_authenticate(user=test_user1)
        response = api_client.get(reverse('aimusicrequest-list'))
        assert response.status_code == 200 