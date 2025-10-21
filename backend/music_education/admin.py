# admin.py for music_education
# This file defines how the models are displayed and managed in the Django admin interface.

from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
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
    PerformanceMetrics,
    DetailedAnalysis,
    ExpertCourse,
    CourseVersion,
    UserFeedback,
    UserMetrics,
    AnalyticsEvent,
    UserEngagement,
    VideoNote,
    WatchHistory,
    VideoAnalytics,
    AnalysisProgress
)


# Shared Schema Admin Classes
@admin.register(Educator)
class EducatorAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the Educator model.
    """
    list_display = ['id', 'name', 'specialization', 'created_at']
    list_filter = ['specialization', 'created_at']
    search_fields = ['name', 'bio', 'specialization']
    readonly_fields = ['created_at']


# Tenant-Specific Schema Admin Classes
@admin.register(Course)
class CourseAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the Course model.
    """
    list_display = ['id', 'course_name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['course_name', 'description']
    readonly_fields = ['created_at']


@admin.register(Lesson)
class LessonAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the Lesson model.
    """
    list_display = ['id', 'course', 'lesson_title', 'order_in_course', 'created_at']
    list_filter = ['course', 'created_at']
    search_fields = ['lesson_title']
    readonly_fields = ['created_at']
    ordering = ['course', 'order_in_course']
    autocomplete_fields = ['course']
    list_select_related = ['course']


@admin.register(LearningPath)
class LearningPathAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the LearningPath model.
    """
    list_display = ['id', 'path_name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['path_name', 'description']
    readonly_fields = ['created_at']


@admin.register(Quiz)
class QuizAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the Quiz model.
    """
    list_display = ['id', 'lesson', 'created_at']
    list_filter = ['created_at']
    search_fields = ['lesson__lesson_title']
    readonly_fields = ['created_at']
    autocomplete_fields = ['lesson']
    list_select_related = ['lesson']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the QuizAttempt model.
    """
    list_display = ['id', 'quiz', 'user', 'score', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'quiz__lesson__lesson_title']
    readonly_fields = ['created_at']
    autocomplete_fields = ['quiz', 'user']
    list_select_related = ['quiz', 'user']


@admin.register(UserProgress)
class UserProgressAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the UserProgress model.
    """
    list_display = ['id', 'user', 'course', 'lesson', 'completion_status', 'progress', 'updated_at']
    list_filter = ['completion_status', 'updated_at']
    search_fields = ['user__username', 'course__course_name', 'lesson__lesson_title']
    readonly_fields = ['updated_at']
    autocomplete_fields = ['user', 'course', 'lesson']
    list_select_related = ['user', 'course', 'lesson']


@admin.register(Achievement)
class AchievementAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the Achievement model.
    """
    list_display = ['id', 'name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']


@admin.register(UserAchievement)
class UserAchievementAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the UserAchievement model.
    """
    list_display = ['id', 'user', 'achievement', 'earned_at']
    list_filter = ['earned_at']
    search_fields = ['user__username', 'achievement__name']
    readonly_fields = ['earned_at']
    autocomplete_fields = ['user', 'achievement']
    list_select_related = ['user', 'achievement']


@admin.register(MentoringSession)
class MentoringSessionAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the MentoringSession model.
    """
    list_display = ['id', 'user', 'educator', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'educator__name']
    readonly_fields = ['created_at']
    autocomplete_fields = ['user', 'educator']
    list_select_related = ['user', 'educator']


@admin.register(AIFeedbackData)
class AIFeedbackDataAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the AIFeedbackData model.
    """
    list_display = ['id', 'user', 'quiz_attempt', 'lesson', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']
    autocomplete_fields = ['user', 'quiz_attempt', 'lesson']
    list_select_related = ['user', 'quiz_attempt', 'lesson']


@admin.register(PerformanceRecording)
class PerformanceRecordingAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the PerformanceRecording model.
    """
    list_display = ['id', 'user', 'lesson', 'submitted_at']
    list_filter = ['submitted_at']
    search_fields = ['user__username', 'lesson__lesson_title']
    readonly_fields = ['submitted_at']
    autocomplete_fields = ['user', 'lesson']
    list_select_related = ['user', 'lesson']


@admin.register(PerformanceAnalysis)
class PerformanceAnalysisAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the PerformanceAnalysis model.
    """
    list_display = ['id', 'recording', 'created_at']
    list_filter = ['created_at']
    search_fields = ['recording__user__username']
    readonly_fields = ['created_at']
    autocomplete_fields = ['recording']
    list_select_related = ['recording']


@admin.register(AdaptiveCurriculumSettings)
class AdaptiveCurriculumSettingsAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the AdaptiveCurriculumSettings model.
    """
    list_display = ['id', 'user', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['user__username']
    readonly_fields = ['updated_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(PeerTutoringMatch)
class PeerTutoringMatchAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the PeerTutoringMatch model.
    """
    list_display = ['id', 'user_1', 'user_2', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user_1__username', 'user_2__username']
    readonly_fields = ['created_at']
    autocomplete_fields = ['user_1', 'user_2']
    list_select_related = ['user_1', 'user_2']


@admin.register(AIAnalysis)
class AIAnalysisAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the AIAnalysis model.
    """
    list_display = ['user', 'status', 'privacy_level', 'created_at', 'updated_at']
    list_filter = ['status', 'privacy_level', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(AIFeedback)
class AIFeedbackAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the AIFeedback model.
    """
    list_display = ['analysis', 'feedback_text']
    search_fields = ['feedback_text']
    readonly_fields = []
    autocomplete_fields = ['analysis']
    list_select_related = ['analysis']


@admin.register(PerformanceMetrics)
class PerformanceMetricsAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the PerformanceMetrics model.
    """
    list_display = ['feedback', 'accuracy', 'rhythm', 'expression']
    list_filter = ['accuracy', 'rhythm', 'expression']
    readonly_fields = []
    autocomplete_fields = ['feedback']
    list_select_related = ['feedback']


@admin.register(DetailedAnalysis)
class DetailedAnalysisAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the DetailedAnalysis model.
    """
    list_display = ['feedback', 'pitch_accuracy', 'rhythm_timing', 'expression_dynamics']
    list_filter = ['pitch_accuracy', 'rhythm_timing', 'expression_dynamics']
    readonly_fields = []
    autocomplete_fields = ['feedback']
    list_select_related = ['feedback']


@admin.register(ExpertCourse)
class ExpertCourseAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the ExpertCourse model.
    """
    list_display = ['id', 'title', 'expert', 'version', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at', 'updated_at']
    search_fields = ['title', 'expert__username']
    readonly_fields = ['created_at', 'updated_at', 'published_at']
    autocomplete_fields = ['expert']
    list_select_related = ['expert']


@admin.register(CourseVersion)
class CourseVersionAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the CourseVersion model.
    """
    list_display = ['course', 'version', 'created_at']
    list_filter = ['created_at']
    search_fields = ['course__title', 'version']
    readonly_fields = ['created_at']
    autocomplete_fields = ['course']
    list_select_related = ['course']


@admin.register(UserFeedback)
class UserFeedbackAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the UserFeedback model.
    """
    list_display = ['id', 'user', 'type', 'rating', 'timestamp']
    list_filter = ['type', 'rating', 'timestamp']
    search_fields = ['user__username', 'comment']
    readonly_fields = ['timestamp']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(UserMetrics)
class UserMetricsAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the UserMetrics model.
    """
    list_display = ['user', 'session_id', 'session_duration', 'progress', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['user__username', 'session_id']
    readonly_fields = ['timestamp']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the AnalyticsEvent model.
    """
    list_display = ['event_type', 'user', 'session_id', 'timestamp']
    list_filter = ['event_type', 'timestamp']
    search_fields = ['user__username', 'session_id']
    readonly_fields = ['timestamp']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(UserEngagement)
class UserEngagementAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the UserEngagement model.
    """
    list_display = ['user', 'score', 'last_active', 'updated_at']
    list_filter = ['last_active', 'updated_at']
    search_fields = ['user__username']
    readonly_fields = ['updated_at']
    autocomplete_fields = ['user']
    list_select_related = ['user']


@admin.register(VideoNote)
class VideoNoteAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the VideoNote model.
    """
    list_display = ['id', 'lesson', 'user', 'timestamp', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'text', 'lesson__lesson_title']
    readonly_fields = ['created_at']
    autocomplete_fields = ['lesson']
    list_select_related = ['lesson']


@admin.register(WatchHistory)
class WatchHistoryAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the WatchHistory model.
    """
    list_display = ['id', 'lesson', 'user', 'section', 'progress', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['user__username', 'lesson__lesson_title']
    readonly_fields = ['timestamp']
    autocomplete_fields = ['lesson']
    list_select_related = ['lesson']


@admin.register(VideoAnalytics)
class VideoAnalyticsAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the VideoAnalytics model.
    """
    list_display = ['id', 'lesson', 'total_watch_time', 'completion_rate', 'average_engagement', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['lesson__lesson_title']
    readonly_fields = ['updated_at']
    autocomplete_fields = ['lesson']
    list_select_related = ['lesson']


@admin.register(AnalysisProgress)
class AnalysisProgressAdmin(TenantAdminMixin, admin.ModelAdmin):
    """
    Admin class for the AnalysisProgress model.
    """
    list_display = ['analysis', 'progress_percentage', 'current_step', 'estimated_time_remaining', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['current_step']
    readonly_fields = ['updated_at']
    autocomplete_fields = ['analysis']
    list_select_related = ['analysis']
