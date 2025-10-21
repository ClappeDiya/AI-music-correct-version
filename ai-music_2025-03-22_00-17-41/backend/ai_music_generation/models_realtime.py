from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.db.models import JSONField


class CoCreationSession(models.Model):
    """
    Represents a real-time co-creation session where multiple users collaborate on music.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_sessions'
    )
    active = models.BooleanField(default=True)
    max_participants = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    session_type = models.CharField(
        max_length=50,
        choices=[
            ('composition', 'Composition'),
            ('improvisation', 'Improvisation'),
            ('arrangement', 'Arrangement'),
        ],
        default='composition'
    )
    current_composition = models.ForeignKey(
        'SavedComposition',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cocreation_sessions'
    )
    ai_conductor_settings = JSONField(
        default=dict,
        help_text="Settings for AI's behavior in the session"
    )

    class Meta:
        indexes = [
            models.Index(fields=['created_by']),
            models.Index(fields=['active']),
            models.Index(fields=['session_type']),
        ]


class SessionParticipant(models.Model):
    """
    Represents a user's participation in a co-creation session with their role.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_music_session_participations'
    )
    role = models.CharField(
        max_length=50,
        choices=[
            ('producer', 'Producer'),
            ('composer', 'Composer'),
            ('arranger', 'Arranger'),
            ('performer', 'Performer'),
            ('observer', 'Observer'),
        ]
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    permissions = JSONField(
        default=dict,
        help_text="Specific permissions for this participant"
    )

    class Meta:
        unique_together = [['session', 'user']]
        indexes = [
            models.Index(fields=['session', 'role']),
            models.Index(fields=['user', 'role']),
        ]


class RealtimeEdit(models.Model):
    """
    Tracks real-time edits made during a co-creation session.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='edits'
    )
    participant = models.ForeignKey(
        SessionParticipant,
        on_delete=models.CASCADE,
        related_name='edits'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    edit_type = models.CharField(
        max_length=50,
        choices=[
            ('note', 'Note Edit'),
            ('chord', 'Chord Edit'),
            ('rhythm', 'Rhythm Edit'),
            ('instrument', 'Instrument Edit'),
            ('effect', 'Effect Edit'),
            ('structure', 'Structure Edit'),
        ]
    )
    position = JSONField(
        help_text="Position in the composition timeline"
    )
    edit_data = JSONField(
        help_text="Details of the edit"
    )
    ai_feedback = JSONField(
        null=True,
        blank=True,
        help_text="AI's response/suggestions to this edit"
    )

    class Meta:
        indexes = [
            models.Index(fields=['session', 'timestamp']),
            models.Index(fields=['participant', 'edit_type']),
        ]


class AIContribution(models.Model):
    """
    Tracks AI's contributions and suggestions during the session.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='ai_contributions'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    contribution_type = models.CharField(
        max_length=50,
        choices=[
            ('suggestion', 'Suggestion'),
            ('completion', 'Completion'),
            ('variation', 'Variation'),
            ('harmony', 'Harmony'),
            ('transition', 'Transition'),
        ]
    )
    context = JSONField(
        help_text="Musical context that triggered this contribution"
    )
    content = JSONField(
        help_text="The actual musical content suggested"
    )
    explanation = models.TextField(
        help_text="Natural language explanation of the suggestion"
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('modified', 'Modified'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    feedback = JSONField(
        null=True,
        blank=True,
        help_text="User feedback on this contribution"
    )

    class Meta:
        indexes = [
            models.Index(fields=['session', 'timestamp']),
            models.Index(fields=['contribution_type', 'status']),
        ]


class SessionChat(models.Model):
    """
    Stores chat messages and AI responses during the session.
    """
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        CoCreationSession,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )
    participant = models.ForeignKey(
        SessionParticipant,
        on_delete=models.CASCADE,
        related_name='chat_messages',
        null=True,
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    message_type = models.CharField(
        max_length=50,
        choices=[
            ('text', 'Text Message'),
            ('command', 'Command'),
            ('suggestion', 'AI Suggestion'),
            ('notification', 'Notification'),
        ]
    )
    content = models.TextField()
    metadata = JSONField(
        null=True,
        blank=True,
        help_text="Additional message metadata"
    )

    class Meta:
        indexes = [
            models.Index(fields=['session', 'timestamp']),
            models.Index(fields=['participant', 'message_type']),
        ]
