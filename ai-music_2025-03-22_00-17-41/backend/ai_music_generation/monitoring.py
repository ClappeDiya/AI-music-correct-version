import logging
from datetime import datetime
from typing import Dict, Any, Optional
from django.conf import settings
from django.core.cache import cache
from .models import ModelUsageLog, AIMusicRequest, LLMProvider

logger = logging.getLogger(__name__)

class MusicGenerationMonitor:
    """
    Handles monitoring and logging for the AI Music Generation system.
    """
    
    @staticmethod
    def log_request(
        request_id: int,
        user_id: int,
        prompt: str,
        parameters: Dict[str, Any],
        provider: LLMProvider
    ) -> ModelUsageLog:
        """
        Log a new music generation request.
        """
        try:
            log_entry = ModelUsageLog.objects.create(
                request_id=request_id,
                user_id=user_id,
                prompt_sent=prompt,
                response_metadata={
                    'parameters': parameters,
                    'timestamp': datetime.now().isoformat(),
                    'status': 'initiated'
                },
                provider=provider
            )
            
            logger.info(f"Music generation request initiated - ID: {request_id}, User: {user_id}")
            return log_entry
            
        except Exception as e:
            logger.error(f"Failed to log music generation request: {str(e)}")
            raise

    @staticmethod
    def update_request_status(
        log_entry: ModelUsageLog,
        status: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Update the status and metadata of a request log.
        """
        try:
            current_metadata = log_entry.response_metadata or {}
            updated_metadata = {
                **current_metadata,
                'status': status,
                'updated_at': datetime.now().isoformat()
            }
            
            if metadata:
                updated_metadata.update(metadata)
            
            log_entry.response_metadata = updated_metadata
            log_entry.save()
            
            logger.info(f"Request {log_entry.request_id} status updated to {status}")
            
        except Exception as e:
            logger.error(f"Failed to update request status: {str(e)}")
            raise

    @staticmethod
    def log_error(
        log_entry: ModelUsageLog,
        error: Exception,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Log an error that occurred during music generation.
        """
        try:
            error_data = {
                'error_type': type(error).__name__,
                'error_message': str(error),
                'timestamp': datetime.now().isoformat()
            }
            
            if context:
                error_data['context'] = context
            
            current_metadata = log_entry.response_metadata or {}
            current_metadata['errors'] = current_metadata.get('errors', []) + [error_data]
            
            log_entry.response_metadata = current_metadata
            log_entry.save()
            
            logger.error(f"Error in request {log_entry.request_id}: {str(error)}", exc_info=True)
            
        except Exception as e:
            logger.error(f"Failed to log error: {str(e)}")
            raise

    @staticmethod
    def track_performance_metrics(
        log_entry: ModelUsageLog,
        metrics: Dict[str, Any]
    ) -> None:
        """
        Track performance metrics for a request.
        """
        try:
            current_metadata = log_entry.response_metadata or {}
            current_metadata['performance_metrics'] = metrics
            
            log_entry.response_metadata = current_metadata
            log_entry.save()
            
            # Cache performance metrics for monitoring
            cache_key = f'perf_metrics_{log_entry.request_id}'
            cache.set(cache_key, metrics, timeout=60*60*24)  # 24 hours
            
            logger.info(f"Performance metrics recorded for request {log_entry.request_id}")
            
        except Exception as e:
            logger.error(f"Failed to track performance metrics: {str(e)}")
            raise

    @staticmethod
    def detect_abuse(user_id: int) -> bool:
        """
        Check for potential abuse patterns.
        Returns True if abuse is detected.
        """
        try:
            # Check recent error rate
            recent_logs = ModelUsageLog.objects.filter(
                user_id=user_id,
                created_at__gte=datetime.now() - settings.ABUSE_CHECK_WINDOW
            )
            
            total_requests = recent_logs.count()
            if total_requests < settings.MIN_REQUESTS_FOR_ABUSE_CHECK:
                return False
            
            error_count = sum(
                1 for log in recent_logs
                if log.response_metadata and log.response_metadata.get('errors')
            )
            
            error_rate = error_count / total_requests
            if error_rate > settings.MAX_ERROR_RATE:
                logger.warning(f"High error rate detected for user {user_id}: {error_rate:.2%}")
                return True
            
            # Check for rapid successive requests
            timestamps = sorted(
                log.created_at for log in recent_logs
            )
            for i in range(1, len(timestamps)):
                time_diff = timestamps[i] - timestamps[i-1]
                if time_diff.total_seconds() < settings.MIN_REQUEST_INTERVAL:
                    logger.warning(f"Rapid requests detected for user {user_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to check for abuse: {str(e)}")
            return False

    @staticmethod
    def get_usage_statistics(user_id: int) -> Dict[str, Any]:
        """
        Get usage statistics for a user.
        """
        try:
            user_logs = ModelUsageLog.objects.filter(user_id=user_id)
            
            total_requests = user_logs.count()
            successful_requests = sum(
                1 for log in user_logs
                if log.response_metadata and log.response_metadata.get('status') == 'completed'
            )
            
            return {
                'total_requests': total_requests,
                'successful_requests': successful_requests,
                'success_rate': successful_requests / total_requests if total_requests > 0 else 0,
                'last_request': user_logs.latest('created_at').created_at if total_requests > 0 else None
            }
            
        except Exception as e:
            logger.error(f"Failed to get usage statistics: {str(e)}")
            return {} 