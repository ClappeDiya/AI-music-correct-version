from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count
from datetime import timedelta
from .models import (
    WearableDevice, BiometricData, BiometricPreference,
    GroupEmotionalState, EmotionalPreference
)
from .serializers import (
    WearableDeviceSerializer,
    BiometricDataSerializer,
    BiometricPreferenceSerializer,
    GroupEmotionalStateSerializer,
    EmotionalPreferenceSerializer
)
from ai_dj.models import AIDJSession

class WearableDeviceViewSet(viewsets.ModelViewSet):
    queryset = WearableDevice.objects.all()
    serializer_class = WearableDeviceSerializer

    @action(detail=False, methods=['post'])
    def scan(self, request):
        """Scan for available wearable devices of specified type."""
        device_type = request.data.get('type')
        if not device_type:
            return Response(
                {'error': 'Device type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Simulate device scanning
        # In production, this would integrate with actual wearable APIs
        demo_devices = [
            {
                'device_id': f'{device_type}_001',
                'name': f'{device_type.title()} Device 1',
                'type': device_type,
                'status': 'available'
            },
            {
                'device_id': f'{device_type}_002',
                'name': f'{device_type.title()} Device 2',
                'type': device_type,
                'status': 'available'
            }
        ]
        
        return Response(demo_devices)

    @action(detail=True, methods=['post'])
    def connect(self, request, pk=None):
        """Connect to a specific wearable device."""
        device = self.get_object()
        device.status = 'connected'
        device.last_connected = timezone.now()
        device.save()
        return Response(self.get_serializer(device).data)

    @action(detail=True, methods=['post'])
    def disconnect(self, request, pk=None):
        """Disconnect from a specific wearable device."""
        device = self.get_object()
        device.status = 'disconnected'
        device.save()
        return Response(self.get_serializer(device).data)

class BiometricDataViewSet(viewsets.ModelViewSet):
    queryset = BiometricData.objects.all()
    serializer_class = BiometricDataSerializer

    def get_queryset(self):
        """Filter biometric data by session if session_id is provided."""
        queryset = super().get_queryset()
        session_id = self.request.query_params.get('session_id')
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset.order_by('-timestamp')

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest biometric data for a specific session."""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session = get_object_or_404(AIDJSession, id=session_id)
        latest_data = BiometricData.objects.filter(
            session=session
        ).order_by('-timestamp').first()

        if not latest_data:
            return Response(
                {'error': 'No biometric data available'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(latest_data)
        return Response(serializer.data)

class BiometricPreferenceViewSet(viewsets.ModelViewSet):
    queryset = BiometricPreference.objects.all()
    serializer_class = BiometricPreferenceSerializer

    def get_queryset(self):
        """Filter preferences by session if session_id is provided."""
        queryset = super().get_queryset()
        session_id = self.request.query_params.get('session_id')
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset

class GroupEmotionalStateViewSet(viewsets.ModelViewSet):
    queryset = GroupEmotionalState.objects.all()
    serializer_class = GroupEmotionalStateSerializer

    @action(detail=False, methods=['GET'])
    def current_state(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the most recent group state
        latest_state = self.queryset.filter(
            session_id=session_id
        ).first()  # Already ordered by -timestamp

        if not latest_state:
            return Response(
                {"error": "No group emotional state found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(latest_state)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'])
    def calculate_group_state(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get recent biometric data (last 5 minutes)
        recent_time = timezone.now() - timedelta(minutes=5)
        recent_data = BiometricData.objects.filter(
            session_id=session_id,
            timestamp__gte=recent_time
        )

        if not recent_data.exists():
            return Response(
                {"error": "No recent biometric data found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate aggregated metrics
        aggregates = recent_data.aggregate(
            median_heart_rate=Avg('heart_rate'),
            median_energy_level=Avg('energy_level'),
            median_stress_level=Avg('stress_level')
        )

        # Count emotions for distribution
        emotions = recent_data.values('mood').annotate(
            count=Count('id')
        ).order_by('-count')

        total_emotions = sum(e['count'] for e in emotions)
        emotion_distribution = {
            e['mood']: e['count'] / total_emotions
            for e in emotions
        }

        # Calculate consensus strength (ratio of dominant emotion)
        dominant_emotion = emotions[0]['mood']
        consensus_strength = emotion_distribution[dominant_emotion]

        # Create new group state
        group_state = GroupEmotionalState.objects.create(
            session_id=session_id,
            median_heart_rate=aggregates['median_heart_rate'],
            median_energy_level=aggregates['median_energy_level'],
            median_stress_level=aggregates['median_stress_level'],
            dominant_emotion=dominant_emotion,
            emotion_distribution=emotion_distribution,
            consensus_strength=consensus_strength,
            participant_count=recent_data.values('device').distinct().count()
        )

        serializer = self.get_serializer(group_state)
        return Response(serializer.data)

class EmotionalPreferenceViewSet(viewsets.ModelViewSet):
    queryset = EmotionalPreference.objects.all()
    serializer_class = EmotionalPreferenceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('session_id'):
            queryset = queryset.filter(
                session_id=self.request.query_params['session_id']
            )
        if self.request.query_params.get('user_id'):
            queryset = queryset.filter(
                user_id=self.request.query_params['user_id']
            )
        return queryset
