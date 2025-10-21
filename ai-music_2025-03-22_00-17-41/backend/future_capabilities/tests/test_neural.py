from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from channels.testing import WebsocketCommunicator
from ..models.neural import NeuralDevice, NeuralSignal, NeuralControl
from ..consumers import NeuralSignalConsumer
from ..serializers import NeuralDeviceSerializer
import json

User = get_user_model()

class NeuralModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.device = NeuralDevice.objects.create(
            name='Test Device',
            user=self.user,
            device_type='EEG'
        )
        self.signal = NeuralSignal.objects.create(
            device=self.device,
            signal_type='alpha',
            signal_data={'frequency': 10, 'amplitude': 0.5}
        )

    def test_neural_device_creation(self):
        self.assertEqual(self.device.name, 'Test Device')
        self.assertEqual(self.device.device_type, 'EEG')
        self.assertEqual(self.device.user, self.user)

    def test_neural_signal_creation(self):
        self.assertEqual(self.signal.device, self.device)
        self.assertEqual(self.signal.signal_type, 'alpha')
        self.assertEqual(self.signal.signal_data['frequency'], 10)

class NeuralAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.client.force_authenticate(user=self.user)
        self.device_data = {
            'name': 'Test Device',
            'device_type': 'EEG'
        }

    def test_create_device(self):
        response = self.client.post('/api/neural-devices/', self.device_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(NeuralDevice.objects.count(), 1)

    def test_process_signal(self):
        device = NeuralDevice.objects.create(
            name='Test Device',
            user=self.user,
            device_type='EEG'
        )
        signal_data = {
            'device_id': device.id,
            'signal_type': 'alpha',
            'signal_data': {'frequency': 10, 'amplitude': 0.5}
        }
        response = self.client.post('/api/process-neural-signal/', signal_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(NeuralSignal.objects.count(), 1)

class NeuralWebSocketTests(TestCase):
    async def test_neural_signal_consumer(self):
        user = await User.objects.acreate(username='testuser', password='12345')
        device = await NeuralDevice.objects.acreate(
            name='Test Device',
            user=user,
            device_type='EEG'
        )

        communicator = WebsocketCommunicator(
            NeuralSignalConsumer.as_asgi(),
            f"/ws/neural-device/{device.id}/"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Test sending signal data
        await communicator.send_json_to({
            'signal_type': 'alpha',
            'signal_data': {'frequency': 10, 'amplitude': 0.5}
        })

        response = await communicator.receive_json_from()
        self.assertEqual(response['signal_type'], 'alpha')
        self.assertEqual(response['signal_data']['frequency'], 10)

        await communicator.disconnect()
