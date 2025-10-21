import stripe
import json
import logging
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from user_management.models import UserSubscription, SubscriptionHistory
from datetime import datetime

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_API_KEY

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f'Invalid payload: {str(e)}')
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f'Invalid signature: {str(e)}')
        return HttpResponse(status=400)

    # Handle the event
    if event['type'] == 'customer.subscription.created':
        handle_subscription_created(event['data']['object'])
    elif event['type'] == 'customer.subscription.updated':
        handle_subscription_updated(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_deleted(event['data']['object'])

    return HttpResponse(status=200)

def handle_subscription_created(subscription):
    try:
        user = User.objects.get(stripe_customer_id=subscription['customer'])
        plan = SubscriptionPlan.objects.get(stripe_price_id=subscription['items']['data'][0]['price']['id'])
        
        UserSubscription.objects.create(
            user=user,
            plan=plan,
            status=subscription['status'],
            start_date=datetime.fromtimestamp(subscription['current_period_start']),
            end_date=datetime.fromtimestamp(subscription['current_period_end']),
            stripe_subscription_id=subscription['id'],
            configuration={
                'stripe_data': subscription
            }
        )
        
        logger.info(f'Created subscription {subscription["id"]} for user {user.id}')
    except Exception as e:
        logger.error(f'Error creating subscription: {str(e)}')

def handle_subscription_updated(subscription):
    try:
        user_subscription = UserSubscription.objects.get(stripe_subscription_id=subscription['id'])
        user_subscription.status = subscription['status']
        user_subscription.start_date = datetime.fromtimestamp(subscription['current_period_start'])
        user_subscription.end_date = datetime.fromtimestamp(subscription['current_period_end'])
        user_subscription.configuration['stripe_data'] = subscription
        user_subscription.save()
        
        SubscriptionHistory.objects.create(
            subscription=user_subscription,
            event_type='updated',
            event_data=subscription
        )
        
        logger.info(f'Updated subscription {subscription["id"]} for user {user_subscription.user.id}')
    except UserSubscription.DoesNotExist:
        logger.error(f'Subscription {subscription["id"]} not found')
    except Exception as e:
        logger.error(f'Error updating subscription: {str(e)}')

def handle_subscription_deleted(subscription):
    try:
        user_subscription = UserSubscription.objects.get(stripe_subscription_id=subscription['id'])
        user_subscription.status = 'canceled'
        user_subscription.end_date = datetime.fromtimestamp(subscription['current_period_end'])
        user_subscription.save()
        
        SubscriptionHistory.objects.create(
            subscription=user_subscription,
            event_type='canceled',
            event_data=subscription
        )
        
        logger.info(f'Canceled subscription {subscription["id"]} for user {user_subscription.user.id}')
    except UserSubscription.DoesNotExist:
        logger.error(f'Subscription {subscription["id"]} not found')
    except Exception as e:
        logger.error(f'Error canceling subscription: {str(e)}')