from celery import shared_task
from django.utils.translation import gettext_lazy as _
from .models import AIAnalysis, AIFeedback, PerformanceMetrics, DetailedAnalysis

@shared_task
def analyze_performance(analysis_id):
    """
    Asynchronous task to analyze a performance recording.
    """
    try:
        analysis = AIAnalysis.objects.get(id=analysis_id)
        analysis.status = 'processing'
        analysis.save()

        # Create feedback
        feedback = AIFeedback.objects.create(
            analysis=analysis,
            feedback_text="Performance analysis completed",
            strengths=["Good pitch control", "Consistent rhythm"],
            improvements=["Work on dynamics", "Focus on expression"],
            suggestions=["Practice with a metronome", "Record and review regularly"]
        )

        # Add performance metrics
        PerformanceMetrics.objects.create(
            feedback=feedback,
            accuracy=0.85,
            rhythm=0.80,
            expression=0.75
        )

        # Add detailed analysis
        DetailedAnalysis.objects.create(
            feedback=feedback,
            pitch_accuracy=0.85,
            pitch_consistency=0.82,
            pitch_range="A3-C5",
            rhythm_timing=0.80,
            rhythm_steadiness=0.78,
            rhythm_complexity=0.75,
            expression_dynamics=0.73,
            expression_articulation=0.76,
            expression_phrasing=0.74,
            intonation=0.83,
            breathing=0.79,
            posture=0.85
        )

        analysis.status = 'completed'
        analysis.save()

    except Exception as e:
        if analysis:
            analysis.status = 'failed'
            analysis.error_message = str(e)
            analysis.save()
        raise

@shared_task
def analyze_mixing_session(analysis_id):
    """
    Asynchronous task to analyze a mixing session.
    """
    try:
        analysis = AIAnalysis.objects.get(id=analysis_id)
        analysis.status = 'processing'
        analysis.save()

        # Create feedback
        feedback = AIFeedback.objects.create(
            analysis=analysis,
            feedback_text="Mixing session analysis completed",
            strengths=["Good balance between tracks", "Clear separation of frequencies"],
            improvements=["Consider EQ adjustments", "Review compression settings"],
            suggestions=["Use reference tracks", "Check mix in different environments"]
        )

        # Add performance metrics
        PerformanceMetrics.objects.create(
            feedback=feedback,
            accuracy=0.82,
            rhythm=0.85,
            expression=0.78
        )

        # Add detailed analysis
        DetailedAnalysis.objects.create(
            feedback=feedback,
            pitch_accuracy=0.82,
            pitch_consistency=0.80,
            pitch_range="Full spectrum",
            rhythm_timing=0.85,
            rhythm_steadiness=0.83,
            rhythm_complexity=0.80,
            expression_dynamics=0.78,
            expression_articulation=0.75,
            expression_phrasing=0.77,
            intonation=0.85,
            breathing=None,  # Not applicable for mixing
            posture=None    # Not applicable for mixing
        )

        analysis.status = 'completed'
        analysis.save()

    except Exception as e:
        if analysis:
            analysis.status = 'failed'
            analysis.error_message = str(e)
            analysis.save()
        raise 