import json
import logging
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.db.models import F
from user_management.models import UserSubscription, UsageForecast
from sklearn.linear_model import LinearRegression
import numpy as np

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Run predictive scaling analysis and adjust resources'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days to forecast'
        )

    def handle(self, *args, **options):
        days = options['days']
        logger.info(f"Starting predictive scaling analysis for {days} days")
        
        # Get active subscriptions
        subscriptions = UserSubscription.objects.filter(is_active=True)
        
        for subscription in subscriptions:
            try:
                # Get historical usage data
                usage_data = subscription.current_usage.get('history', [])
                
                if len(usage_data) >= 3:  # Need at least 3 data points
                    # Prepare data for prediction
                    X = np.array(range(len(usage_data))).reshape(-1, 1)
                    y = np.array(usage_data)
                    
                    # Train simple linear regression model
                    model = LinearRegression()
                    model.fit(X, y)
                    
                    # Predict future usage
                    future_X = np.array(range(len(usage_data), len(usage_data) + days)).reshape(-1, 1)
                    predictions = model.predict(future_X)
                    
                    # Create forecast record
                    forecast = UsageForecast(
                        user=subscription.user,
                        forecast_date=datetime.now().date(),
                        predicted_usage={
                            'predictions': predictions.tolist(),
                            'confidence_interval': [min(predictions), max(predictions)]
                        },
                        confidence_level=0.95,  # Placeholder value
                        recommended_action=self.get_recommended_action(predictions[-1], subscription)
                    )
                    forecast.save()
                    
                    # Update subscription with scaling decision
                    self.apply_scaling(subscription, forecast)
                    
            except Exception as e:
                logger.error(f"Error processing subscription {subscription.id}: {str(e)}")
                continue

        logger.info("Predictive scaling analysis completed")

    def get_recommended_action(self, predicted_usage, subscription):
        """Determine recommended scaling action based on predicted usage"""
        current_usage = subscription.current_usage.get('current', 0)
        plan_limit = subscription.plan.features.get('usage_limit', 100)  # Default limit
        
        if predicted_usage > plan_limit * 1.2:
            return 'scale_up'
        elif predicted_usage < plan_limit * 0.8:
            return 'scale_down'
        return 'maintain'

    def apply_scaling(self, subscription, forecast):
        """Apply scaling decisions to subscription"""
        scaling_action = forecast.recommended_action
        scaling_history = subscription.scaling_history
        
        # Record scaling action
        scaling_history.append({
            'date': datetime.now().isoformat(),
            'action': scaling_action,
            'forecast_id': forecast.id,
            'details': {
                'predicted_usage': forecast.predicted_usage,
                'current_usage': subscription.current_usage
            }
        })
        
        # Update subscription
        subscription.scaling_history = scaling_history
        subscription.last_usage_check = datetime.now()
        
        if scaling_action == 'scale_up':
            # Implement scaling up logic
            subscription.auto_scaling_enabled = True
            # Add actual scaling implementation here
            
        elif scaling_action == 'scale_down':
            # Implement scaling down logic
            subscription.auto_scaling_enabled = True
            # Add actual scaling implementation here
            
        subscription.save()