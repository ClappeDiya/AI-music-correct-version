from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import ReportSchedule, Report, ReportResult
from .utils import generate_report_data

@shared_task
def process_report_schedule(schedule_id: int):
    """Process a single report schedule."""
    try:
        schedule = ReportSchedule.objects.get(id=schedule_id)
        
        if not schedule.is_active:
            return "Schedule is inactive"
        
        # Generate report data
        report_data = generate_report_data(schedule.report)
        
        # Create report result
        ReportResult.objects.create(
            report=schedule.report,
            generated_data=report_data,
            generated_at=timezone.now()
        )
        
        # Schedule next run based on cron expression
        schedule_next_run(schedule)
        
        return "Report generated successfully"
    except ReportSchedule.DoesNotExist:
        return f"Schedule {schedule_id} not found"
    except Exception as e:
        return f"Error processing schedule: {str(e)}"

@shared_task
def cancel_scheduled_reports(schedule_id: int):
    """Cancel any pending scheduled reports."""
    try:
        schedule = ReportSchedule.objects.get(id=schedule_id)
        schedule.next_run = None
        schedule.save()
        return "Scheduled reports cancelled"
    except ReportSchedule.DoesNotExist:
        return f"Schedule {schedule_id} not found"
    except Exception as e:
        return f"Error cancelling schedule: {str(e)}"

@shared_task
def check_and_process_schedules():
    """Check for due schedules and process them."""
    now = timezone.now()
    due_schedules = ReportSchedule.objects.filter(
        is_active=True,
        next_run__lte=now
    )
    
    for schedule in due_schedules:
        process_report_schedule.delay(schedule.id)

def schedule_next_run(schedule: ReportSchedule):
    """Calculate and set the next run time for a schedule."""
    from croniter import croniter
    
    base = timezone.now()
    cron = croniter(schedule.schedule_cron, base)
    next_run = cron.get_next(timezone.datetime)
    
    schedule.next_run = next_run
    schedule.save()

@shared_task
def cleanup_old_results():
    """Clean up old report results based on retention policy."""
    retention_days = 30  # Configure as needed
    cutoff_date = timezone.now() - timedelta(days=retention_days)
    
    ReportResult.objects.filter(generated_at__lt=cutoff_date).delete()
