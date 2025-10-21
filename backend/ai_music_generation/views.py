# views.py for ai_music_generation
# This file contains the viewsets for the ai_music_generation app,
# providing API endpoints for managing LLM providers, AI music requests,
# request parameters, generated tracks, and model usage logs.
# It includes tenant-aware logic, filtering, searching, and pagination.

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as django_filters
from .models import LLMProvider, AIMusicRequest, AIMusicParams, GeneratedTrack, ModelUsageLog, SavedComposition, CompositionVersion, Genre, Region, UserFeedback, UserPreference, MusicTradition, CrossCulturalBlend, MultilingualLyrics, TrackLayer, ArrangementSection, TrackAutomation, VocalLine, HarmonyGroup, HarmonyVoicing, MasteringPreset, MasteringSession, CreativeChallenge, ChallengeSubmission, ContentModeration
from .services.ab_testing import ABTest, ABTestAssignment, ABTestingService
from .services.reinforcement_learning import ReinforcementLearningService
from .services.tweak_processor import TweakProcessor
from .serializers import LLMProviderSerializer, AIMusicRequestSerializer, AIMusicParamsSerializer, GeneratedTrackSerializer, ModelUsageLogSerializer, SavedCompositionSerializer, CompositionVersionSerializer, GenreSerializer, RegionSerializer, UserFeedbackSerializer, UserPreferenceSerializer, ABTestSerializer, MusicTraditionSerializer, CrossCulturalBlendSerializer, TraditionBlendWeightSerializer, MultilingualLyricsSerializer, TrackLayerSerializer, ArrangementSectionSerializer, TrackAutomationSerializer, VocalLineSerializer, HarmonyGroupSerializer, HarmonyVoicingSerializer, MasteringPresetSerializer, MasteringSessionSerializer, CreativeChallengeSerializer, ChallengeSubmissionSerializer, ContentModerationSerializer
from django.utils.translation import gettext_lazy as _
import logging
from django.http import FileResponse
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.exceptions import PermissionDenied, Throttled
import os
import mimetypes
from .throttling import MusicGenerationRateThrottle, LLMRequestRateThrottle, BurstRateThrottle, check_user_quota, increment_user_usage
from .caching import PromptCache
from .monitoring import MusicGenerationMonitor
from django.core import validators
from django.core.exceptions import ValidationError
from .services.cross_cultural import CrossCulturalService
from django.utils import timezone
from celery import shared_task
from django.contrib.contenttypes.models import ContentType
from .services.content_moderation import ContentSafetyService, CopyrightService, QualityAssessmentService
from .utils.audio import load_audio_data, save_audio_data, extract_audio_features
# Import router viewsets
from .router_views import ModelCapabilityViewSet, ModelRouterViewSet, ModelRouterAssignmentViewSet

logger = logging.getLogger(__name__)

# Initialize services
content_safety_service = ContentSafetyService()
copyright_service = CopyrightService()
quality_service = QualityAssessmentService()


def check_copyright_infringement(composition):
    """Check composition for copyright infringement."""
    try:
        # Load audio data
        audio_data, sample_rate = load_audio_data(composition.audio_file.path)
        return copyright_service.check_copyright(audio_data, sample_rate)
    except Exception as e:
        logger.error(f"Copyright check failed: {str(e)}")
        return {
            'error': str(e),
            'needs_review': True,
            'confidence': 0.0
        }


def check_content_safety(composition):
    """Check composition for content safety."""
    try:
        # Load audio data
        audio_data, sample_rate = load_audio_data(composition.audio_file.path)
        return content_safety_service.check_content_safety(audio_data, sample_rate)
    except Exception as e:
        logger.error(f"Content safety check failed: {str(e)}")
        return {
            'error': str(e),
            'needs_review': True,
            'confidence': 0.0
        }


def assess_quality(composition):
    """Assess composition quality."""
    try:
        # Load audio data
        audio_data, sample_rate = load_audio_data(composition.audio_file.path)
        return quality_service.assess_quality(audio_data, sample_rate)
    except Exception as e:
        logger.error(f"Quality assessment failed: {str(e)}")
        return {
            'error': str(e),
            'needs_review': True,
            'confidence': 0.0
        }


def check_originality(composition):
    """Check composition originality."""
    try:
        # Combine copyright and quality checks for originality assessment
        copyright_results = check_copyright_infringement(composition)
        quality_results = assess_quality(composition)
        
        originality_score = (
            (1 - copyright_results.get('highest_similarity', 0)) * 0.7 +
            quality_results.get('quality_score', 0) * 0.3
        )
        
        return {
            'originality_score': originality_score,
            'copyright_check': copyright_results,
            'quality_assessment': quality_results,
            'needs_review': originality_score < 0.6,
            'confidence': min(
                copyright_results.get('confidence', 0),
                quality_results.get('confidence', 0)
            )
        }
    except Exception as e:
        logger.error(f"Originality check failed: {str(e)}")
        return {
            'error': str(e),
            'needs_review': True,
            'confidence': 0.0
        }


class BaseTenantAwareViewSet(viewsets.ModelViewSet):
    """
    Base viewset that extends ModelViewSet.
    No tenant functionality needed as project uses row-level security.
    """
    pass


class LLMProviderViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the LLMProvider model.
    Provides API endpoints for managing LLM providers.
    """
    queryset = LLMProvider.objects.all()
    serializer_class = LLMProviderSerializer
    throttle_classes = [LLMRequestRateThrottle]
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'provider_type']
    ordering_fields = ['name', 'created_at']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates an LLM provider.
        """
        provider = self.get_object()
        provider.active = True
        provider.save()
        logger.info(f"LLM Provider {provider.name} activated by user {request.user}")
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates an LLM provider.
        """
        provider = self.get_object()
        provider.active = False
        provider.save()
        logger.info(f"LLM Provider {provider.name} deactivated by user {request.user}")
        return Response({'status': 'deactivated'})


class AIMusicRequestViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the AIMusicRequest model.
    Provides API endpoints for managing AI music requests.
    """
    queryset = AIMusicRequest.objects.all()
    serializer_class = AIMusicRequestSerializer
    throttle_classes = [MusicGenerationRateThrottle, BurstRateThrottle]
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'user']
    search_fields = ['prompt_text']
    ordering_fields = ['created_at', 'status']

    def create(self, request, *args, **kwargs):
        """
        Create a new AI music request with multi-model orchestration.
        """
        try:
            # Log initial request for debugging
            logger.info(f"Received music generation request: {request.data}")
            
            # Check user quota
            can_proceed, message = check_user_quota(request.user)
            if not can_proceed:
                raise Throttled(detail=message)

            # Prepare data for serializer
            data = request.data.copy()
            
            # Ensure the user is set correctly
            # If user_id is passed in the request, use it to find the user
            if 'user_id' in data and not data.get('user'):
                from django.contrib.auth import get_user_model
                User = get_user_model()
                try:
                    user = User.objects.get(id=data['user_id'])
                    data['user'] = user.id
                except User.DoesNotExist:
                    return Response(
                        {'error': f"User with ID {data['user_id']} not found"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # Use the authenticated user
                data['user'] = request.user.id

            # Handle provider selection
            if 'provider_id' in data:
                # Special case: if provider_id is 'default', use the first active provider
                if data['provider_id'] == 'default':
                    try:
                        provider = LLMProvider.objects.filter(active=True).first()
                        if provider:
                            # Explicitly set provider_id to ensure it's used by the serializer
                            data['provider_id'] = provider.id
                        else:
                            return Response(
                                {'error': "No active LLM providers found"},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    except Exception as e:
                        logger.error(f"Error finding default provider: {str(e)}")
                        return Response(
                            {'error': "Provider error: " + str(e)},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                # Regular case: try to find the provider by ID
                else:
                    try:
                        # Try to convert provider_id to a number
                        provider_id = int(data['provider_id'])
                        try:
                            provider = LLMProvider.objects.get(id=provider_id)
                            # Keep the original provider_id field
                            data['provider_id'] = provider.id
                        except LLMProvider.DoesNotExist:
                            # Use default provider if specified provider doesn't exist
                            try:
                                provider = LLMProvider.objects.filter(active=True).first()
                                if provider:
                                    data['provider_id'] = provider.id
                                else:
                                    return Response(
                                        {'error': "No active LLM providers found"},
                                        status=status.HTTP_400_BAD_REQUEST
                                    )
                            except Exception as e:
                                logger.error(f"Error finding default provider: {str(e)}")
                                return Response(
                                    {'error': "Provider error: " + str(e)},
                                    status=status.HTTP_400_BAD_REQUEST
                                )
                    except (ValueError, TypeError):
                        # If provider_id cannot be converted to a number, return an error
                        return Response(
                            {'error': f"Invalid provider_id format: {data['provider_id']}. Expected a number or 'default'"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            else:
                # Use first active provider as default
                try:
                    provider = LLMProvider.objects.filter(active=True).first()
                    if provider:
                        data['provider_id'] = provider.id
                    else:
                        return Response(
                            {'error': "No active LLM providers found"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except Exception as e:
                    logger.error(f"Error finding default provider: {str(e)}")
                    return Response(
                        {'error': "Provider error: " + str(e)},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Ensure prompt_text field exists
            if 'prompt' in data and not data.get('prompt_text'):
                data['prompt_text'] = data['prompt']
            
            # Get user preferences through RL service
            rl_service = ReinforcementLearningService(request.user.id)
            generation_params = rl_service.get_generation_parameters()

            # Get A/B test variant if applicable
            ab_service = ABTestingService()
            variant = ab_service.get_variant(request.user.id, 'music_generation_v1')
            
            if variant:
                # Apply variant-specific parameters
                generation_params = ab_service.apply_variant_config(
                    variant,
                    generation_params
                )
                # Record impression
                ab_service.record_impression('music_generation_v1', variant)

            # Add parameters to request
            data['parameters'] = generation_params

            # Create request
            serializer = self.get_serializer(data=data)
            if not serializer.is_valid():
                logger.error(f"Validation error creating music request: {serializer.errors}")
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            self.perform_create(serializer)

            # Initialize model router
            from .router_service import ModelRoutingService
            routing_service = ModelRoutingService(serializer.instance.id)
            router = routing_service.initialize_router()

            # Analyze prompt and break down into tasks
            task_breakdown = routing_service.analyze_prompt()

            # Select providers for each task
            provider_assignments = routing_service.select_providers()

            # Start task execution (non-blocking)
            from django.core.cache import cache
            cache_key = f"music_request_{serializer.instance.id}_status"
            cache.set(cache_key, {
                'status': 'processing',
                'task_breakdown': task_breakdown,
                'provider_assignments': provider_assignments
            })

            # Execute tasks asynchronously
            from django.core.signals import request_finished
            def execute_tasks_async(sender, **kwargs):
                try:
                    results = routing_service.execute_tasks()
                    
                    # Check if the results contain an error or status field indicating failure
                    if results.get('error') or results.get('status') == 'failed':
                        # There was an error in task execution
                        error_message = results.get('error', 'Unknown error during music generation')
                        logger.error(f"Error during task execution: {error_message}")
                        
                        # Update the request status to failed
                        serializer.instance.status = 'failed'
                        serializer.instance.save()
                        
                        # Set cache with failed status and error message
                        cache.set(cache_key, {
                            'status': 'failed',
                            'error': error_message,
                            'results': results
                        })
                    else:
                        # Tasks completed successfully
                        cache.set(cache_key, {
                            'status': 'completed',
                            'results': results
                        })
                        
                        # Update the request status to completed
                        serializer.instance.status = 'completed'
                        serializer.instance.save()
                except Exception as e:
                    logger.error(f"Error executing tasks: {str(e)}")
                    cache.set(cache_key, {
                        'status': 'failed',
                        'error': str(e)
                    })
                    
                    # Update the request status to failed
                    serializer.instance.status = 'failed'
                    serializer.instance.save()

            request_finished.connect(execute_tasks_async)

            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except Exception as e:
            logger.error(f"Error creating music request: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def generation_status(self, request, pk=None):
        """
        Get the current status of the music generation process.
        """
        music_request = self.get_object()
        
        # Check cache for status
        from django.core.cache import cache
        cache_key = f"music_request_{music_request.id}_status"
        status_data = cache.get(cache_key)

        if not status_data:
            # If not in cache, get status from router service
            try:
                routing_service = ModelRoutingService(music_request.id)
                status_data = routing_service.get_execution_status()
            except Exception as e:
                logger.error(f"Error getting generation status: {str(e)}")
                status_data = {'status': 'unknown', 'error': str(e)}
                
        # If the database status is 'failed' but the cache doesn't reflect that,
        # update the response to show the failure
        if music_request.status == 'failed' and status_data.get('status') != 'failed':
            status_data['status'] = 'failed'
            if not status_data.get('error'):
                status_data['error'] = 'Music generation failed'

        return Response(status_data)

    @action(detail=True, methods=['post'])
    def retry_failed_tasks(self, request, pk=None):
        """
        Retry any failed tasks in the generation process.
        """
        music_request = self.get_object()
        
        try:
            routing_service = ModelRoutingService(music_request.id)
            status = routing_service.get_execution_status()
            
            if status['failed'] > 0:
                # Reset failed tasks and retry
                failed_tasks = [task for task in status['task_details'] if task['status'] == 'failed']
                for task in failed_tasks:
                    assignment = music_request.router.assignments.get(
                        task_type=task['task_type'],
                        status='failed'
                    )
                    assignment.status = 'pending'
                    assignment.error = None
                    assignment.save()
                
                # Execute tasks again
                results = routing_service.execute_tasks()
                return Response({
                    'status': 'retrying',
                    'failed_tasks': failed_tasks,
                    'results': results
                })
            else:
                return Response({
                    'status': 'no_failed_tasks',
                    'message': 'No failed tasks to retry'
                })

        except Exception as e:
            logger.error(f"Error retrying failed tasks: {str(e)}")
            return Response({
                'status': 'error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        """Regenerate music with tweaked parameters."""
        music_request = self.get_object()
        
        # Get latest feedback for this request
        latest_feedback = UserFeedback.objects.filter(
            generated_track__request=music_request
        ).order_by('-created_at').first()
        
        if latest_feedback and latest_feedback.context:
            # Apply tweaks to parameters
            new_params = music_request.parameters.copy()
            new_params.update(latest_feedback.context)
            
            # Create new request with tweaked parameters
            new_request = AIMusicRequest.objects.create(
                user=request.user,
                prompt_text=music_request.prompt_text,
                parameters=new_params
            )
            
            return Response(
                self.get_serializer(new_request).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {'error': 'No feedback found to apply'},
            status=status.HTTP_400_BAD_REQUEST
        )


class AIMusicParamsViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the AIMusicParams model.
    Provides API endpoints for managing AI music parameters.
    """
    queryset = AIMusicParams.objects.all()
    serializer_class = AIMusicParamsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['created_at']


class GeneratedTrackViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the GeneratedTrack model.
    Provides API endpoints for managing generated music tracks.
    """
    queryset = GeneratedTrack.objects.all()
    serializer_class = GeneratedTrackSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['created_at', 'finalization_timestamp']


class ModelUsageLogViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for the ModelUsageLog model.
    Provides API endpoints for managing model usage logs.
    """
    queryset = ModelUsageLog.objects.all()
    serializer_class = ModelUsageLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['created_at']

    @action(detail=False, methods=['get'])
    def user_statistics(self, request):
        """
        Get usage statistics for the current user.
        """
        stats = MusicGenerationMonitor.get_usage_statistics(request.user.id)
        return Response(stats)


class CompositionViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing saved compositions.
    Provides endpoints for CRUD operations on compositions.
    """
    serializer_class = SavedCompositionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'title']

    def get_queryset(self):
        """
        Filter queryset to return only user's compositions and public ones.
        """
        user = self.request.user
        return SavedComposition.objects.filter(
            models.Q(user=user) | models.Q(is_public=True)
        )

    def perform_create(self, serializer):
        """
        Set the user when creating a new composition.
        """
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def save_current(self, request, pk=None):
        """
        Save the current state of a generated track as a new composition.
        """
        try:
            track_id = request.data.get('track_id')
            if not track_id:
                return Response(
                    {'error': 'track_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Convert track_id to integer if it's coming as string
            if isinstance(track_id, str):
                track_id = int(track_id)

            track = GeneratedTrack.objects.get(id=track_id)
            
            # Ensure user has access to the track
            if track.request.user != request.user:
                raise PermissionDenied(_("You don't have permission to save this track"))

            # Create composition
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            composition = serializer.save(user=request.user)
            
            # Create first version
            version = CompositionVersion.objects.create(
                composition=composition,
                version_number=1,
                generated_track=track,
                parameters=track.request.ai_music_params.first(),
                version_notes=request.data.get('version_notes', '')
            )

            return Response(
                CompositionVersionSerializer(version, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )

        except GeneratedTrack.DoesNotExist:
            return Response(
                {'error': _('Track not found')}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error saving composition: {str(e)}")
            return Response(
                {'error': _('Failed to save composition')}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CompositionVersionViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing composition versions.
    Includes endpoints for creating new versions and downloading files.
    """
    serializer_class = CompositionVersionSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['composition']
    ordering_fields = ['version_number', 'created_at']

    def get_queryset(self):
        """
        Filter versions based on composition access.
        """
        user = self.request.user
        if user.is_authenticated:
            return CompositionVersion.objects.filter(
                models.Q(composition__user=user) | models.Q(composition__is_public=True)
            )
        return CompositionVersion.objects.filter(composition__is_public=True)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download a specific file format of the version.
        """
        version = self.get_object()
        format_type = request.query_params.get('format', 'mp3')

        # Check if user has access
        if not version.composition.is_public and version.composition.user != request.user:
            raise PermissionDenied("You don't have permission to download this file")

        # Get the appropriate file based on format
        file_map = {
            'wav': version.wav_file,
            'mp3': version.mp3_file,
            'midi': version.midi_file
        }

        file_field = file_map.get(format_type)
        if not file_field:
            return Response({'error': f'No {format_type} file available'}, status=404)

        try:
            file_path = file_field.path
            content_type, _ = mimetypes.guess_type(file_path)
            
            response = FileResponse(
                open(file_path, 'rb'),
                content_type=content_type,
                as_attachment=True,
                filename=os.path.basename(file_path)
            )
            return response

        except Exception as e:
            logger.error(f"Error downloading file: {str(e)}")
            return Response({'error': 'Failed to download file'}, status=500)

    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """
        Create a new version from the current state.
        """
        try:
            current_version = self.get_object()
            composition = current_version.composition

            # Ensure user has permission
            if composition.user != request.user:
                raise PermissionDenied("You don't have permission to create new versions")

            # Get the next version number
            next_version_number = composition.versions.count() + 1

            # Create new version
            new_version = CompositionVersion.objects.create(
                composition=composition,
                version_number=next_version_number,
                generated_track=current_version.generated_track,
                parameters=current_version.parameters,
                version_notes=request.data.get('version_notes', '')
            )

            # Copy audio files
            self._copy_audio_files(current_version, new_version)

            return Response(
                CompositionVersionSerializer(new_version, context={'request': request}).data,
                status=201
            )

        except Exception as e:
            logger.error(f"Error creating version: {str(e)}")
            return Response({'error': 'Failed to create version'}, status=500)

    def _copy_audio_files(self, source_version, target_version):
        """
        Copy audio files from one version to another.
        """
        # Implementation would depend on your file storage setup
        # This is a placeholder for the actual implementation
        pass


class GenreViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for music genres.
    Provides endpoints for listing and retrieving genres.
    """
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        """
        Return all genres, optionally filtered by search query.
        """
        queryset = Genre.objects.all()
        search_query = self.request.query_params.get('q', None)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        return queryset


class RegionViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for geographical regions.
    Provides endpoints for listing and retrieving regions.
    """
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        """
        Return all regions, optionally filtered by search query.
        """
        queryset = Region.objects.all()
        search_query = self.request.query_params.get('q', None)
        if search_query:
            queryset = queryset.filter(
                models.Q(name__icontains=search_query) |
                models.Q(code__icontains=search_query)
            )
        return queryset


class FeedbackViewSet(viewsets.ModelViewSet):
    """ViewSet for handling user feedback and reinforcement learning."""
    serializer_class = UserFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserFeedback.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Save feedback
        feedback = serializer.save(user=self.request.user)
        
        # Process feedback through RL system
        rl_service = ReinforcementLearningService(self.request.user.id)
        rl_service.process_feedback(feedback)
        
        # If it's a tweak request, process it
        if feedback.feedback_type == 'tweak':
            tweak_processor = TweakProcessor()
            modifications = tweak_processor.process_tweak(feedback.feedback_text)
            
            # Store processed modifications
            feedback.context = modifications
            feedback.save()
        
        # Record A/B test conversion if applicable
        ab_service = ABTestingService()
        test_assignment = ABTestAssignment.objects.filter(
            user=self.request.user,
            test__is_active=True
        ).first()
        
        if test_assignment:
            ab_service.record_conversion(
                test_assignment.test.name,
                test_assignment.variant,
                feedback
            )

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get user's feedback history."""
        feedback = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(feedback, many=True)
        return Response(serializer.data)


class UserPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user preferences."""
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current user's preferences."""
        preference = UserPreference.objects.get_or_create(user=request.user)[0]
        serializer = self.get_serializer(preference)
        return Response(serializer.data)


class ABTestViewSet(viewsets.ModelViewSet):
    """ViewSet for managing A/B tests."""
    queryset = ABTest.objects.all()
    serializer_class = ABTestSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get current results for an A/B test."""
        test = self.get_object()
        ab_service = ABTestingService()
        results = ab_service.get_test_results(test.name)
        return Response(results)
    
    @action(detail=True, methods=['post'])
    def end_test(self, request, pk=None):
        """End an active A/B test."""
        test = self.get_object()
        if not test.is_active:
            return Response(
                {'error': 'Test is already inactive'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        test.is_active = False
        test.end_date = timezone.now()
        test.save()
        
        return Response(self.get_serializer(test).data)


class MusicTraditionViewSet(viewsets.ModelViewSet):
    """ViewSet for music traditions."""
    queryset = MusicTradition.objects.all()
    serializer_class = MusicTraditionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ['region', 'name']

    @action(detail=True, methods=['get'])
    def parameters(self, request, pk=None):
        """Get generation parameters for a tradition."""
        tradition = self.get_object()
        section_type = request.query_params.get('section_type', 'full')
        
        service = CrossCulturalService()
        params = service.get_tradition_parameters(tradition, section_type)
        
        return Response(params)


class CrossCulturalBlendViewSet(viewsets.ModelViewSet):
    """ViewSet for cross-cultural blends."""
    queryset = CrossCulturalBlend.objects.all()
    serializer_class = CrossCulturalBlendSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def add_tradition(self, request, pk=None):
        """Add a tradition to the blend."""
        blend = self.get_object()
        serializer = TraditionBlendWeightSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(blend=blend)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def generate_parameters(self, request, pk=None):
        """Generate blended parameters."""
        blend = self.get_object()
        section_type = request.query_params.get('section_type', 'full')
        
        service = CrossCulturalService()
        params = service.blend_traditions(blend, section_type)
        
        return Response(params)


class MultilingualLyricsViewSet(viewsets.ModelViewSet):
    """ViewSet for multilingual lyrics."""
    serializer_class = MultilingualLyricsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MultilingualLyrics.objects.filter(
            track__request__user=self.request.user
        )
    
    def perform_create(self, serializer):
        service = CrossCulturalService()
        lyrics = service.generate_multilingual_lyrics(
            track=serializer.validated_data['track'],
            primary_language=serializer.validated_data['primary_language'],
            target_languages=serializer.validated_data['translation_languages'],
            original_lyrics=serializer.validated_data.get('original_lyrics')
        )
        return lyrics

    @action(detail=True, methods=['post'])
    def regenerate_translations(self, request, pk=None):
        """Regenerate translations for existing lyrics."""
        lyrics = self.get_object()
        service = CrossCulturalService()
        
        updated_lyrics = service.generate_multilingual_lyrics(
            track=lyrics.track,
            primary_language=lyrics.primary_language,
            target_languages=lyrics.translation_languages,
            original_lyrics=lyrics.original_lyrics
        )
        
        serializer = self.get_serializer(updated_lyrics)
        return Response(serializer.data)


class TrackLayerViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing track layers in a composition.
    """
    queryset = TrackLayer.objects.all()
    serializer_class = TrackLayerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter track layers by composition."""
        queryset = super().get_queryset()
        composition_id = self.request.query_params.get('composition', None)
        if composition_id:
            queryset = queryset.filter(composition_id=composition_id)
        return queryset


class ArrangementSectionViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing arrangement sections.
    """
    queryset = ArrangementSection.objects.all()
    serializer_class = ArrangementSectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter sections by composition and optionally parent section."""
        queryset = super().get_queryset()
        composition_id = self.request.query_params.get('composition', None)
        parent_id = self.request.query_params.get('parent', None)

        if composition_id:
            queryset = queryset.filter(composition_id=composition_id)
        if parent_id:
            queryset = queryset.filter(parent_section_id=parent_id)
        else:
            # If no parent specified, return top-level sections
            queryset = queryset.filter(parent_section__isnull=True)

        return queryset


class TrackAutomationViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing track parameter automation.
    """
    queryset = TrackAutomation.objects.all()
    serializer_class = TrackAutomationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter automation data by track."""
        queryset = super().get_queryset()
        track_id = self.request.query_params.get('track', None)
        if track_id:
            queryset = queryset.filter(track_id=track_id)
        return queryset


class VocalLineViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing vocal lines in compositions.
    """
    queryset = VocalLine.objects.all()
    serializer_class = VocalLineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter vocal lines by composition."""
        queryset = super().get_queryset()
        composition_id = self.request.query_params.get('composition', None)
        voice_type = self.request.query_params.get('voice_type', None)

        if composition_id:
            queryset = queryset.filter(composition_id=composition_id)
        if voice_type:
            queryset = queryset.filter(voice_type=voice_type)
        return queryset

    @action(detail=True, methods=['post'])
    def generate_melody(self, request, pk=None):
        """Generate a melodic line matching the chord progression."""
        vocal_line = self.get_object()
        
        # Get the chord progression from the composition
        section = vocal_line.composition.arrangement_sections.first()
        if not section:
            return Response(
                {"error": "No arrangement section found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate melody using AI service
        try:
            melody_data = generate_vocal_melody(
                chord_progression=section.chord_progression,
                voice_type=vocal_line.voice_type,
                vocal_range=vocal_line.vocal_range
            )
            
            vocal_line.melody_data = melody_data
            vocal_line.save()
            
            return Response(
                VocalLineSerializer(vocal_line).data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HarmonyGroupViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing harmony groups.
    """
    queryset = HarmonyGroup.objects.all()
    serializer_class = HarmonyGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter harmony groups by composition."""
        queryset = super().get_queryset()
        composition_id = self.request.query_params.get('composition', None)
        if composition_id:
            queryset = queryset.filter(composition_id=composition_id)
        return queryset

    @action(detail=True, methods=['post'])
    def generate_harmonies(self, request, pk=None):
        """Generate harmony parts for the group."""
        harmony_group = self.get_object()
        voicing_type = request.data.get('voicing_type', harmony_group.voicing_type)
        
        try:
            # Generate harmony voicings
            harmony_data = generate_harmony_voicings(
                chord_progression=harmony_group.chord_progression,
                voicing_type=voicing_type,
                existing_vocal_lines=harmony_group.vocal_lines.all()
            )
            
            # Create or update vocal lines for each harmony part
            for voice_data in harmony_data:
                vocal_line, _ = VocalLine.objects.get_or_create(
                    composition=harmony_group.composition,
                    voice_type=voice_data['voice_type'],
                    defaults={
                        'is_harmony': True,
                        'harmony_role': voice_data['harmony_role'],
                        'melody_data': voice_data['melody_data']
                    }
                )
                
                HarmonyVoicing.objects.get_or_create(
                    harmony_group=harmony_group,
                    vocal_line=vocal_line,
                    defaults={
                        'voice_order': voice_data['voice_order'],
                        'transposition': voice_data['transposition']
                    }
                )
            
            return Response(
                HarmonyGroupSerializer(harmony_group).data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HarmonyVoicingViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing harmony voicings.
    """
    queryset = HarmonyVoicing.objects.all()
    serializer_class = HarmonyVoicingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter voicings by harmony group."""
        queryset = super().get_queryset()
        group_id = self.request.query_params.get('harmony_group', None)
        if group_id:
            queryset = queryset.filter(harmony_group_id=group_id)
        return queryset.order_by('voice_order')


class MasteringPresetViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing mastering presets.
    """
    queryset = MasteringPreset.objects.all()
    serializer_class = MasteringPresetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ['preset_type']


class MasteringSessionViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing mastering sessions.
    """
    queryset = MasteringSession.objects.all()
    serializer_class = MasteringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ['composition_version', 'processing_status']

    @action(detail=True, methods=['post'])
    def start_mastering(self, request, pk=None):
        """
        Start the mastering process for a session.
        """
        session = self.get_object()
        
        if session.processing_status != 'pending':
            return Response(
                {"error": "Session is already being processed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Start async mastering process
            session.processing_status = 'analyzing'
            session.save()
            
            # Queue the mastering task
            process_mastering_session.delay(session.id)
            
            return Response(
                MasteringSessionSerializer(session).data,
                status=status.HTTP_202_ACCEPTED
            )
        except Exception as e:
            session.processing_status = 'failed'
            session.processing_log.append({
                'timestamp': timezone.now().isoformat(),
                'error': str(e)
            })
            session.save()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def match_reference(self, request, pk=None):
        """
        Analyze and match a reference track.
        """
        session = self.get_object()
        
        if not session.reference_track:
            return Response(
                {"error": "No reference track provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Start async reference analysis
            analyze_reference_track.delay(session.id)
            
            return Response(
                {"status": "Reference analysis started"},
                status=status.HTTP_202_ACCEPTED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@shared_task
def process_mastering_session(session_id):
    # Implement mastering process here
    pass


@shared_task
def analyze_reference_track(session_id):
    # Implement reference analysis here
    pass


class CreativeChallengeViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing creative challenges.
    """
    queryset = CreativeChallenge.objects.all()
    serializer_class = CreativeChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ['challenge_type', 'status']

    def get_queryset(self):
        """Filter challenges and annotate with submission count."""
        return super().get_queryset().annotate(
            total_submissions=models.Count('submissions')
        )

    @action(detail=True, methods=['post'])
    def start_challenge(self, request, pk=None):
        """Activate a challenge."""
        challenge = self.get_object()
        if challenge.status != 'draft':
            return Response(
                {"error": "Challenge can only be started from draft status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        challenge.status = 'active'
        challenge.save()
        return Response(
            CreativeChallengeSerializer(challenge).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def complete_challenge(self, request, pk=None):
        """Complete a challenge and award badges."""
        challenge = self.get_object()
        if challenge.status != 'active':
            return Response(
                {"error": "Only active challenges can be completed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Award badges to top submissions
            top_submissions = challenge.submissions.filter(
                moderation_status='approved'
            ).order_by('-community_rating')[:3]

            for idx, submission in enumerate(top_submissions):
                badge_name = f"{challenge.reward_badge}_{'gold' if idx == 0 else 'silver' if idx == 1 else 'bronze'}"
                if badge_name not in submission.badges_earned:
                    submission.badges_earned.append(badge_name)
                    submission.save()

            challenge.status = 'completed'
            challenge.save()

            return Response(
                CreativeChallengeSerializer(challenge).data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChallengeSubmissionViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing challenge submissions.
    """
    queryset = ChallengeSubmission.objects.all()
    serializer_class = ChallengeSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ['challenge', 'moderation_status']

    def perform_create(self, serializer):
        """Set the participant to the current user."""
        serializer.save(participant=self.request.user)

    @action(detail=True, methods=['post'])
    def rate_submission(self, request, pk=None):
        """Rate a challenge submission."""
        submission = self.get_object()
        rating = request.data.get('rating')

        if not isinstance(rating, (int, float)) or not 0 <= rating <= 5:
            return Response(
                {"error": "Rating must be a number between 0 and 5"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update community rating
        current_ratings = UserFeedback.objects.filter(
            content_type=ContentType.objects.get_for_model(ChallengeSubmission),
            object_id=submission.id
        )
        
        UserFeedback.objects.create(
            user=request.user,
            content_type=ContentType.objects.get_for_model(ChallengeSubmission),
            object_id=submission.id,
            rating=rating
        )

        # Calculate new average rating
        new_rating = current_ratings.aggregate(Avg('rating'))['rating__avg']
        submission.community_rating = new_rating
        submission.save()

        return Response(
            ChallengeSubmissionSerializer(submission).data,
            status=status.HTTP_200_OK
        )


class ContentModerationViewSet(BaseTenantAwareViewSet):
    """
    ViewSet for managing content moderation.
    """
    queryset = ContentModeration.objects.all()
    serializer_class = ContentModerationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ['check_type', 'status', 'admin_reviewed']

    @action(detail=True, methods=['post'])
    def start_check(self, request, pk=None):
        """Start a moderation check."""
        moderation = self.get_object()
        
        if moderation.status != 'pending':
            return Response(
                {"error": "Check has already been started"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Queue the moderation check task
            moderation.status = 'processing'
            moderation.save()
            
            process_moderation_check.delay(moderation.id)
            
            return Response(
                ContentModerationSerializer(moderation).data,
                status=status.HTTP_202_ACCEPTED
            )
        except Exception as e:
            moderation.status = 'failed'
            moderation.save()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def admin_review(self, request, pk=None):
        """Submit admin review for a moderation check."""
        moderation = self.get_object()
        decision = request.data.get('decision')
        notes = request.data.get('notes', '')

        if decision not in ['approve', 'reject']:
            return Response(
                {"error": "Decision must be either 'approve' or 'reject'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        moderation.admin_reviewed = True
        moderation.admin_notes = notes
        moderation.status = 'passed' if decision == 'approve' else 'failed'
        moderation.save()

        # Update related submission if this is a challenge submission
        try:
            submission = moderation.composition.challenge_submissions.first()
            if submission:
                submission.moderation_status = (
                    'approved' if decision == 'approve' else 'rejected'
                )
                submission.save()
        except Exception:
            pass

        return Response(
            ContentModerationSerializer(moderation).data,
            status=status.HTTP_200_OK
        )


@shared_task
def process_moderation_check(moderation_id):
    """Process a content moderation check asynchronously."""
    try:
        moderation = ContentModeration.objects.get(id=moderation_id)
        
        # Perform checks based on check_type
        if moderation.check_type == 'copyright':
            results = check_copyright_infringement(moderation.composition)
        elif moderation.check_type == 'content_safety':
            results = check_content_safety(moderation.composition)
        elif moderation.check_type == 'quality':
            results = assess_quality(moderation.composition)
        else:  # originality
            results = check_originality(moderation.composition)
        
        moderation.check_results = results
        moderation.confidence_score = results.get('confidence', 0.0)
        moderation.status = 'flagged' if results.get('needs_review', False) else 'passed'
        moderation.save()
        
    except Exception as e:
        logger.error(f"Error in moderation check {moderation_id}: {str(e)}")
        moderation.status = 'failed'
        moderation.save()
