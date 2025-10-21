from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from channels.testing import WebsocketCommunicator
from ..models.plugins import (
    PluginDeveloper,
    Plugin,
    PluginInstallation,
    PluginRating
)
from ..consumers import PluginStateConsumer
from ..serializers import PluginSerializer
import json

User = get_user_model()

class PluginModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.developer = PluginDeveloper.objects.create(
            user=self.user,
            company_name='Test Company'
        )
        self.plugin = Plugin.objects.create(
            name='Test Plugin',
            developer=self.developer,
            version='1.0.0',
            description='Test Description'
        )
        self.installation = PluginInstallation.objects.create(
            plugin=self.plugin,
            user=self.user,
            status='installed'
        )

    def test_plugin_creation(self):
        self.assertEqual(self.plugin.name, 'Test Plugin')
        self.assertEqual(self.plugin.developer, self.developer)
        self.assertEqual(self.plugin.version, '1.0.0')

    def test_plugin_installation(self):
        self.assertEqual(self.installation.plugin, self.plugin)
        self.assertEqual(self.installation.user, self.user)
        self.assertEqual(self.installation.status, 'installed')

class PluginAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.client.force_authenticate(user=self.user)
        self.developer = PluginDeveloper.objects.create(
            user=self.user,
            company_name='Test Company'
        )
        self.plugin_data = {
            'name': 'Test Plugin',
            'version': '1.0.0',
            'description': 'Test Description'
        }

    def test_create_plugin(self):
        response = self.client.post('/api/plugins/', self.plugin_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Plugin.objects.count(), 1)

    def test_install_plugin(self):
        plugin = Plugin.objects.create(
            name='Test Plugin',
            developer=self.developer,
            version='1.0.0'
        )
        response = self.client.post(f'/api/plugin-installations/', {
            'plugin': plugin.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PluginInstallation.objects.count(), 1)

class PluginWebSocketTests(TestCase):
    async def test_plugin_state_consumer(self):
        user = await User.objects.acreate(username='testuser', password='12345')
        developer = await PluginDeveloper.objects.acreate(
            user=user,
            company_name='Test Company'
        )
        plugin = await Plugin.objects.acreate(
            name='Test Plugin',
            developer=developer,
            version='1.0.0'
        )

        communicator = WebsocketCommunicator(
            PluginStateConsumer.as_asgi(),
            f"/ws/plugin/{plugin.id}/"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Test updating plugin state
        await communicator.send_json_to({
            'action': 'update_state',
            'state': {'setting1': 'value1', 'setting2': 'value2'}
        })

        response = await communicator.receive_json_from()
        self.assertIn('setting1', response)
        self.assertEqual(response['setting1'], 'value1')

        await communicator.disconnect()
