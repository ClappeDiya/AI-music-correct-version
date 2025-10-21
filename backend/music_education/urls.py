# urls.py for music_education
# This file defines the URL patterns for the music education app, including routing for viewsets and API endpoints.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    ExpertCourseViewSet, UserFeedbackViewSet,
    UserMetricsViewSet, AnalyticsEventViewSet,
    UserEngagementViewSet,
    EducatorViewSet,
    CourseViewSet,
    LessonViewSet,
    LearningPathViewSet,
    MentoringSessionViewSet,
    AchievementViewSet,
    PerformanceRecordingViewSet,
    PerformanceAnalysisViewSet,
    VideoNoteViewSet,
    WatchHistoryViewSet,
    VideoAnalyticsViewSet
)

# Use DefaultRouter instead of TenantAwareRouter
router = DefaultRouter()

# Register viewsets
router.register(r'educators', views.EducatorViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'lessons', views.LessonViewSet)
router.register(r'learning-paths', views.LearningPathViewSet, basename='learningpath')
router.register(r'quizzes', views.QuizViewSet, basename='quiz')
router.register(r'quiz-attempts', views.QuizAttemptViewSet, basename='quizattempt')
router.register(r'user-progress', views.UserProgressViewSet, basename='userprogress')
router.register(r'achievements', views.AchievementViewSet)
router.register(r'user-achievements', views.UserAchievementViewSet, basename='userachievement')
router.register(r'mentoring-sessions', views.MentoringSessionViewSet, basename='mentoringsession')
router.register(r'ai-feedback', views.AIFeedbackDataViewSet, basename='aifeedbackdata')
router.register(r'performance-recordings', views.PerformanceRecordingViewSet)
router.register(r'performance-analysis', views.PerformanceAnalysisViewSet)
router.register(r'adaptive-curriculum', views.AdaptiveCurriculumSettingsViewSet, basename='adaptivecurriculumsettings')
router.register(r'peer-tutoring', views.PeerTutoringMatchViewSet, basename='peertutoringmatch')
router.register(r'ai-analysis', views.AIAnalysisViewSet, basename='ai-analysis')
router.register(r'expert-courses', ExpertCourseViewSet, basename='expert-course')
router.register(r'feedback', UserFeedbackViewSet, basename='feedback')
router.register(r'metrics', UserMetricsViewSet, basename='metrics')
router.register(r'analytics', AnalyticsEventViewSet, basename='analytics')
router.register(r'engagement', UserEngagementViewSet, basename='engagement')
router.register(r'video-notes', VideoNoteViewSet)
router.register(r'watch-history', WatchHistoryViewSet)
router.register(r'video-analytics', VideoAnalyticsViewSet)

# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),
]

# Set the app namespace
app_name = 'music_education'
