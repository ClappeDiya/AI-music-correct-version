from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from channels.testing import WebsocketCommunicator
from ..models.vr import VREnvironmentConfig, VRSession, VRInteraction
from ..consumers import VRSessionConsumer
from ..serializers import VREnvironmentConfigSerializer
import json

User = get_user_model()

class VRModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.environment = VREnvironmentConfig.objects.create(
            name='Test Environment',
            description='Test Description',
            owner=self.user
        )
        self.session = VRSession.objects.create(
            environment=self.environment,
            user=self.user
        )

    def test_vr_environment_creation(self):
        self.assertEqual(self.environment.name, 'Test Environment')
        self.assertEqual(self.environment.owner, self.user)

    def test_vr_session_creation(self):
        self.assertEqual(self.session.environment, self.environment)
        self.assertEqual(self.session.user, self.user)

class VRAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.client.force_authenticate(user=self.user)
        self.environment_data = {
            'name': 'Test Environment',
            'description': 'Test Description'
        }

    def test_create_environment(self):
        response = self.client.post('/api/vr-environments/', self.environment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VREnvironmentConfig.objects.count(), 1)

    def test_list_environments(self):
        VREnvironmentConfig.objects.create(
            name='Test Environment',
            description='Test Description',
            owner=self.user
        )
        response = self.client.get('/api/vr-environments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class VRWebSocketTests(TestCase):
    async def test_vr_session_consumer(self):
        user = await User.objects.acreate(username='testuser', password='12345')
        environment = await VREnvironmentConfig.objects.acreate(
            name='Test Environment',
            description='Test Description',
            owner=user
        )
        session = await VRSession.objects.acreate(
            environment=environment,
            user=user
        )

        communicator = WebsocketCommunicator(
            VRSessionConsumer.as_asgi(),
            f"/ws/vr-session/{session.id}/"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Test sending position update
        await communicator.send_json_to({
            'action': 'update_position',
            'position': {'x': 1.0, 'y': 2.0, 'z': 3.0},
            'rotation': {'x': 0.0, 'y': 90.0, 'z': 0.0}
        })

        response = await communicator.receive_json_from()
        self.assertIn('position', response)
        self.assertIn('rotation', response)

        await communicator.disconnect()
