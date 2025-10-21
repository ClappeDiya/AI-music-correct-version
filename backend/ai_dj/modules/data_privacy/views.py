from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import (
    PrivacySettings,
    EphemeralVoiceData,
    EmotionalAnalysisLog,
    DataDeletionRequest
)
from .serializers import (
    PrivacySettingsSerializer,
    EphemeralVoiceDataSerializer,
    EmotionalAnalysisLogSerializer,
    DataDeletionRequestSerializer
)


class PrivacySettingsViewSet(viewsets.ModelViewSet):
    serializer_class = PrivacySettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PrivacySettings.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EphemeralVoiceDataViewSet(viewsets.ModelViewSet):
    serializer_class = EphemeralVoiceDataSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EphemeralVoiceData.objects.filter(
            user=self.request.user,
            expiry_time__gt=timezone.now()
        )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['POST'])
    def cleanup_expired(self, request):
        """Remove expired voice data."""
        expired = EphemeralVoiceData.objects.filter(
            expiry_time__lte=timezone.now()
        )
        count = expired.count()
        expired.delete()
        return Response({
            'message': f'Deleted {count} expired voice data records',
            'deleted_count': count
        })


class EmotionalAnalysisLogViewSet(viewsets.ModelViewSet):
    serializer_class = EmotionalAnalysisLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EmotionalAnalysisLog.objects.filter(
            user=self.request.user,
            expiry_time__gt=timezone.now()
        )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['POST'])
    def anonymize_expired(self, request):
        """Anonymize expired emotional analysis data."""
        expired = EmotionalAnalysisLog.objects.filter(
            expiry_time__lte=timezone.now(),
            is_anonymized=False
        )
        count = expired.count()
        expired.update(
            emotion_data={},
            is_anonymized=True
        )
        return Response({
            'message': f'Anonymized {count} expired emotional analysis records',
            'anonymized_count': count
        })


class DataDeletionRequestViewSet(viewsets.ModelViewSet):
    serializer_class = DataDeletionRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DataDeletionRequest.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['POST'])
    def process_request(self, request, pk=None):
        """Process a data deletion request."""
        deletion_request = self.get_object()
        
        try:
            if deletion_request.request_type == 'voice':
                EphemeralVoiceData.objects.filter(
                    user=request.user
                ).delete()
            elif deletion_request.request_type == 'emotional':
                EmotionalAnalysisLog.objects.filter(
                    user=request.user
                ).update(
                    emotion_data={},
                    is_anonymized=True
                )
            elif deletion_request.request_type == 'all':
                EphemeralVoiceData.objects.filter(
                    user=request.user
                ).delete()
                EmotionalAnalysisLog.objects.filter(
                    user=request.user
                ).update(
                    emotion_data={},
                    is_anonymized=True
                )
            
            deletion_request.status = 'completed'
            deletion_request.completed_at = timezone.now()
            deletion_request.save()
            
            return Response({
                'status': 'success',
                'message': 'Data deletion completed successfully'
            })
            
        except Exception as e:
            deletion_request.status = 'failed'
            deletion_request.save()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
