from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from django.db.models import F
import psutil
import requests
from .models import (
    CacheableTrackTransition,
    PerformanceMetric,
    ScalingEvent
)


@shared_task
def update_cache_statistics():
    """Update cache hit statistics for track transitions."""
    transitions = CacheableTrackTransition.objects.all()
    for transition in transitions:
        if cache.get(transition.cache_key):
            transition.hit_count = F('hit_count') + 1
            transition.save(update_fields=['hit_count', 'last_accessed'])


@shared_task
def monitor_system_health():
    """Collect and store system health metrics."""
    # CPU Usage
    cpu_usage = psutil.cpu_percent(interval=1)
    PerformanceMetric.objects.create(
        metric_type='cpu_usage',
        value=cpu_usage,
        server_instance=get_instance_id()
    )

    # Memory Usage
    memory = psutil.virtual_memory()
    PerformanceMetric.objects.create(
        metric_type='memory_usage',
        value=memory.percent,
        server_instance=get_instance_id()
    )

    # Request Count and Response Time from load balancer metrics
    try:
        metrics = get_load_balancer_metrics()
        PerformanceMetric.objects.create(
            metric_type='request_count',
            value=metrics['request_count'],
            server_instance=get_instance_id()
        )
        PerformanceMetric.objects.create(
            metric_type='response_time',
            value=metrics['avg_response_time'],
            server_instance=get_instance_id()
        )
    except Exception as e:
        print(f"Error fetching load balancer metrics: {e}")


@shared_task
def trigger_auto_scaling():
    """Evaluate metrics and trigger auto-scaling if needed."""
    current_instances = get_current_instance_count()
    
    # Get recent performance metrics
    recent_metrics = PerformanceMetric.objects.filter(
        timestamp__gte=timezone.now() - timezone.timedelta(minutes=5)
    )
    
    # Calculate averages
    cpu_avg = recent_metrics.filter(
        metric_type='cpu_usage'
    ).aggregate(avg_value=models.Avg('value'))['avg_value'] or 0
    
    memory_avg = recent_metrics.filter(
        metric_type='memory_usage'
    ).aggregate(avg_value=models.Avg('value'))['avg_value'] or 0
    
    # Scale up conditions
    if cpu_avg > 80 or memory_avg > 85:
        new_instance_count = current_instances + 1
        scale_reason = f"High resource usage - CPU: {cpu_avg}%, Memory: {memory_avg}%"
        trigger_metric = recent_metrics.filter(
            metric_type='cpu_usage'
        ).latest('timestamp')
        
        ScalingEvent.objects.create(
            event_type='scale_up',
            trigger_metric=trigger_metric,
            instances_before=current_instances,
            instances_after=new_instance_count,
            reason=scale_reason
        )
        
        scale_instances(new_instance_count)
    
    # Scale down conditions
    elif cpu_avg < 30 and memory_avg < 40 and current_instances > 1:
        new_instance_count = current_instances - 1
        scale_reason = f"Low resource usage - CPU: {cpu_avg}%, Memory: {memory_avg}%"
        trigger_metric = recent_metrics.filter(
            metric_type='cpu_usage'
        ).latest('timestamp')
        
        ScalingEvent.objects.create(
            event_type='scale_down',
            trigger_metric=trigger_metric,
            instances_before=current_instances,
            instances_after=new_instance_count,
            reason=scale_reason
        )
        
        scale_instances(new_instance_count)


def get_instance_id():
    """Get current server instance ID."""
    try:
        response = requests.get(
            'http://169.254.169.254/latest/meta-data/instance-id',
            timeout=1
        )
        return response.text
    except:
        return 'local-development'


def get_load_balancer_metrics():
    """Get metrics from load balancer."""
    # Implementation depends on your load balancer (e.g., AWS ELB, nginx)
    return {
        'request_count': 0,
        'avg_response_time': 0
    }


def get_current_instance_count():
    """Get current number of running instances."""
    # Implementation depends on your cloud provider (e.g., AWS EC2)
    return 1


def scale_instances(count):
    """Scale instances to specified count."""
    # Implementation depends on your cloud provider (e.g., AWS Auto Scaling)
    pass
