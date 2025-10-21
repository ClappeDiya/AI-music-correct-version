import pytest
import asyncio
import aiohttp
import time
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from ..models import LLMProvider
from ..monitoring import MusicGenerationMonitor

User = get_user_model()

@pytest.fixture
def test_users():
    users = []
    for i in range(10):
        users.append(User.objects.create_user(
            username=f'testuser{i}',
            password='testpass123'
        ))
    return users

@pytest.fixture
def llm_provider():
    return LLMProvider.objects.create(
        name='test_provider',
        provider_type='test',
        active=True
    )

@pytest.mark.django_db
class TestPerformance:
    """Performance and stress tests for the music generation system."""

    async def _make_concurrent_requests(self, num_requests, user, provider):
        """Helper function to make concurrent requests."""
        async with aiohttp.ClientSession() as session:
            tasks = []
            for i in range(num_requests):
                data = {
                    'prompt_text': f'Test prompt {i}',
                    'provider': str(provider.id),
                    'advancedParameters': {
                        'genre': 'test',
                        'complexity': 'medium'
                    }
                }
                tasks.append(self._make_single_request(session, data, user))
            return await asyncio.gather(*tasks, return_exceptions=True)

    async def _make_single_request(self, session, data, user):
        """Make a single request with timing."""
        headers = {'Authorization': f'Token {user.auth_token.key}'}
        start_time = time.time()
        try:
            async with session.post('/api/music-requests/', json=data, headers=headers) as response:
                response_time = time.time() - start_time
                return {
                    'status': response.status,
                    'response_time': response_time,
                    'success': 200 <= response.status < 300
                }
        except Exception as e:
            return {
                'status': 500,
                'response_time': time.time() - start_time,
                'success': False,
                'error': str(e)
            }

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, test_users, llm_provider):
        """Test system performance under concurrent requests."""
        num_requests = 50  # Adjust based on your needs
        results = await self._make_concurrent_requests(num_requests, test_users[0], llm_provider)

        # Analyze results
        successful_requests = sum(1 for r in results if r['success'])
        avg_response_time = sum(r['response_time'] for r in results) / len(results)
        max_response_time = max(r['response_time'] for r in results)

        print(f"\nPerformance Test Results:")
        print(f"Total Requests: {num_requests}")
        print(f"Successful Requests: {successful_requests}")
        print(f"Average Response Time: {avg_response_time:.2f}s")
        print(f"Max Response Time: {max_response_time:.2f}s")

        # Verify performance meets requirements
        assert successful_requests > 0
        assert avg_response_time < 5.0  # Adjust threshold as needed
        assert max_response_time < 10.0  # Adjust threshold as needed

    def test_rate_limiting(self, test_users, llm_provider):
        """Test rate limiting under high load."""
        client = APIClient()
        user = test_users[0]
        client.force_authenticate(user=user)

        responses = []
        start_time = time.time()

        # Make rapid requests
        for i in range(20):  # Adjust based on your rate limits
            data = {
                'prompt_text': f'Test prompt {i}',
                'provider': llm_provider.id
            }
            response = client.post(reverse('aimusicrequest-list'), data)
            responses.append(response.status_code)
            time.sleep(0.1)  # Small delay to simulate real-world scenario

        # Verify rate limiting
        assert 429 in responses  # Should see some rate limit responses
        assert 201 in responses  # Should see some successful creations

        # Check usage statistics
        stats = MusicGenerationMonitor.get_usage_statistics(user.id)
        assert stats['total_requests'] <= 10  # Based on basic tier limit

    def test_database_performance(self, test_users, llm_provider):
        """Test database performance with large datasets."""
        client = APIClient()
        user = test_users[0]
        client.force_authenticate(user=user)

        # Create multiple requests and tracks
        start_time = time.time()
        for i in range(100):  # Adjust based on your needs
            data = {
                'prompt_text': f'Test prompt {i}',
                'provider': llm_provider.id
            }
            client.post(reverse('aimusicrequest-list'), data)

        creation_time = time.time() - start_time

        # Test query performance
        start_time = time.time()
        response = client.get(reverse('aimusicrequest-list'))
        query_time = time.time() - start_time

        print(f"\nDatabase Performance Results:")
        print(f"Bulk Creation Time: {creation_time:.2f}s")
        print(f"Query Time: {query_time:.2f}s")

        # Verify performance
        assert creation_time < 10.0  # Adjust threshold as needed
        assert query_time < 1.0  # Adjust threshold as needed

    def test_memory_usage(self, test_users, llm_provider):
        """Test memory usage under load."""
        import psutil
        import os

        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB

        client = APIClient()
        user = test_users[0]
        client.force_authenticate(user=user)

        # Generate load
        for i in range(50):  # Adjust based on your needs
            data = {
                'prompt_text': f'Test prompt {i}',
                'provider': llm_provider.id,
                'advancedParameters': {
                    'genre': 'test',
                    'complexity': 'high',
                    'instruments': ['piano', 'guitar', 'drums']
                }
            }
            client.post(reverse('aimusicrequest-list'), data)

        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory

        print(f"\nMemory Usage Results:")
        print(f"Initial Memory: {initial_memory:.2f}MB")
        print(f"Final Memory: {final_memory:.2f}MB")
        print(f"Memory Increase: {memory_increase:.2f}MB")

        # Verify memory usage
        assert memory_increase < 100  # Adjust threshold as needed (MB) 