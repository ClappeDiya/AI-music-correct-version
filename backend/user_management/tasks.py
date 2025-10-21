from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_welcome_email(user_email, user_name):
    """Send welcome email to new users."""
    subject = 'Welcome to Our AI Music Platform!'
    message = f'''
    Hi {user_name},

    Welcome to our platform! Start creating amazing music with AI today.

    Get started: {settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'}/project/dashboard

    Best regards,
    The Team
    '''

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@example.com',
        [user_email],
        fail_silently=False,
    )

@shared_task
def send_quota_reminder(user_email, remaining):
    """Remind users they're running low on quota."""
    if remaining <= 1:
        subject = "You're almost out of generations!"
        message = f"You have {remaining} generation(s) remaining this month. Upgrade to Pro for unlimited access!"
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@example.com',
            [user_email]
        )
