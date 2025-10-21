from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from rest_framework import status
from django_filters import rest_framework as django_filters
from .models import Genre, MixingSession, MixingSessionGenre, MixingSessionParams, MixingOutput, TrackReference
from .serializers import (
    GenreSerializer, MixingSessionSerializer, MixingSessionGenreSerializer,
    MixingSessionParamsSerializer, MixingOutputSerializer, TrackReferenceSerializer
)
import logging
from rest_framework.decorators import action
from django.utils import timezone

logger = logging.getLogger(__name__)

class UserSpecificViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet that implements user-specific access control.
    """
    def get_queryset(self):
        """
        Filter queryset based on user access.
        """
        qs = super().get_queryset()
        if not self.request.user.is_superuser:
            user_field = getattr(self, 'user_field', 'user')
            return qs.filter(**{user_field: self.request.user})
        return qs

class GenreViewSet(UserSpecificViewSet):
    """
    ViewSet for the Genre model.
    """
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    permission_classes = [permissions.IsAuthenticated]
    user_field = 'created_by'

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class MixingSessionViewSet(UserSpecificViewSet):
    """
    ViewSet for the MixingSession model.
    """
    queryset = MixingSession.objects.all()
    serializer_class = MixingSessionSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['session_name']
    ordering_fields = ['created_at', 'updated_at']
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def latest_analysis(self, request, pk=None):
        session = self.get_object()
        latest_reference = session.track_references.order_by('-version').first()
        if not latest_reference:
            return Response({'error': 'No analysis available'}, status=404)
        return Response(latest_reference.analysis_data)

    @action(detail=True, methods=['get'])
    def verify_access(self, request, pk=None):
        session = self.get_object()
        has_access = session.user == request.user or request.user.is_superuser
        return Response({'hasAccess': has_access})

    @action(detail=True, methods=['post'])
    def start_analysis(self, request, pk=None):
        """
        Start analysis for a mixing session
        """
        session = self.get_object()
        
        # Create new track reference for analysis if none exists
        reference, created = TrackReference.objects.get_or_create(
            session=session,
            created_by=request.user,
            defaults={
                'version': 1,
                'metadata': request.data.get('metadata', {}),
                'analysis_data': {},
                'visibility': 'private'
            }
        )

        # Update session status
        session.status = 'analyzing'
        session.save()

        # Initialize analysis data
        analysis_data = {
            'status': 'in_progress',
            'timestamp': timezone.now().isoformat(),
            'parameters': request.data.get('parameters', {}),
        }
        
        reference.analysis_data = analysis_data
        reference.save()

        return Response({
            'status': 'analysis_started',
            'reference_id': reference.id,
            'analysis_data': analysis_data
        })

class MixingSessionGenreViewSet(UserSpecificViewSet):
    """
    ViewSet for the MixingSessionGenre model.
    """
    queryset = MixingSessionGenre.objects.all()
    serializer_class = MixingSessionGenreSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['session', 'genre']
    ordering_fields = ['weight']
    permission_classes = [permissions.IsAuthenticated]
    user_field = 'session__user'

class MixingSessionParamsViewSet(UserSpecificViewSet):
    """
    ViewSet for the MixingSessionParams model.
    """
    queryset = MixingSessionParams.objects.all()
    serializer_class = MixingSessionParamsSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['session']
    permission_classes = [permissions.IsAuthenticated]
    user_field = 'session__user'

class MixingOutputViewSet(UserSpecificViewSet):
    """
    ViewSet for the MixingOutput model.
    """
    queryset = MixingOutput.objects.all()
    serializer_class = MixingOutputSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['session']
    ordering_fields = ['created_at', 'finalization_timestamp']
    permission_classes = [permissions.IsAuthenticated]
    user_field = 'session__user'

class TrackReferenceViewSet(UserSpecificViewSet):
    """
    ViewSet for managing track references and versions
    """
    queryset = TrackReference.objects.all()
    serializer_class = TrackReferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    user_field = 'created_by'

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        reference = self.get_object()
        new_version = reference.version + 1
        new_reference = TrackReference.objects.create(
            session=reference.session,
            version=new_version,
            created_by=request.user,
            metadata=request.data.get('metadata', {}),
            visibility=reference.visibility
        )
        return Response(self.get_serializer(new_reference).data)

    @action(detail=True, methods=['get'])
    def analysis(self, request, pk=None):
        reference = self.get_object()
        return Response(reference.analysis_data)

    @action(detail=False, methods=['get'])
    def by_track(self, request):
        track_id = request.query_params.get('track_id')
        queryset = self.get_queryset().filter(session__id=track_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_module(self, request):
        module_type = request.query_params.get('module_type')
        module_id = request.query_params.get('module_id')
        queryset = self.get_queryset().filter(
            session__module_type=module_type,
            session__module_id=module_id
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def switch_version(self, request, pk=None):
        """
        Switch to a specific version of a track reference
        """
        reference = self.get_object()
        version_id = request.data.get('version_id')
        
        try:
            target_version = TrackReference.objects.get(
                session=reference.session,
                version=version_id,
                created_by=request.user
            )
            
            # Update current reference metadata
            reference.metadata = target_version.metadata
            reference.analysis_data = target_version.analysis_data
            reference.save()
            
            return Response(self.get_serializer(reference).data)
        except TrackReference.DoesNotExist:
            return Response(
                {'error': 'Version not found'},
                status=status.HTTP_404_NOT_FOUND
            )
