from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from ...models import AIDJSession

class VoiceEmotionData(models.Model):
    EMOTION_CHOICES = [
        ('happy', 'Happy'),
        ('sad', 'Sad'),
        ('neutral', 'Neutral'),
        ('excited', 'Excited'),
        ('calm', 'Calm'),
        ('frustrated', 'Frustrated'),
    ]

    session = models.ForeignKey(AIDJSession, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    emotion = models.CharField(max_length=20, choices=EMOTION_CHOICES)
    confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    
    # Audio Features
    pitch = models.FloatField()
    tempo = models.FloatField()
    energy = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    valence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Voice Emotion: {self.emotion} at {self.timestamp}"

class EmotionalMusicPreference(models.Model):
    session = models.OneToOneField(AIDJSession, on_delete=models.CASCADE)
    
    # Mood Preferences
    prefer_mood_matching = models.BooleanField(default=True)
    prefer_mood_improvement = models.BooleanField(default=True)
    
    # Energy Level Preferences
    min_energy = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        default=0.0
    )
    max_energy = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        default=1.0
    )
    
    # Transition Preferences
    gradual_mood_transition = models.BooleanField(default=True)
    transition_duration = models.IntegerField(
        validators=[MinValueValidator(0)],
        default=30  # seconds
    )

    def __str__(self):
        return f"Emotional Music Preferences for Session {self.session.id}"

class EmotionalPlaylistTemplate(models.Model):
    MOOD_CHOICES = [
        ('happy', 'Happy'),
        ('sad', 'Sad'),
        ('energetic', 'Energetic'),
        ('calm', 'Calm'),
        ('focused', 'Focused'),
    ]

    name = models.CharField(max_length=100)
    target_mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    description = models.TextField()
    
    # Musical Parameters
    tempo_range_min = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Minimum BPM"
    )
    tempo_range_max = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Maximum BPM"
    )
    energy_level = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Target energy level"
    )
    valence_level = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Target emotional positivity"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.target_mood})"

    class Meta:
        ordering = ['target_mood', 'name']
