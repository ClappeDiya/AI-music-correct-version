from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import (
    PreferenceExternalization,
    EventBasedPreference,
    BehaviorOverlay,
    UserCurrency
)
from .serializers import (
    PreferenceExternalizationSerializer,
    EventBasedPreferenceSerializer,
    BehaviorOverlaySerializer,
    UserCurrencySerializer
)


class PreferenceExternalizationViewSet(viewsets.ModelViewSet):
    """
    Manage external service preference synchronization.
    """
    serializer_class = PreferenceExternalizationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PreferenceExternalization.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def sync_now(self, request, pk=None):
        """Manually trigger synchronization with external service."""
        externalization = self.get_object()
        externalization.last_sync = timezone.now()
        externalization.save()
        return Response(self.get_serializer(externalization).data)


class EventBasedPreferenceViewSet(viewsets.ModelViewSet):
    """
    Manage temporary event-based preference overrides.
    """
    serializer_class = EventBasedPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EventBasedPreference.objects.filter(
            user=self.request.user,
            end_time__gte=timezone.now()
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def schedule(self, request, pk=None):
        """Schedule a new event-based preference."""
        event = self.get_object()
        return Response(self.get_serializer(event).data)


class BehaviorOverlayViewSet(viewsets.ModelViewSet):
    """
    Manage dynamic UI overlays based on user behavior.
    """
    serializer_class = BehaviorOverlaySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BehaviorOverlay.objects.filter(
            user=self.request.user,
            is_active=True
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def preview(self, request, pk=None):
        """Preview the overlay with current conditions."""
        overlay = self.get_object()
        return Response({
            'overlay': self.get_serializer(overlay).data,
            'preview_data': overlay.overlay_content
        })


class UserCurrencyViewSet(viewsets.ModelViewSet):
    """
    Manage user's preferred currency settings.
    """
    serializer_class = UserCurrencySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserCurrency.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['POST'])
    def set_currency(self, request):
        """Set user's preferred currency."""
        currency_code = request.data.get('currency')
        if not currency_code:
            return Response(
                {'error': 'Currency code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        preference, _ = UserCurrency.objects.update_or_create(
            user=request.user,
            defaults={'currency_code': currency_code}
        )
        return Response(self.get_serializer(preference).data)
