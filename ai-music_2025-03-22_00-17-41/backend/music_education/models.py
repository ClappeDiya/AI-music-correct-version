from django.db import models
from django.utils.translation import gettext_lazy as _
from user_management.models import User
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.postgres.fields import ArrayField
from django.db.models import JSONField

User = get_user_model()


# Shared Schema Models
class Educator(models.Model):
    """
    Represents an educator or mentor in the system. Accessible across all tenants.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Educator ID"), help_text=_("Unique identifier for the educator."))
    name = models.TextField(verbose_name=_("Name"), help_text=_("Name of the educator.")) # Name of the educator.
    bio = models.TextField(null=True, blank=True, verbose_name=_("Bio"), help_text=_("Biography of the educator.")) # Biography of the educator.
    specialization = models.TextField(verbose_name=_("Specialization"), help_text=_("Area of expertise of the educator, e.g., 'sound design', 'music theory'.")) # Area of expertise of the educator.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the educator was added to the system.")) # Timestamp when the educator was added to the system.

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Educator")
        verbose_name_plural = _("Educators")


# Tenant-Specific Schema Models
class Course(models.Model):
    """
    Represents a structured set of lessons.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Course ID"), help_text=_("Unique identifier for the course."))
    course_name = models.TextField(verbose_name=_("Course Name"), help_text=_("Name of the course.")) # Name of the course.
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the course.")) # Description of the course.
    metadata = models.JSONField(null=True, blank=True, verbose_name=_("Metadata"), help_text=_("Additional metadata about the course, e.g., level, duration, tags.")) # Additional metadata about the course.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the course was created.")) # Timestamp when the course was created.

    def __str__(self):
        return self.course_name

    class Meta:
        verbose_name = _("Course")
        verbose_name_plural = _("Courses")
        indexes = [
            models.Index(fields=['course_name'], name='idx_c_name'),
        ]

    def is_user_enrolled(self, user):
        """Check if a user is enrolled in this course."""
        return self.user_progress.filter(user=user).exists()


class Lesson(models.Model):
    """
    Represents a single lesson within a course.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Lesson ID"), help_text=_("Unique identifier for the lesson."))
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons', verbose_name=_("Course"), help_text=_("The course this lesson belongs to.")) # The course this lesson belongs to.
    lesson_title = models.TextField(verbose_name=_("Lesson Title"), help_text=_("Title of the lesson.")) # Title of the lesson.
    content = models.JSONField(null=True, blank=True, verbose_name=_("Content"), help_text=_("Structured lesson data, links to videos, transcripts.")) # Structured lesson data, links to videos, transcripts.
    order_in_course = models.IntegerField(verbose_name=_("Order in Course"), help_text=_("Order of the lesson within the course.")) # Order of the lesson within the course.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the lesson was created.")) # Timestamp when the lesson was created.

    def __str__(self):
        return self.lesson_title

    class Meta:
        verbose_name = _("Lesson")
        verbose_name_plural = _("Lessons")
        ordering = ['order_in_course']

    def is_accessible_to_user(self, user):
        """Check if a user has access to this lesson."""
        return self.course.is_user_enrolled(user)


class LearningPath(models.Model):
    """
    Represents a sequence of courses or lessons to guide user skill development.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Learning Path ID"), help_text=_("Unique identifier for the learning path."))
    path_name = models.TextField(verbose_name=_("Path Name"), help_text=_("Name of the learning path.")) # Name of the learning path.
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the learning path.")) # Description of the learning path.
    structure = models.JSONField(null=True, blank=True, verbose_name=_("Structure"), help_text=_("Structure of the learning path, e.g., steps of courses and lessons.")) # Structure of the learning path.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the learning path was created.")) # Timestamp when the learning path was created.

    def __str__(self):
        return self.path_name

    class Meta:
        verbose_name = _("Learning Path")
        verbose_name_plural = _("Learning Paths")


class Quiz(models.Model):
    """
    Represents a quiz associated with a lesson.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Quiz ID"), help_text=_("Unique identifier for the quiz."))
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='quizzes', verbose_name=_("Lesson"), help_text=_("The lesson this quiz is associated with.")) # The lesson this quiz is associated with.
    quiz_data = models.JSONField(null=True, blank=True, verbose_name=_("Quiz Data"), help_text=_("Quiz questions and answers.")) # Quiz questions and answers.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the quiz was created.")) # Timestamp when the quiz was created.

    def __str__(self):
        return f"Quiz for {self.lesson.lesson_title}"

    class Meta:
        verbose_name = _("Quiz")
        verbose_name_plural = _("Quizzes")


class QuizAttempt(models.Model):
    """
    Represents a user's attempt at a quiz.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Quiz Attempt ID"), help_text=_("Unique identifier for the quiz attempt."))
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts', verbose_name=_("Quiz"), help_text=_("The quiz this attempt is for.")) # The quiz this attempt is for.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts', verbose_name=_("User"), help_text=_("The user who made this attempt.")) # The user who made this attempt.
    attempt_data = models.JSONField(null=True, blank=True, verbose_name=_("Attempt Data"), help_text=_("User's answers for the quiz.")) # User's answers for the quiz.
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name=_("Score"), help_text=_("Score of the quiz attempt.")) # Score of the quiz attempt.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the quiz attempt was made.")) # Timestamp when the quiz attempt was made.

    def __str__(self):
        return f"Attempt by {self.user.email} on {self.quiz}"

    class Meta:
        verbose_name = _("Quiz Attempt")
        verbose_name_plural = _("Quiz Attempts")
        indexes = [
            models.Index(fields=['user'], name='idx_qa_uid'),
        ]


class UserProgress(models.Model):
    """
    Tracks user progress in courses and lessons.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("User Progress ID"), help_text=_("Unique identifier for the user progress record."))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress', verbose_name=_("User"), help_text=_("The user whose progress is being tracked.")) # The user whose progress is being tracked.
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='user_progress', verbose_name=_("Course"), help_text=_("The course the user is progressing through.")) # The course the user is progressing through.
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, null=True, blank=True, related_name='user_progress', verbose_name=_("Lesson"), help_text=_("The lesson the user is progressing through.")) # The lesson the user is progressing through.
    completion_status = models.TextField(default='in_progress', verbose_name=_("Completion Status"), help_text=_("Status of completion, e.g., 'in_progress', 'completed'.")) # Status of completion.
    progress = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name=_("Progress"), help_text=_("Percentage of completion.")) # Percentage of completion.
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the progress was last updated.")) # Timestamp when the progress was last updated.

    def __str__(self):
        return f"Progress of {self.user.email}"

    class Meta:
        verbose_name = _("User Progress")
        verbose_name_plural = _("User Progress Records")
        indexes = [
            models.Index(fields=['user'], name='idx_up_uid'),
        ]


class Achievement(models.Model):
    """
    Represents an achievement or badge that can be awarded to users.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Achievement ID"), help_text=_("Unique identifier for the achievement."))
    name = models.TextField(verbose_name=_("Name"), help_text=_("Name of the achievement.")) # Name of the achievement.
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the achievement.")) # Description of the achievement.
    criteria = models.JSONField(null=True, blank=True, verbose_name=_("Criteria"), help_text=_("Criteria for earning the achievement, e.g., course completion, quiz score.")) # Criteria for earning the achievement.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the achievement was created.")) # Timestamp when the achievement was created.

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Achievement")
        verbose_name_plural = _("Achievements")


class UserAchievement(models.Model):
    """
    Represents a user's earned achievement.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("User Achievement ID"), help_text=_("Unique identifier for the user achievement record."))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements', verbose_name=_("User"), help_text=_("The user who earned the achievement.")) # The user who earned the achievement.
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='user_achievements', verbose_name=_("Achievement"), help_text=_("The achievement that was earned.")) # The achievement that was earned.
    earned_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Earned At"), help_text=_("Timestamp when the achievement was earned.")) # Timestamp when the achievement was earned.

    def __str__(self):
        return f"{self.user.email} earned {self.achievement.name}"

    class Meta:
        verbose_name = _("User Achievement")
        verbose_name_plural = _("User Achievements")
        unique_together = ['user', 'achievement']
        indexes = [
            models.Index(fields=['user'], name='idx_ua_uid'),
        ]


class MentoringSession(models.Model):
    """
    Represents a mentoring session between a user and an educator.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Mentoring Session ID"), help_text=_("Unique identifier for the mentoring session."))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentoring_sessions', verbose_name=_("User"), help_text=_("The user participating in the mentoring session.")) # The user participating in the mentoring session.
    educator = models.ForeignKey(Educator, on_delete=models.RESTRICT, related_name='mentoring_sessions', verbose_name=_("Educator"), help_text=_("The educator leading the mentoring session.")) # The educator leading the mentoring session.
    session_data = models.JSONField(null=True, blank=True, verbose_name=_("Session Data"), help_text=_("Data about the mentoring session, e.g., scheduled time, topics, notes.")) # Data about the mentoring session.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the mentoring session was created.")) # Timestamp when the mentoring session was created.

    def __str__(self):
        return f"Mentoring session with {self.educator.name}"

    class Meta:
        verbose_name = _("Mentoring Session")
        verbose_name_plural = _("Mentoring Sessions")
        indexes = [
            models.Index(fields=['user'], name='idx_ms_uid'),
        ]


class AIFeedbackData(models.Model):
    """
    Represents AI-driven feedback for quiz attempts or lessons.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("AI Feedback ID"), help_text=_("Unique identifier for the AI feedback data."))
    quiz_attempt = models.ForeignKey(QuizAttempt, on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_feedback', verbose_name=_("Quiz Attempt"), help_text=_("The quiz attempt this feedback is for.")) # The quiz attempt this feedback is for.
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_feedback', verbose_name=_("Lesson"), help_text=_("The lesson this feedback is for.")) # The lesson this feedback is for.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_feedback', verbose_name=_("User"), help_text=_("The user who received this feedback.")) # The user who received this feedback.
    feedback = models.JSONField(null=True, blank=True, verbose_name=_("Feedback"), help_text=_("AI-generated feedback, e.g., suggestions, score analysis.")) # AI-generated feedback.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the feedback was generated.")) # Timestamp when the feedback was generated.

    def __str__(self):
        return f"AI feedback for {self.user.email}"

    class Meta:
        verbose_name = _("AI Feedback Data")
        verbose_name_plural = _("AI Feedback Data")


class PerformanceRecording(models.Model):
    """
    Stores user-submitted audio files for practice exercises.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Performance Recording ID"), help_text=_("Unique identifier for the performance recording."))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance_recordings', verbose_name=_("User"), help_text=_("The user who submitted the recording.")) # The user who submitted the recording.
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='performance_recordings', verbose_name=_("Lesson"), help_text=_("Optional link to a specific lesson.")) # Optional link to a specific lesson.
    file_url = models.TextField(verbose_name=_("File URL"), help_text=_("URL of the audio file.")) # URL of the audio file.
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Submitted At"), help_text=_("Timestamp when the recording was submitted.")) # Timestamp when the recording was submitted.

    def __str__(self):
        return f"Recording by {self.user.email}"

    class Meta:
        verbose_name = _("Performance Recording")
        verbose_name_plural = _("Performance Recordings")
        indexes = [
            models.Index(fields=['user'], name='idx_pr_uid'),
        ]


class PerformanceAnalysis(models.Model):
    """
    Represents AI-driven transcription and metrics from recorded performances.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Performance Analysis ID"), help_text=_("Unique identifier for the performance analysis."))
    recording = models.ForeignKey(PerformanceRecording, on_delete=models.CASCADE, related_name='analysis', verbose_name=_("Recording"), help_text=_("The performance recording this analysis is for.")) # The performance recording this analysis is for.
    analysis_data = models.JSONField(null=True, blank=True, verbose_name=_("Analysis Data"), help_text=_("Transcription, pitch accuracy, timing variance, etc.")) # Transcription, pitch accuracy, timing variance, etc.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the analysis was created.")) # Timestamp when the analysis was created.

    def __str__(self):
        return f"Analysis for recording {self.recording.id}"

    class Meta:
        verbose_name = _("Performance Analysis")
        verbose_name_plural = _("Performance Analyses")
        indexes = [
            models.Index(fields=['recording'], name='idx_pa_rid'),
        ]


class AdaptiveCurriculumSettings(models.Model):
    """
    Stores dynamic lesson ordering or difficulty adjustments per user.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Adaptive Curriculum Settings ID"), help_text=_("Unique identifier for the adaptive curriculum settings."))
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='adaptive_settings', verbose_name=_("User"), help_text=_("The user these settings apply to.")) # The user these settings apply to.
    configuration = models.JSONField(null=True, blank=True, verbose_name=_("Configuration"), help_text=_("Preferred challenge level, adaptive rules, etc.")) # Preferred challenge level, adaptive rules, etc.
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp when the settings were last updated.")) # Timestamp when the settings were last updated.

    def __str__(self):
        return f"Adaptive settings for {self.user.email}"

    class Meta:
        verbose_name = _("Adaptive Curriculum Settings")
        verbose_name_plural = _("Adaptive Curriculum Settings")
        indexes = [
            models.Index(fields=['user'], name='idx_acs_uid'),
        ]


class PeerTutoringMatch(models.Model):
    """
    Pairs users for mutual learning sessions.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Peer Tutoring Match ID"), help_text=_("Unique identifier for the peer tutoring match."))
    user_1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='peer_tutoring_matches_1', verbose_name=_("User 1"), help_text=_("The first user in the match.")) # The first user in the match.
    user_2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='peer_tutoring_matches_2', verbose_name=_("User 2"), help_text=_("The second user in the match.")) # The second user in the match.
    match_metadata = models.JSONField(null=True, blank=True, verbose_name=_("Match Metadata"), help_text=_("Shared goals, schedule, etc.")) # Shared goals, schedule, etc.
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp when the match was created.")) # Timestamp when the match was created.

    def __str__(self):
        return f"Peer tutoring match between {self.user_1.email} and {self.user_2.email}"

    class Meta:
        verbose_name = _("Peer Tutoring Match")
        verbose_name_plural = _("Peer Tutoring Matches")
        constraints = [
            models.CheckConstraint(check=~models.Q(user_1=models.F('user_2')), name='check_different_users'),
            models.UniqueConstraint(fields=['user_1', 'user_2'], name='unique_peer_match')
        ]
        indexes = [
            models.Index(fields=['user_1'], name='idx_ptm_u1id'),
        ]


class AIAnalysis(models.Model):
    PRIVACY_CHOICES = [
        ('private', 'Private'),
        ('instructor', 'Instructor Only'),
        ('public', 'Public'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_analyses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    privacy_level = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='private')
    error_message = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]


class AIFeedback(models.Model):
    analysis = models.OneToOneField(AIAnalysis, on_delete=models.CASCADE, related_name='feedback')
    feedback_text = models.TextField()
    strengths = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)

    class Meta:
        indexes = [
            models.Index(fields=['analysis']),
        ]


class PerformanceMetrics(models.Model):
    feedback = models.OneToOneField(AIFeedback, on_delete=models.CASCADE, related_name='performance_metrics')
    accuracy = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    rhythm = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    expression = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])


class DetailedAnalysis(models.Model):
    feedback = models.OneToOneField(AIFeedback, on_delete=models.CASCADE, related_name='detailed_analysis')
    
    # Pitch Analysis
    pitch_accuracy = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    pitch_consistency = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    pitch_range = models.CharField(max_length=50)
    
    # Rhythm Analysis
    rhythm_timing = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    rhythm_steadiness = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    rhythm_complexity = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    
    # Expression Analysis
    expression_dynamics = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    expression_articulation = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    expression_phrasing = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    
    # Technical Aspects
    intonation = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)], null=True)
    breathing = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)], null=True)
    posture = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)], null=True)

    class Meta:
        indexes = [
            models.Index(fields=['feedback']),
        ]


class ExpertCourse(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    expert = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    version = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived')
    ])
    sections = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True)
    expert_profile = JSONField()

    class Meta:
        db_table = 'expert_courses'
        indexes = [
            models.Index(fields=['expert', 'status']),
            models.Index(fields=['version'])
        ]


class CourseVersion(models.Model):
    course = models.ForeignKey(ExpertCourse, on_delete=models.CASCADE, related_name='versions')
    version = models.CharField(max_length=20)
    content = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    changes = JSONField()

    class Meta:
        db_table = 'course_versions'
        unique_together = ['course', 'version']


class UserFeedback(models.Model):
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedback')
    type = models.CharField(max_length=20)
    target_id = models.CharField(max_length=255)
    rating = models.IntegerField()
    comment = models.TextField(null=True)
    tags = ArrayField(models.CharField(max_length=50), default=list)
    timestamp = models.DateTimeField(auto_now_add=True)
    sentiment = JSONField(null=True)

    class Meta:
        db_table = 'user_feedback'
        indexes = [
            models.Index(fields=['user', 'type']),
            models.Index(fields=['target_id'])
        ]


class UserMetrics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='metrics')
    session_id = models.CharField(max_length=255)
    session_duration = models.IntegerField()
    completed_items = ArrayField(models.CharField(max_length=255), default=list)
    interactions = JSONField()
    progress = models.FloatField()
    performance = JSONField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_metrics'
        indexes = [
            models.Index(fields=['user', 'timestamp'])
        ]


class AnalyticsEvent(models.Model):
    event_type = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics_events')
    session_id = models.CharField(max_length=255)
    data = JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_events'
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['user']),
            models.Index(fields=['timestamp']),
        ]


class UserEngagement(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='engagement')
    score = models.FloatField()
    last_active = models.DateTimeField()
    metrics = JSONField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_engagement'


class VideoNote(models.Model):
    """
    Represents a user's note on a specific timestamp in a video lesson.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Video Note ID"))
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='video_notes',
                             verbose_name=_("Lesson"))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='video_notes',
                            verbose_name=_("User"))
    timestamp = models.IntegerField(verbose_name=_("Timestamp"),
                                  help_text=_("Timestamp in seconds where the note was added"))
    text = models.TextField(verbose_name=_("Note Text"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Video Note")
        verbose_name_plural = _("Video Notes")
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['user', 'lesson'], name='idx_vn_user_lesson'),
            models.Index(fields=['timestamp'], name='idx_vn_timestamp'),
        ]

    def __str__(self):
        return f"Note by {self.user} at {self.timestamp}s in {self.lesson}"


class WatchHistory(models.Model):
    """
    Tracks user's video watching progress for lessons.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Watch History ID"))
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='watch_history',
                             verbose_name=_("Lesson"))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watch_history',
                            verbose_name=_("User"))
    section = models.IntegerField(verbose_name=_("Section"),
                                help_text=_("Section identifier within the lesson"))
    progress = models.FloatField(verbose_name=_("Progress"),
                               validators=[MinValueValidator(0), MaxValueValidator(100)],
                               help_text=_("Progress percentage for this section"))
    timestamp = models.DateTimeField(verbose_name=_("Timestamp"),
                                   help_text=_("When this progress was recorded"))
    last_position = models.IntegerField(default=0, verbose_name=_("Last Position"),
                                      help_text=_("Last playback position in seconds"))

    class Meta:
        verbose_name = _("Watch History")
        verbose_name_plural = _("Watch Histories")
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'lesson'], name='idx_wh_user_lesson'),
            models.Index(fields=['timestamp'], name='idx_wh_timestamp'),
        ]

    def __str__(self):
        return f"{self.user}'s progress in {self.lesson}: {self.progress}%"


class VideoAnalytics(models.Model):
    """
    Stores aggregated analytics data for video lessons.
    """
    id = models.BigAutoField(primary_key=True, verbose_name=_("Video Analytics ID"))
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='video_analytics',
                             verbose_name=_("Lesson"))
    total_watch_time = models.IntegerField(default=0, verbose_name=_("Total Watch Time"),
                                         help_text=_("Total time watched in seconds"))
    completion_rate = models.FloatField(default=0.0, verbose_name=_("Completion Rate"),
                                      validators=[MinValueValidator(0), MaxValueValidator(1)],
                                      help_text=_("Percentage of users who completed the video"))
    average_engagement = models.FloatField(default=0.0, verbose_name=_("Average Engagement"),
                                         validators=[MinValueValidator(0), MaxValueValidator(1)],
                                         help_text=_("Average engagement score"))
    most_watched_segments = models.JSONField(default=list, verbose_name=_("Most Watched Segments"),
                                           help_text=_("List of most watched video segments"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Video Analytics")
        verbose_name_plural = _("Video Analytics")
        indexes = [
            models.Index(fields=['lesson'], name='idx_va_lesson'),
            models.Index(fields=['updated_at'], name='idx_va_updated'),
        ]

    def __str__(self):
        return f"Analytics for {self.lesson}"


class AnalysisProgress(models.Model):
    """
    Tracks the progress of AI analysis tasks.
    """
    analysis = models.OneToOneField(AIAnalysis, on_delete=models.CASCADE, related_name='progress')
    progress_percentage = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0,
        verbose_name=_("Progress Percentage")
    )
    current_step = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Current Step")
    )
    estimated_time_remaining = models.IntegerField(
        null=True,
        blank=True,
        verbose_name=_("Estimated Time Remaining (seconds)")
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Analysis Progress")
        verbose_name_plural = _("Analysis Progress")
        indexes = [
            models.Index(fields=['updated_at']),
        ]

    def __str__(self):
        return f"Progress for analysis {self.analysis_id}: {self.progress_percentage}%"
