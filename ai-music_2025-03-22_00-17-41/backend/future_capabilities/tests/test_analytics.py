from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from ..models.analytics import FeatureUsageAnalytics
from ..serializers import FeatureAnalyticsSerializer

User = get_user_model()

class AnalyticsModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.analytics = FeatureUsageAnalytics.objects.create(
            feature_name='test_feature',
            user=self.user,
            usage_count=1,
            usage_duration=60,
            last_used='2025-01-27T20:55:37-07:00'
        )

    def test_analytics_creation(self):
        self.assertEqual(self.analytics.feature_name, 'test_feature')
        self.assertEqual(self.analytics.user, self.user)
        self.assertEqual(self.analytics.usage_count, 1)
        self.assertEqual(self.analytics.usage_duration, 60)

    def test_analytics_increment(self):
        self.analytics.increment_usage(duration=30)
        self.assertEqual(self.analytics.usage_count, 2)
        self.assertEqual(self.analytics.usage_duration, 90)

class AnalyticsAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='12345',
            email='admin@test.com'
        )
        self.client.force_authenticate(user=self.user)
        self.analytics_data = {
            'feature_name': 'test_feature',
            'usage_count': 1,
            'usage_duration': 60
        }

    def test_create_analytics(self):
        response = self.client.post('/api/feature-analytics/', self.analytics_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FeatureUsageAnalytics.objects.count(), 1)

    def test_list_analytics(self):
        FeatureUsageAnalytics.objects.create(
            feature_name='test_feature',
            user=self.user,
            usage_count=1,
            usage_duration=60
        )
        response = self.client.get('/api/feature-analytics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_analytics_permissions(self):
        # Create regular user
        regular_user = User.objects.create_user(username='regular', password='12345')
        self.client.force_authenticate(user=regular_user)
        
        # Regular user should not be able to create analytics
        response = self.client.post('/api/feature-analytics/', self.analytics_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Regular user should not be able to view analytics
        response = self.client.get('/api/feature-analytics/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class AnalyticsSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.analytics_data = {
            'feature_name': 'test_feature',
            'user': self.user.id,
            'usage_count': 1,
            'usage_duration': 60
        }

    def test_valid_serializer(self):
        serializer = FeatureAnalyticsSerializer(data=self.analytics_data)
        self.assertTrue(serializer.is_valid())

    def test_invalid_serializer(self):
        invalid_data = self.analytics_data.copy()
        invalid_data['usage_count'] = -1  # Invalid negative count
        serializer = FeatureAnalyticsSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
