# views.py for Social and Community Features Module
# This file contains the ViewSets for the social and community features,
# providing API endpoints for interacting with the models.

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters import rest_framework as filters
from django.db.models import Q
from django.core.exceptions import PermissionDenied
from .models import (
    CommunityEventCategory,
    Post,
    PostComment,
    PostLike,
    UserFollow,
    Group,
    GroupMembership,
    Event,
    EventParticipation,
    PrivacySetting,
    ModerationAction,
    EphemeralPresence,
    CommunityCluster,
    UserTip,
    TranslationSuggestion,
    AnalyticsEvent,
    LLMRequest,
    TrackReference,
    TrackVersion,
)
from .serializers import (
    CommunityEventCategorySerializer,
    PostSerializer,
    PostCommentSerializer,
    PostLikeSerializer,
    UserFollowSerializer,
    GroupSerializer,
    GroupMembershipSerializer,
    EventSerializer,
    EventParticipationSerializer,
    PrivacySettingSerializer,
    ModerationActionSerializer,
    EphemeralPresenceSerializer,
    CommunityClusterSerializer,
    UserTipSerializer,
    TranslationSuggestionSerializer,
    AnalyticsEventSerializer,
    LLMRequestSerializer,
    TrackReferenceSerializer,
    TrackVersionSerializer,
)
from django.db.models import Count, Avg, Max, ExtractHour, TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.throttling import UserRateThrottle
from django.core.cache import cache
from django.conf import settings
from rest_framework.exceptions import ValidationError
from .exceptions import (
    ContentSafetyError,
    RateLimitExceeded,
    TokenValidationError,
    BatchProcessingError,
    InvalidPromptError,
)
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from functools import wraps
import logging
from django.db.models import transaction

logger = logging.getLogger(__name__)


class BaseUserAwareViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet class that implements user-based access control.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset based on user's role and permissions
        """
        queryset = super().get_queryset()
        user = self.request.user

        # If user is admin/moderator, return all records
        if user.is_staff or user.groups.filter(name='moderators').exists():
            return queryset

        # Get model-specific visibility rules
        visibility_field = getattr(self.queryset.model, 'visibility_field', None)
        if visibility_field:
            # Filter by visibility settings
            return self._filter_by_visibility(queryset, user)
        
        # Default to user's own records
        user_field = getattr(self.queryset.model, 'user_field', 'user')
        return queryset.filter(**{user_field: user})

    def _filter_by_visibility(self, queryset, user):
        """
        Filter queryset based on visibility settings
        """
        return queryset.filter(
            Q(visibility='public') |
            Q(user=user) |
            Q(visibility='followers', user__in=user.following.values('followee')) |
            Q(visibility='group', group__memberships__user=user)
        )

    def perform_create(self, serializer):
        """
        Set user on create
        """
        serializer.save(user=self.request.user)

    def check_object_permissions(self, request, obj):
        """
        Check object-level permissions
        """
        super().check_object_permissions(request, obj)
        
        # Allow staff and moderators full access
        if request.user.is_staff or request.user.groups.filter(name='moderators').exists():
            return

        # Check ownership or visibility
        if hasattr(obj, 'user'):
            if obj.user != request.user:
                if hasattr(obj, 'visibility'):
                    if not self._check_visibility_permission(obj, request.user):
                        raise PermissionDenied
                else:
                    raise PermissionDenied
        
    def _check_visibility_permission(self, obj, user):
        """
        Check if user has permission based on visibility settings
        """
        if obj.visibility == 'public':
            return True
        if obj.visibility == 'followers':
            return obj.user.followers.filter(follower=user).exists()
        if obj.visibility == 'group':
            return obj.group.memberships.filter(user=user).exists()
        return False


class CommunityEventCategoryViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the CommunityEventCategory model.
    """
    queryset = CommunityEventCategory.objects.all()
    serializer_class = CommunityEventCategorySerializer
    filter_fields = ['category_name']
    search_fields = ['category_name', 'description']


class PostViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Post model.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_fields = ['user', 'visibility']
    search_fields = ['content', 'metadata']


class PostCommentViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PostComment model.
    """
    queryset = PostComment.objects.all()
    serializer_class = PostCommentSerializer
    filter_fields = ['post', 'user']
    search_fields = ['comment_text']


class PostLikeViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PostLike model.
    """
    queryset = PostLike.objects.all()
    serializer_class = PostLikeSerializer
    filter_fields = ['post', 'user']


class UserFollowViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the UserFollow model.
    """
    queryset = UserFollow.objects.all()
    serializer_class = UserFollowSerializer
    filter_fields = ['follower', 'followee']


class GroupViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Group model.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    filter_fields = ['privacy']
    search_fields = ['group_name', 'description', 'metadata']


class GroupMembershipViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the GroupMembership model.
    """
    queryset = GroupMembership.objects.all()
    serializer_class = GroupMembershipSerializer
    filter_fields = ['group', 'user', 'role']


class EventViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Event model.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_fields = ['category', 'start_time', 'end_time']
    search_fields = ['event_name', 'description', 'metadata']


class EventParticipationViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the EventParticipation model.
    """
    queryset = EventParticipation.objects.all()
    serializer_class = EventParticipationSerializer
    filter_fields = ['event', 'user']


class PrivacySettingViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PrivacySetting model.
    """
    queryset = PrivacySetting.objects.all()
    serializer_class = PrivacySettingSerializer
    filter_fields = ['user']


class ModerationActionViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the ModerationAction model.
    """
    queryset = ModerationAction.objects.all()
    serializer_class = ModerationActionSerializer
    filter_fields = ['target_user', 'target_post', 'moderator_user', 'action_type']
    search_fields = ['reason']


class EphemeralPresenceViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the EphemeralPresence model.
    """
    queryset = EphemeralPresence.objects.all()
    serializer_class = EphemeralPresenceSerializer
    filter_fields = ['user', 'presence_status']


class CommunityClusterViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the CommunityCluster model.
    """
    queryset = CommunityCluster.objects.all()
    serializer_class = CommunityClusterSerializer
    filter_fields = ['cluster_name']
    search_fields = ['cluster_name', 'description', 'metadata']


class UserTipViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the UserTip model.
    """
    queryset = UserTip.objects.all()
    serializer_class = UserTipSerializer
    filter_fields = ['tipper', 'recipient_user']


class TranslationSuggestionViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the TranslationSuggestion model.
    """
    queryset = TranslationSuggestion.objects.all()
    serializer_class = TranslationSuggestionSerializer
    filter_fields = ['original_content_type', 'suggested_language']
    search_fields = ['translated_text']


# Custom throttle classes
class LLMGenerationThrottle(UserRateThrottle):
    rate = '100/day'

class AnalyticsThrottle(UserRateThrottle):
    rate = '1000/hour'

class BatchOperationThrottle(UserRateThrottle):
    rate = '50/hour'

def cache_key_with_user(user_id, prefix):
    """Generate cache key with user ID"""
    return f"{prefix}:{user_id}"

def handle_exceptions(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as e:
            logger.error(f"Validation error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            raise APIException(detail=str(e))
    return wrapper

class AnalyticsViewSet(BaseUserAwareViewSet):
    """
    Enhanced ViewSet for analytics functionality with user-based access control
    """
    serializer_class = AnalyticsEventSerializer
    queryset = AnalyticsEvent.objects.all()
    throttle_classes = [AnalyticsThrottle]

    @handle_exceptions
    @method_decorator(cache_page(settings.CACHE_TTL['analytics_report']))
    @action(detail=False, methods=['get'])
    def report(self, request):
        """Enhanced reporting with caching and user-based filtering"""
        try:
            timeframe = request.query_params.get('timeframe', 'day')
            user = request.user
            cache_key = f"analytics_report:{timeframe}:{user.id}"
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result:
                return Response(cached_result)

            # Generate report with user context
            analytics = self.get_analytics_data(timeframe, user)
            
            # Cache the result
            cache.set(cache_key, analytics, settings.CACHE_TTL['analytics_report'])
            return Response(analytics)
            
        except Exception as e:
            logger.error(f"Error generating analytics report: {str(e)}")
            raise BatchProcessingError(detail=str(e))

    def get_analytics_data(self, timeframe, user):
        """Get analytics data with user context"""
        if user.is_staff:
            queryset = self.queryset
        else:
            queryset = self.queryset.filter(user=user)
        
        # Rest of analytics logic...
        return analytics_data

    @handle_exceptions
    @action(detail=False, methods=['get'])
    def user_metrics(self, request, user_id):
        """User metrics with caching"""
        cache_key = cache_key_with_user(user_id, "user_metrics")
        
        try:
            # Try to get from cache
            cached_metrics = cache.get(cache_key)
            if cached_metrics:
                return Response(cached_metrics)

            # Generate metrics
            metrics = self.generate_user_metrics(user_id)
            
            # Cache the result
            cache.set(cache_key, metrics, settings.CACHE_TTL['user_metrics'])
            return Response(metrics)
            
        except Exception as e:
            logger.error(f"Error generating user metrics: {str(e)}")
            raise APIException(detail=str(e))

    @action(detail=False, methods=['post'])
    def batch_events(self, request):
        """Batch event processing with validation"""
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        
        # Batch create with error handling
        try:
            events = serializer.save(user=request.user)
            return Response({
                'status': 'success',
                'created': len(events),
                'events': AnalyticsEventSerializer(events, many=True).data
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class LLMViewSet(BaseUserAwareViewSet):
    """
    Enhanced ViewSet for LLM operations
    """
    serializer_class = LLMRequestSerializer
    queryset = LLMRequest.objects.all()
    throttle_classes = [LLMGenerationThrottle]

    @handle_exceptions
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """LLM generation with enhanced error handling"""
        try:
            # Content safety validation
            if not self.validate_content_safety(request.data.get('prompt', '')):
                raise ContentSafetyError()

            # Rate limit check
            if not self.check_rate_limit(request.user):
                raise RateLimitExceeded()

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save(user=request.user)

            # Process request asynchronously
            try:
                self.process_llm_request.delay(instance.id)
            except Exception as e:
                logger.error(f"Error queuing LLM request: {str(e)}")
                instance.status = 'failed'
                instance.save()
                raise APIException("Failed to process request")

            return Response({
                'status': 'processing',
                'request_id': instance.id,
                'estimated_time': '30s'
            })

        except Exception as e:
            logger.error(f"Error in LLM generation: {str(e)}")
            raise

    @action(detail=False, methods=['post'])
    def validate_prompt(self, request):
        """Enhanced prompt validation with detailed feedback"""
        prompt = request.data.get('prompt', '')
        validation_results = self.validate_prompt_content(prompt)
        
        return Response({
            'valid': validation_results['valid'],
            'feedback': validation_results['feedback'],
            'suggestions': validation_results['suggestions'],
            'safety_score': validation_results['safety_score']
        })

    @handle_exceptions
    @method_decorator(cache_page(settings.CACHE_TTL['llm_token_status']))
    @action(detail=False, methods=['get'])
    def token_status(self, request):
        """Token status with caching"""
        cache_key = cache_key_with_user(request.user.id, "token_status")
        
        try:
            # Try to get from cache
            cached_status = cache.get(cache_key)
            if cached_status:
                return Response(cached_status)

            # Generate status
            status = self.generate_token_status(request.user)
            
            # Cache the result
            cache.set(cache_key, status, settings.CACHE_TTL['llm_token_status'])
            return Response(status)
            
        except Exception as e:
            logger.error(f"Error getting token status: {str(e)}")
            raise TokenValidationError(detail=str(e))


class TrackReferenceViewSet(BaseUserAwareViewSet):
    """
    Enhanced ViewSet for track references
    """
    serializer_class = TrackReferenceSerializer
    queryset = TrackReference.objects.all()
    throttle_classes = [BatchOperationThrottle]

    @handle_exceptions
    @action(detail=False, methods=['post'])
    def batch_update(self, request):
        """Batch update with transaction and error handling"""
        updates = request.data.get('updates', [])
        results = []
        errors = []

        try:
            with transaction.atomic():
                for update in updates:
                    try:
                        reference = self.get_cached_reference(update['id'])
                        if not reference:
                            reference = self.queryset.get(id=update['id'])
                            self.cache_reference(reference)

                        serializer = self.get_serializer(
                            reference,
                            data=update,
                            partial=True
                        )
                        if serializer.is_valid():
                            serializer.save()
                            results.append(serializer.data)
                            # Update cache
                            self.cache_reference(serializer.instance)
                        else:
                            errors.append({
                                'id': update['id'],
                                'errors': serializer.errors
                            })
                    except TrackReference.DoesNotExist:
                        errors.append({
                            'id': update['id'],
                            'error': 'Track reference not found'
                        })
                    except Exception as e:
                        errors.append({
                            'id': update['id'],
                            'error': str(e)
                        })

            return Response({
                'success': len(results),
                'failed': len(errors),
                'results': results,
                'errors': errors
            })

        except Exception as e:
            logger.error(f"Error in batch update: {str(e)}")
            raise BatchProcessingError(detail=str(e))

    def get_cached_reference(self, reference_id):
        """Get track reference from cache"""
        cache_key = f"track_reference:{reference_id}"
        return cache.get(cache_key)

    def cache_reference(self, reference):
        """Cache track reference"""
        cache_key = f"track_reference:{reference.id}"
        cache.set(cache_key, reference, settings.CACHE_TTL['track_reference'])
