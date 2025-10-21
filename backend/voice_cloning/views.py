# views.py for voice_cloning
# This file contains the viewsets for the voice cloning module, providing API endpoints for managing voice cloning related data.

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import (
    Language,
    Emotion,
    VoiceCloningSettings,
    VoiceRecordingSession,
    VoiceSample,
    VoiceModel,
    VoiceModelVersion,
    VoiceModelPermission,
    VoiceModelConsentScope,
    VoiceModelUsageLog,
    VoiceModelAdaptiveEvent,
    VoiceModelShare,
    VoiceAnalysis,
)
from .serializers import (
    LanguageSerializer,
    EmotionSerializer,
    VoiceCloningSettingsSerializer,
    VoiceRecordingSessionSerializer,
    VoiceSampleSerializer,
    VoiceModelSerializer,
    VoiceModelVersionSerializer,
    VoiceModelPermissionSerializer,
    VoiceModelConsentScopeSerializer,
    VoiceModelUsageLogSerializer,
    VoiceModelAdaptiveEventSerializer,
    VoiceModelShareSerializer,
    VoiceAnalysisSerializer,
)
from .tasks import analyze_voice_model

class UserSpecificPermission(permissions.BasePermission):
    """
    Custom permission to ensure users can only access their own data.
    Staff users can access all data.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        # Check if object has direct user relationship
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        # Check for indirect user relationship through voice_model
        if hasattr(obj, 'voice_model'):
            return obj.voice_model.user == request.user
            
        # Check for indirect user relationship through session
        if hasattr(obj, 'session'):
            return obj.session.user == request.user
            
        return False

class BaseUserSpecificViewSet(viewsets.ModelViewSet):
    """
    Base viewset that implements user-specific access control.
    """
    permission_classes = [UserSpecificPermission]

    def get_queryset(self):
        """
        Filter queryset based on user access level and permissions.
        """
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_staff:
            return queryset

        # Direct user relationship
        if hasattr(self.queryset.model, 'user'):
            return queryset.filter(user=user)
        
        # Indirect relationship through voice_model
        if hasattr(self.queryset.model, 'voice_model'):
            return queryset.filter(voice_model__user=user)
            
        # Indirect relationship through session
        if hasattr(self.queryset.model, 'session'):
            return queryset.filter(session__user=user)

        return queryset.none()  # Return empty queryset if no relationship found

    def perform_create(self, serializer):
        """
        Automatically set the user when creating new objects.
        """
        if hasattr(serializer.Meta.model, 'user'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()


class LanguageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Language model.
    Read-only for regular users, full access for staff.
    """
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_fields = ['code', 'name']
    search_fields = ['code', 'name']


class EmotionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Emotion model.
    Read-only for regular users, full access for staff.
    """
    queryset = Emotion.objects.all()
    serializer_class = EmotionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_fields = ['label']
    search_fields = ['label']


class VoiceCloningSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the VoiceCloningSettings model.
    Staff-only access.
    """
    queryset = VoiceCloningSettings.objects.all()
    serializer_class = VoiceCloningSettingsSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_fields = ['setting_key']
    search_fields = ['setting_key', 'setting_value']


class VoiceRecordingSessionViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the VoiceRecordingSession model.
    User-specific access.
    """
    queryset = VoiceRecordingSession.objects.all()
    serializer_class = VoiceRecordingSessionSerializer
    filter_fields = ['session_name', 'instructions_shown', 'created_at', 'ended_at', 'language_code']
    search_fields = ['session_name', 'language_code']


class VoiceSampleViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the VoiceSample model.
    User-specific access through session ownership.
    """
    queryset = VoiceSample.objects.all()
    serializer_class = VoiceSampleSerializer
    filter_fields = ['session', 'created_at']
    search_fields = ['file_url', 'metadata']


class VoiceModelViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the VoiceModel model.
    User-specific access.
    """
    serializer_class = VoiceModelSerializer
    permission_classes = [UserSpecificPermission]

    def get_queryset(self):
        user = self.request.user
        # Get models owned by user or shared with user
        return VoiceModel.objects.filter(
            Q(user=user) | 
            Q(shares__user=user)
        ).distinct()

    @action(detail=True, methods=['get', 'patch'])
    def settings(self, request, pk=None):
        """
        Get or update voice model settings.
        """
        model = self.get_object()
        
        if request.method == 'GET':
            return Response({
                'id': model.id,
                'voice_id': model.id,
                'settings': model.settings,
                'capabilities': model.settings.get('capabilities', {
                    'languages': [],
                    'effects': [],
                    'features': {}
                }),
                'effects': model.settings.get('effects', {
                    'reverb': {'enabled': False, 'roomSize': 0.5},
                    'delay': {'enabled': False, 'time': 0.3, 'feedback': 0.3},
                    'filter': {'enabled': False, 'cutoff': 1000, 'resonance': 1},
                    'chorus': {'enabled': False, 'rate': 1.5, 'depth': 0.7},
                    'compressor': {'enabled': False, 'threshold': -24, 'ratio': 3},
                    'harmonizer': {'enabled': False, 'pitch': 0},
                    'distortion': {'enabled': False, 'amount': 0.5},
                    'modulation': {'enabled': False, 'type': 'tremolo', 'frequency': 4, 'depth': 0.5}
                }),
                'consent': model.settings.get('consent', {
                    'usage_approved': True,
                    'data_retention': True,
                    'last_updated': model.updated_at.isoformat()
                }),
                'configuration': model.settings.get('configuration', {})
            })
        
        if request.method == 'PATCH':
            settings_update = request.data
            if not model.settings:
                model.settings = {}
            
            # Update only the provided fields
            for key, value in settings_update.items():
                if key in ['capabilities', 'effects', 'consent', 'configuration']:
                    if key not in model.settings:
                        model.settings[key] = {}
                    if isinstance(value, dict):
                        model.settings[key].update(value)
                    else:
                        model.settings[key] = value
            
            model.save()
            return Response({
                'id': model.id,
                'voice_id': model.id,
                'settings': model.settings,
                'capabilities': model.settings.get('capabilities', {}),
                'effects': model.settings.get('effects', {}),
                'consent': model.settings.get('consent', {}),
                'configuration': model.settings.get('configuration', {})
            })

    @action(detail=True, methods=['patch'])
    def effects(self, request, pk=None):
        """
        Update voice model effects.
        """
        model = self.get_object()
        effects_update = request.data
        
        if not model.settings:
            model.settings = {}
        
        if 'effects' not in model.settings:
            model.settings['effects'] = {
                'reverb': {'enabled': False, 'roomSize': 0.5},
                'delay': {'enabled': False, 'time': 0.3, 'feedback': 0.3},
                'filter': {'enabled': False, 'cutoff': 1000, 'resonance': 1},
                'chorus': {'enabled': False, 'rate': 1.5, 'depth': 0.7},
                'compressor': {'enabled': False, 'threshold': -24, 'ratio': 3},
                'harmonizer': {'enabled': False, 'pitch': 0},
                'distortion': {'enabled': False, 'amount': 0.5},
                'modulation': {'enabled': False, 'type': 'tremolo', 'frequency': 4, 'depth': 0.5}
            }
            
        # Update only the provided effects
        for effect_name, effect_settings in effects_update.items():
            if effect_name not in model.settings['effects']:
                model.settings['effects'][effect_name] = {}
            
            if isinstance(effect_settings, dict):
                model.settings['effects'][effect_name].update(effect_settings)
            else:
                model.settings['effects'][effect_name] = effect_settings
        
        model.save()
        return Response({
            'id': model.id,
            'voice_id': model.id,
            'effects': model.settings.get('effects', {}),
            'capabilities': model.settings.get('capabilities', {}),
            'consent': model.settings.get('consent', {}),
            'configuration': model.settings.get('configuration', {})
        })

    @action(detail=True, methods=['post', 'delete'])
    def languages(self, request, pk=None, language_code=None):
        """
        Add or remove language capabilities.
        """
        model = self.get_object()
        
        if not model.settings:
            model.settings = {}
        
        if 'capabilities' not in model.settings:
            model.settings['capabilities'] = {'languages': [], 'effects': [], 'features': {}}
            
        if 'languages' not in model.settings['capabilities']:
            model.settings['capabilities']['languages'] = []
        
        if request.method == 'POST':
            # Add a language
            language_data = request.data
            
            # Check if language already exists
            existing_languages = [l.get('code') for l in model.settings['capabilities']['languages']]
            if language_data.get('code') in existing_languages:
                # Update existing language
                for i, lang in enumerate(model.settings['capabilities']['languages']):
                    if lang.get('code') == language_data.get('code'):
                        model.settings['capabilities']['languages'][i].update(language_data)
                        break
            else:
                # Add new language
                model.settings['capabilities']['languages'].append(language_data)
            
            model.save()
            return Response({
                'id': model.id,
                'voice_id': model.id,
                'capabilities': model.settings.get('capabilities', {}),
                'effects': model.settings.get('effects', {}),
                'consent': model.settings.get('consent', {}),
                'configuration': model.settings.get('configuration', {})
            })
        
        if request.method == 'DELETE' and language_code:
            # Remove a language
            model.settings['capabilities']['languages'] = [
                lang for lang in model.settings['capabilities']['languages'] 
                if lang.get('code') != language_code
            ]
            
            model.save()
            return Response({
                'id': model.id,
                'voice_id': model.id,
                'capabilities': model.settings.get('capabilities', {}),
                'effects': model.settings.get('effects', {}),
                'consent': model.settings.get('consent', {}),
                'configuration': model.settings.get('configuration', {})
            })
        
        return Response(status=400)

    @action(detail=True, methods=['patch'])
    def consent(self, request, pk=None):
        """
        Update consent settings.
        """
        model = self.get_object()
        consent_update = request.data
        
        if not model.settings:
            model.settings = {}
        
        if 'consent' not in model.settings:
            model.settings['consent'] = {
                'usage_approved': True,
                'data_retention': True,
                'last_updated': model.updated_at.isoformat()
            }
        
        # Update the consent settings
        model.settings['consent'].update(consent_update)
        # Update last_updated timestamp
        model.settings['consent']['last_updated'] = model.updated_at.isoformat()
        
        model.save()
        return Response({
            'id': model.id,
            'voice_id': model.id,
            'consent': model.settings.get('consent', {}),
            'capabilities': model.settings.get('capabilities', {}),
            'effects': model.settings.get('effects', {}),
            'configuration': model.settings.get('configuration', {})
        })

    @action(detail=True, methods=['delete'])
    def data(self, request, pk=None):
        """
        Delete user voice data.
        """
        model = self.get_object()
        
        # For now, we'll just mark the data as deleted without actually removing it
        # This would be replaced with actual data deletion logic in production
        if not model.settings:
            model.settings = {}
        
        if 'data_deletion' not in model.settings:
            model.settings['data_deletion'] = []
        
        model.settings['data_deletion'].append({
            'timestamp': model.updated_at.isoformat(),
            'requested_by': request.user.username,
            'status': 'completed'
        })
        
        model.save()
        return Response(status=204)

    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        model = self.get_object()
        model.version += 1
        model.save()
        
        version = VoiceModelVersion.objects.create(
            model=model,
            version_number=model.version,
            changes=request.data.get('changes', '')
        )
        
        return Response(VoiceModelVersionSerializer(version).data)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        model = self.get_object()
        serializer = VoiceModelShareSerializer(data=request.data)
        
        if serializer.is_valid():
            user = get_object_or_404(User, email=serializer.validated_data['user_email'])
            share = VoiceModelShare.objects.create(
                model=model,
                user=user,
                permission=serializer.validated_data['permission']
            )
            return Response(VoiceModelShareSerializer(share).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def export(self, request, pk=None):
        model = self.get_object()
        model_data = model.get_model_data()
        
        response = HttpResponse(model_data, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{model.name}_v{model.version}.model"'
        return response

    @action(detail=True, methods=['post'])
    def import_model(self, request, pk=None):
        model = self.get_object()
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            model_data = request.FILES['file'].read()
            model.model_data = model_data
            model.version += 1
            model.save()
            
            VoiceModelVersion.objects.create(
                model=model,
                version_number=model.version,
                changes='Imported model data'
            )
            
            return Response(VoiceModelSerializer(model).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def events(self, request, pk=None):
        """
        Get or create adaptive events for a voice model.
        """
        model = self.get_object()
        
        if request.method == 'GET':
            events = VoiceModelAdaptiveEvent.objects.filter(voice_model=model).order_by('-created_at')
            page = self.paginate_queryset(events)
            if page is not None:
                serializer = VoiceModelAdaptiveEventSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = VoiceModelAdaptiveEventSerializer(events, many=True)
            return Response(serializer.data)
        
        if request.method == 'POST':
            # Create a new event
            serializer = VoiceModelAdaptiveEventSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(voice_model=model)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VoiceModelVersionViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the VoiceModelVersion model.
    User-specific access through voice model ownership.
    """
    queryset = VoiceModelVersion.objects.all()
    serializer_class = VoiceModelVersionSerializer
    filter_fields = ['version_label', 'created_at']
    search_fields = ['version_label', 'changes_notes']


class VoiceModelPermissionViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the VoiceModelPermission model.
    User-specific access.
    """
    queryset = VoiceModelPermission.objects.all()
    serializer_class = VoiceModelPermissionSerializer
    filter_fields = ['consent_granted_at', 'consent_revoked_at']
    search_fields = ['usage_scope']


class VoiceModelConsentScopeViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the VoiceModelConsentScope model.
    User-specific access through voice model ownership.
    """
    queryset = VoiceModelConsentScope.objects.all()
    serializer_class = VoiceModelConsentScopeSerializer
    filter_fields = ['created_at']
    search_fields = ['scope_data']


class VoiceModelUsageLogViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the VoiceModelUsageLog model.
    User-specific access through voice model ownership.
    """
    queryset = VoiceModelUsageLog.objects.all()
    serializer_class = VoiceModelUsageLogSerializer
    filter_fields = ['created_at']
    search_fields = ['used_in_context', 'details']


class VoiceModelAdaptiveEventViewSet(BaseUserSpecificViewSet):
    """
    ViewSet for the VoiceModelAdaptiveEvent model.
    User-specific access through voice model ownership.
    """
    queryset = VoiceModelAdaptiveEvent.objects.all()
    serializer_class = VoiceModelAdaptiveEventSerializer
    filter_fields = ['event_type', 'triggered_by', 'created_at']
    search_fields = ['event_type', 'event_details', 'triggered_by']


class VoiceAnalysisViewSet(BaseUserSpecificViewSet):
    queryset = VoiceAnalysis.objects.all()
    serializer_class = VoiceAnalysisSerializer

    @action(detail=True, methods=['GET'])
    def status(self, request, pk=None):
        analysis = self.get_object()
        serializer = self.get_serializer(analysis)
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def progress(self, request, pk=None):
        """
        Get the progress of a voice analysis.
        """
        analysis = self.get_object()
        return Response({
            'id': analysis.id,
            'status': analysis.status,
            'progress_percentage': analysis.progress_percentage,
            'current_step': analysis.current_step,
            'estimated_time_remaining': analysis.estimated_time_remaining,
        })
    
    @action(detail=True, methods=['GET'])
    def results(self, request, pk=None):
        """
        Get the results of a completed voice analysis.
        """
        analysis = self.get_object()
        if analysis.status != 'completed':
            return Response({
                'error': 'Analysis not completed',
                'status': analysis.status
            }, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            'id': analysis.id,
            'results': analysis.results or {},
            'status': analysis.status,
            'completed_at': analysis.updated_at.isoformat()
        })

    @action(detail=False, methods=['POST'])
    def start_analysis(self, request):
        voice_model_id = request.data.get('voice_model_id')
        if not voice_model_id:
            return Response(
                {'error': 'voice_model_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        voice_model = get_object_or_404(VoiceModel, id=voice_model_id)
        
        # Create new analysis
        analysis = VoiceAnalysis.objects.create(
            user=request.user,
            voice_model=voice_model,
            status='pending'
        )

        # Trigger async analysis task
        analyze_voice_model.delay(analysis.id)

        serializer = self.get_serializer(analysis)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
