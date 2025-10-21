# views.py for music_education
# This file contains the viewsets for the music education app, providing API endpoints for managing courses, lessons, quizzes, and other related data.

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, Sum
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from .models import (
    Educator,
    Course,
    Lesson,
    LearningPath,
    Quiz,
    QuizAttempt,
    UserProgress,
    Achievement,
    UserAchievement,
    MentoringSession,
    AIFeedbackData,
    PerformanceRecording,
    PerformanceAnalysis,
    AdaptiveCurriculumSettings,
    PeerTutoringMatch,
    AIAnalysis,
    AIFeedback,
    ExpertCourse,
    CourseVersion,
    UserFeedback,
    UserMetrics,
    AnalyticsEvent,
    UserEngagement,
    VideoNote,
    WatchHistory,
    VideoAnalytics
)
from .serializers import (
    EducatorSerializer,
    CourseSerializer,
    LessonSerializer,
    LearningPathSerializer,
    QuizSerializer,
    QuizAttemptSerializer,
    UserProgressSerializer,
    AchievementSerializer,
    UserAchievementSerializer,
    MentoringSessionSerializer,
    AIFeedbackDataSerializer,
    PerformanceRecordingSerializer,
    PerformanceAnalysisSerializer,
    AdaptiveCurriculumSettingsSerializer,
    PeerTutoringMatchSerializer,
    AIAnalysisSerializer,
    AIFeedbackSerializer,
    ExpertCourseSerializer,
    CourseVersionSerializer,
    UserFeedbackSerializer,
    UserMetricsSerializer,
    AnalyticsEventSerializer,
    UserEngagementSerializer,
    VideoNoteSerializer,
    WatchHistorySerializer,
    VideoAnalyticsSerializer
)
from .tasks import analyze_performance, analyze_mixing_session
from .permissions import IsExpertOrReadOnly


class BaseUserAwareViewSet(viewsets.ModelViewSet):
    """
    Base viewset that implements user-specific access control.
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]

    def get_queryset(self):
        """
        Filter queryset based on user access level and role.
        """
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return queryset
        
        if hasattr(self, 'get_user_specific_queryset'):
            return self.get_user_specific_queryset(queryset, user)
            
        # Default: return user-specific objects instead of empty queryset
        if hasattr(queryset.model, 'user'):
            return queryset.filter(user=user)
            
        return queryset  # Return all objects if no user field and no custom method


class EducatorViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Educator model.
    """
    queryset = Educator.objects.all()
    serializer_class = EducatorSerializer
    search_fields = ['name', 'specialization']
    filterset_fields = ['specialization']

    def get_user_specific_queryset(self, queryset, user):
        # Educators are visible to all authenticated users
        return queryset


class CourseViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Course model.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    search_fields = ['course_name', 'description']
    filterset_fields = ['course_name']

    def get_user_specific_queryset(self, queryset, user):
        # All authenticated users can see courses
        return queryset


class LessonViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the Lesson model.
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    filterset_fields = ['course']

    def get_user_specific_queryset(self, queryset, user):
        # Users can see lessons from their enrolled courses
        enrolled_courses = UserProgress.objects.filter(user=user).values_list('course', flat=True)
        return queryset.filter(course__in=enrolled_courses)


class LearningPathViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the LearningPath model.
    """
    queryset = LearningPath.objects.all()
    serializer_class = LearningPathSerializer
    search_fields = ['path_name', 'description']
    filterset_fields = ['path_name']


class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Quiz model.
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    filterset_fields = ['lesson']


class QuizAttemptViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the QuizAttempt model.
    """
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    filterset_fields = ['quiz', 'user']

    def get_user_specific_queryset(self, queryset, user):
        # Users can only see their own quiz attempts
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserProgressViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the UserProgress model.
    """
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    filterset_fields = ['course', 'lesson', 'completion_status']

    def get_user_specific_queryset(self, queryset, user):
        # Users can only see their own progress
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AchievementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Achievement model.
    """
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    search_fields = ['name', 'description']
    filterset_fields = ['name']


class UserAchievementViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the UserAchievement model.
    """
    queryset = UserAchievement.objects.all()
    serializer_class = UserAchievementSerializer
    filterset_fields = ['achievement', 'user']

    def get_user_specific_queryset(self, queryset, user):
        # Users can only see their own achievements
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MentoringSessionViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the MentoringSession model.
    """
    queryset = MentoringSession.objects.all()
    serializer_class = MentoringSessionSerializer
    filterset_fields = ['educator']

    def get_user_specific_queryset(self, queryset, user):
        # Users can see their own mentoring sessions
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AIFeedbackDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the AIFeedbackData model.
    """
    queryset = AIFeedbackData.objects.all()
    serializer_class = AIFeedbackDataSerializer
    filterset_fields = ['quiz_attempt', 'lesson', 'user']


class PerformanceRecordingViewSet(BaseUserAwareViewSet):
    """
    ViewSet for the PerformanceRecording model.
    """
    queryset = PerformanceRecording.objects.all()
    serializer_class = PerformanceRecordingSerializer
    filterset_fields = ['lesson']

    def get_user_specific_queryset(self, queryset, user):
        # Users can only see their own recordings
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PerformanceAnalysisViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the PerformanceAnalysis model.
    """
    queryset = PerformanceAnalysis.objects.all()
    serializer_class = PerformanceAnalysisSerializer
    filterset_fields = ['recording']


class AdaptiveCurriculumSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the AdaptiveCurriculumSettings model.
    """
    queryset = AdaptiveCurriculumSettings.objects.all()
    serializer_class = AdaptiveCurriculumSettingsSerializer
    filterset_fields = ['user']


class PeerTutoringMatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the PeerTutoringMatch model.
    """
    queryset = PeerTutoringMatch.objects.all()
    serializer_class = PeerTutoringMatchSerializer
    filterset_fields = ['user_1', 'user_2']


class AIAnalysisViewSet(viewsets.ModelViewSet):
    serializer_class = AIAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Users can see their own analyses and public ones
        return AIAnalysis.objects.filter(
            Q(user=user) | 
            Q(privacy_level='public') |
            (Q(privacy_level='instructor') & Q(user__instructors=user))
        ).select_related(
            'feedback',
            'feedback__performance_metrics',
            'feedback__detailed_analysis',
            'progress'
        )

    @action(detail=False, methods=['post'])
    def analyze_performance(self, request):
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response(
                {'error': 'Audio file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        options = request.data.get('options', {})
        
        analysis = AIAnalysis.objects.create(
            user=request.user,
            status='pending',
            privacy_level=options.get('privacyLevel', 'private')
        )

        # Start async analysis task
        analyze_performance.delay(
            analysis_id=analysis.id,
            file_path=audio_file.temporary_file_path(),
            options=options
        )

        return Response({
            'analysisId': analysis.id,
            'status': 'pending'
        })

    @action(detail=False, methods=['post'])
    def analyze_mixing_session(self, request):
        session_id = request.data.get('sessionId')
        if not session_id:
            return Response(
                {'error': 'Session ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        options = request.data.get('options', {})
        
        analysis = AIAnalysis.objects.create(
            user=request.user,
            status='pending',
            privacy_level=options.get('privacyLevel', 'private')
        )

        # Start async analysis task
        analyze_mixing_session.delay(
            analysis_id=analysis.id,
            session_id=session_id,
            options=options
        )

        return Response({
            'analysisId': analysis.id,
            'status': 'pending'
        })

    @action(detail=True, methods=['patch'])
    def update_privacy(self, request, pk=None):
        analysis = self.get_object()
        privacy_level = request.data.get('privacyLevel')
        
        if not privacy_level or privacy_level not in dict(AIAnalysis.PRIVACY_CHOICES):
            return Response(
                {'error': 'Invalid privacy level'},
                status=status.HTTP_400_BAD_REQUEST
            )

        analysis.privacy_level = privacy_level
        analysis.save()
        
        return Response(self.get_serializer(analysis).data)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        analysis = self.get_object()
        if not hasattr(analysis, 'progress'):
            return Response({
                'progress_percentage': 0,
                'current_step': 'Waiting to start',
                'estimated_time_remaining': None
            })
        
        return Response({
            'progress_percentage': analysis.progress.progress_percentage,
            'current_step': analysis.progress.current_step,
            'estimated_time_remaining': analysis.progress.estimated_time_remaining
        })


class AIFeedbackViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AIFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return AIFeedback.objects.filter(
            Q(analysis__user=user) | 
            Q(analysis__privacy_level='public') |
            (Q(analysis__privacy_level='instructor') & Q(analysis__user__instructors=user))
        ).select_related(
            'performance_metrics',
            'detailed_analysis'
        )

    @action(detail=True, methods=['get'])
    def detailed(self, request, pk=None):
        feedback = self.get_object()
        if not hasattr(feedback, 'detailed_analysis'):
            return Response(
                {'error': 'Detailed analysis not available'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(self.get_serializer(feedback).data)


class ExpertCourseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpertCourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsExpertOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return ExpertCourse.objects.all()
        return ExpertCourse.objects.filter(expert=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        course = self.get_object()
        if course.status != 'draft':
            return Response(
                {"error": "Only draft courses can be published"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        course.status = 'published'
        course.published_at = timezone.now()
        course.save()
        
        return Response(self.get_serializer(course).data)

    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        course = self.get_object()
        serializer = CourseVersionSerializer(data={
            'course': course.id,
            'version': request.data.get('version'),
            'content': course.sections,
            'changes': request.data.get('changes', {})
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserFeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = UserFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserFeedback.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        feedback = self.get_queryset()
        summary = {
            'total_feedback': feedback.count(),
            'average_rating': feedback.aggregate(Avg('rating'))['rating__avg'] or 0,
            'by_type': feedback.values('type').annotate(
                count=Count('id'),
                avg_rating=Avg('rating')
            )
        }
        return Response(summary)


class UserMetricsViewSet(viewsets.ModelViewSet):
    serializer_class = UserMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserMetrics.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        metrics = self.get_queryset()
        summary = {
            'total_sessions': metrics.count(),
            'total_duration': metrics.aggregate(
                total=Sum('session_duration')
            )['total'] or 0,
            'average_progress': metrics.aggregate(
                avg=Avg('progress')
            )['avg'] or 0
        }
        return Response(summary)


class AnalyticsEventViewSet(viewsets.ModelViewSet):
    serializer_class = AnalyticsEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return AnalyticsEvent.objects.all()
        return AnalyticsEvent.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def event_types(self, request):
        events = self.get_queryset()
        summary = events.values('event_type').annotate(
            count=Count('id')
        ).order_by('-count')
        return Response(summary)


class UserEngagementViewSet(viewsets.ModelViewSet):
    serializer_class = UserEngagementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return UserEngagement.objects.all()
        return UserEngagement.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def current(self, request):
        engagement = UserEngagement.objects.filter(user=request.user).first()
        if not engagement:
            return Response({
                'score': 0,
                'last_active': None,
                'metrics': {}
            })
        return Response(self.get_serializer(engagement).data)


class VideoNoteViewSet(BaseUserAwareViewSet):
    """
    ViewSet for managing video notes with proper error handling.
    """
    queryset = VideoNote.objects.all()
    serializer_class = VideoNoteSerializer
    filterset_fields = ['lesson']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter notes to only show user's own notes."""
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create note: {str(e)}")

    @action(detail=False, methods=['get'])
    def lesson_notes(self, request):
        """Get all notes for a specific lesson."""
        lesson_id = request.query_params.get('lesson_id')
        if not lesson_id:
            raise serializers.ValidationError("lesson_id is required")
        
        notes = self.get_queryset().filter(lesson_id=lesson_id)
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)


class WatchHistoryViewSet(BaseUserAwareViewSet):
    """
    ViewSet for managing watch history with analytics integration.
    """
    queryset = WatchHistory.objects.all()
    serializer_class = WatchHistorySerializer
    filterset_fields = ['lesson']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter history to only show user's own history."""
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        try:
            # Create or update watch history
            history = serializer.save(user=self.request.user)
            
            # Update video analytics
            analytics, _ = VideoAnalytics.objects.get_or_create(
                lesson=history.lesson
            )
            
            # Update total watch time
            analytics.total_watch_time += (
                history.last_position - history.get_previous_position()
            )
            
            # Update completion rate if progress is 100%
            if history.progress == 100:
                total_users = WatchHistory.objects.filter(
                    lesson=history.lesson
                ).values('user').distinct().count()
                completed_users = WatchHistory.objects.filter(
                    lesson=history.lesson,
                    progress=100
                ).values('user').distinct().count()
                analytics.completion_rate = completed_users / total_users
            
            analytics.save()
            
        except Exception as e:
            raise serializers.ValidationError(
                f"Failed to update watch history: {str(e)}")

    @action(detail=False, methods=['get'])
    def user_progress(self, request):
        """Get user's progress across all lessons."""
        progress = self.get_queryset().values('lesson').annotate(
            max_progress=models.Max('progress')
        )
        return Response(progress)


class VideoAnalyticsViewSet(BaseUserAwareViewSet):
    """
    ViewSet for video analytics with caching and performance optimization.
    """
    queryset = VideoAnalytics.objects.all()
    serializer_class = VideoAnalyticsSerializer
    filterset_fields = ['lesson']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter analytics based on user's enrolled courses."""
        user_courses = UserProgress.objects.filter(
            user=self.request.user
        ).values_list('course', flat=True)
        
        return self.queryset.filter(
            lesson__course__in=user_courses
        )

    @action(detail=True, methods=['get'])
    def engagement_metrics(self, request, pk=None):
        """Get detailed engagement metrics for a lesson."""
        try:
            analytics = self.get_object()
            
            # Calculate engagement metrics
            watch_history = WatchHistory.objects.filter(lesson=analytics.lesson)
            total_sessions = watch_history.count()
            avg_session_duration = watch_history.aggregate(
                avg_duration=models.Avg('last_position')
            )['avg_duration'] or 0
            
            return Response({
                'total_sessions': total_sessions,
                'average_session_duration': avg_session_duration,
                'completion_rate': analytics.completion_rate,
                'average_engagement': analytics.average_engagement,
                'most_watched_segments': analytics.most_watched_segments
            })
            
        except Exception as e:
            raise serializers.ValidationError(
                f"Failed to retrieve engagement metrics: {str(e)}")

    @action(detail=True, methods=['get'])
    def retention_curve(self, request, pk=None):
        """Generate video retention curve data."""
        try:
            analytics = self.get_object()
            watch_history = WatchHistory.objects.filter(lesson=analytics.lesson)
            
            # Calculate retention at different points
            retention_points = []
            video_duration = Lesson.objects.get(
                id=analytics.lesson_id
            ).content.get('duration', 0)
            
            for point in range(0, video_duration, 30):  # Every 30 seconds
                viewers = watch_history.filter(
                    last_position__gte=point
                ).count()
                retention_points.append({
                    'time': point,
                    'viewers': viewers
                })
            
            return Response(retention_points)
            
        except Exception as e:
            raise serializers.ValidationError(
                f"Failed to generate retention curve: {str(e)}")
