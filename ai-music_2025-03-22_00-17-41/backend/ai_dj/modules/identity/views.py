from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import IdentityBridge, IdentityVerification, LoginSession
from .serializers import (
    IdentityBridgeSerializer,
    IdentityVerificationSerializer,
    LoginSessionSerializer
)


class IdentityBridgeViewSet(viewsets.ModelViewSet):
    serializer_class = IdentityBridgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return IdentityBridge.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['POST'])
    def toggle(self, request, pk=None):
        """Toggle the active status of an identity bridge."""
        bridge = self.get_object()
        bridge.is_active = not bridge.is_active
        bridge.save()
        return Response(IdentityBridgeSerializer(bridge).data)
    
    @action(detail=True, methods=['POST'])
    def refresh_token(self, request, pk=None):
        """Refresh the access token for this identity bridge."""
        bridge = self.get_object()
        try:
            # Implement token refresh logic here
            # This will vary based on the service
            return Response(IdentityBridgeSerializer(bridge).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class IdentityVerificationViewSet(viewsets.ModelViewSet):
    serializer_class = IdentityVerificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return IdentityVerification.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['POST'])
    def verify(self, request):
        """Initiate or complete verification process."""
        verification_method = request.data.get('method')
        if not verification_method:
            return Response(
                {'error': 'Verification method required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        verification, created = IdentityVerification.objects.get_or_create(
            user=request.user,
            defaults={'verification_method': verification_method}
        )
        
        # Implement verification logic here based on method
        # This is a placeholder for the actual implementation
        verification.is_verified = True
        verification.verified_at = timezone.now()
        verification.save()
        
        return Response(IdentityVerificationSerializer(verification).data)


class LoginSessionViewSet(viewsets.ModelViewSet):
    serializer_class = LoginSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LoginSession.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['POST'])
    def terminate(self, request, pk=None):
        """Terminate a specific login session."""
        session = self.get_object()
        session.is_active = False
        session.save()
        return Response(LoginSessionSerializer(session).data)
    
    @action(detail=False, methods=['POST'])
    def terminate_all(self, request):
        """Terminate all sessions except the current one."""
        current_session = request.data.get('current_session_id')
        if not current_session:
            return Response(
                {'error': 'Current session ID required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        LoginSession.objects.filter(
            user=request.user
        ).exclude(
            session_id=current_session
        ).update(is_active=False)
        
        return Response({'status': 'All other sessions terminated'})
