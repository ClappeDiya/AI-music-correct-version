from rest_framework import serializers
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
    AnalysisProgress,
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


class BaseUserAwareSerializer(serializers.ModelSerializer):
    """
    Base serializer that implements user-specific validation.
    """
    def validate(self, attrs):
        # Add user-specific validation if needed
        return super().validate(attrs)


class EducatorSerializer(BaseUserAwareSerializer):
    """
    Serializer for the Educator model.
    """
    class Meta:
        model = Educator
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


# Tenant-Specific Schema Serializers
class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Course model.
    """
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class LessonSerializer(serializers.ModelSerializer):
    """
    Serializer for the Lesson model.
    """
    class Meta:
        model = Lesson
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class LearningPathSerializer(serializers.ModelSerializer):
    """
    Serializer for the LearningPath model.
    """
    class Meta:
        model = LearningPath
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class QuizSerializer(serializers.ModelSerializer):
    """
    Serializer for the Quiz model.
    """
    class Meta:
        model = Quiz
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class QuizAttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for the QuizAttempt model.
    """
    class Meta:
        model = QuizAttempt
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class UserProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProgress model.
    """
    class Meta:
        model = UserProgress
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']


class AchievementSerializer(serializers.ModelSerializer):
    """
    Serializer for the Achievement model.
    """
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class UserAchievementSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserAchievement model.
    """
    class Meta:
        model = UserAchievement
        fields = '__all__'
        read_only_fields = ['id', 'earned_at']


class MentoringSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for the MentoringSession model.
    """
    class Meta:
        model = MentoringSession
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class AIFeedbackDataSerializer(serializers.ModelSerializer):
    """
    Serializer for the AIFeedbackData model.
    """
    class Meta:
        model = AIFeedbackData
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class PerformanceRecordingSerializer(serializers.ModelSerializer):
    """
    Serializer for the PerformanceRecording model.
    """
    class Meta:
        model = PerformanceRecording
        fields = '__all__'
        read_only_fields = ['id', 'submitted_at']


class PerformanceAnalysisSerializer(serializers.ModelSerializer):
    """
    Serializer for the PerformanceAnalysis model.
    """
    class Meta:
        model = PerformanceAnalysis
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class AdaptiveCurriculumSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for the AdaptiveCurriculumSettings model.
    """
    class Meta:
        model = AdaptiveCurriculumSettings
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']


class PeerTutoringMatchSerializer(serializers.ModelSerializer):
    """
    Serializer for the PeerTutoringMatch model.
    """
    class Meta:
        model = PeerTutoringMatch
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class PerformanceMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceMetrics
        fields = ['accuracy', 'rhythm', 'expression']


class DetailedAnalysisSerializer(serializers.ModelSerializer):
    pitch = serializers.SerializerMethodField()
    rhythm = serializers.SerializerMethodField()
    expression = serializers.SerializerMethodField()
    technical_aspects = serializers.SerializerMethodField()

    class Meta:
        model = DetailedAnalysis
        fields = ['pitch', 'rhythm', 'expression', 'technical_aspects']

    def get_pitch(self, obj):
        return {
            'accuracy': obj.pitch_accuracy,
            'consistency': obj.pitch_consistency,
            'range': obj.pitch_range
        }

    def get_rhythm(self, obj):
        return {
            'timing': obj.rhythm_timing,
            'steadiness': obj.rhythm_steadiness,
            'complexity': obj.rhythm_complexity
        }

    def get_expression(self, obj):
        return {
            'dynamics': obj.expression_dynamics,
            'articulation': obj.expression_articulation,
            'phrasing': obj.expression_phrasing
        }

    def get_technical_aspects(self, obj):
        if not any([obj.intonation, obj.breathing, obj.posture]):
            return None
        return {
            'intonation': obj.intonation,
            'breathing': obj.breathing,
            'posture': obj.posture
        }


class AIFeedbackSerializer(serializers.ModelSerializer):
    performance_metrics = PerformanceMetricsSerializer()
    detailed_analysis = DetailedAnalysisSerializer()

    class Meta:
        model = AIFeedback
        fields = [
            'id',
            'feedback_text',
            'strengths',
            'improvements',
            'suggestions',
            'performance_metrics',
            'detailed_analysis'
        ]

    def create(self, validated_data):
        metrics_data = validated_data.pop('performance_metrics')
        analysis_data = validated_data.pop('detailed_analysis')
        
        feedback = AIFeedback.objects.create(**validated_data)
        
        PerformanceMetrics.objects.create(feedback=feedback, **metrics_data)
        DetailedAnalysis.objects.create(feedback=feedback, **analysis_data)
        
        return feedback


class AnalysisProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisProgress
        fields = ['progress_percentage', 'current_step', 'estimated_time_remaining']


class AIAnalysisSerializer(serializers.ModelSerializer):
    feedback = AIFeedbackSerializer(read_only=True)
    progress = AnalysisProgressSerializer(read_only=True)
    
    class Meta:
        model = AIAnalysis
        fields = [
            'id',
            'user',
            'created_at',
            'updated_at',
            'status',
            'privacy_level',
            'error_message',
            'feedback',
            'progress'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'status', 'error_message']

    def create(self, validated_data):
        user = self.context['request'].user
        return AIAnalysis.objects.create(user=user, **validated_data)


class ExpertCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpertCourse
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'published_at')

    def validate_sections(self, value):
        if not isinstance(value, list) or not value:
            raise serializers.ValidationError("Sections must be a non-empty list")
        return value


class CourseVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVersion
        fields = '__all__'
        read_only_fields = ('created_at',)


class UserFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFeedback
        fields = '__all__'
        read_only_fields = ('id', 'timestamp', 'sentiment')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class UserMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMetrics
        fields = '__all__'
        read_only_fields = ('timestamp',)

    def validate_progress(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Progress must be between 0 and 100")
        return value


class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = '__all__'
        read_only_fields = ('timestamp',)


class UserEngagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEngagement
        fields = '__all__'
        read_only_fields = ('updated_at',)

    def validate_score(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Engagement score must be between 0 and 100")
        return value


class VideoNoteSerializer(serializers.ModelSerializer):
    """
    Serializer for video notes with proper validation.
    """
    class Meta:
        model = VideoNote
        fields = ['id', 'lesson', 'timestamp', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_timestamp(self, value):
        if value < 0:
            raise serializers.ValidationError("Timestamp cannot be negative")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class WatchHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for watch history with progress validation.
    """
    class Meta:
        model = WatchHistory
        fields = ['id', 'lesson', 'section', 'progress', 'timestamp', 'last_position']
        read_only_fields = ['id']

    def validate_progress(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Progress must be between 0 and 100")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class VideoAnalyticsSerializer(serializers.ModelSerializer):
    """
    Serializer for video analytics with detailed validation.
    """
    class Meta:
        model = VideoAnalytics
        fields = ['id', 'lesson', 'total_watch_time', 'completion_rate',
                 'average_engagement', 'most_watched_segments', 'updated_at']
        read_only_fields = ['id', 'updated_at']

    def validate_most_watched_segments(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Most watched segments must be a list")
        
        for segment in value:
            if not isinstance(segment, dict):
                raise serializers.ValidationError("Each segment must be an object")
            required_keys = {'start', 'end', 'count'}
            if not all(key in segment for key in required_keys):
                raise serializers.ValidationError(
                    f"Each segment must contain {required_keys}")
            if segment['start'] > segment['end']:
                raise serializers.ValidationError(
                    "Segment start cannot be greater than end")
            if segment['count'] < 0:
                raise serializers.ValidationError(
                    "Segment count cannot be negative")
        
        return value

    def validate(self, attrs):
        if attrs.get('completion_rate', 0) > 1:
            raise serializers.ValidationError(
                "Completion rate cannot be greater than 1")
        if attrs.get('average_engagement', 0) > 1:
            raise serializers.ValidationError(
                "Average engagement cannot be greater than 1")
        return attrs
