from django.core.management.base import BaseCommand
from user_management.models import SubscriptionPlan, FeatureFlag

class Command(BaseCommand):
    help = 'Initialize subscription plans and feature flags'

    def handle(self, *args, **kwargs):
        # Create subscription plans
        plans = [
            {
                'name': 'Free',
                'price': 0.00,
                'duration_days': 30,
                'features': 'Basic music generation\nLimited exports\nStandard quality'
            },
            {
                'name': 'Pro',
                'price': 19.99,
                'duration_days': 30,
                'features': 'Advanced music generation\nUnlimited exports\nHigh quality\nPriority support'
            },
            {
                'name': 'Elite',
                'price': 49.99,
                'duration_days': 30,
                'features': 'Professional music generation\nUnlimited everything\nUltra high quality\nDedicated support\nCustom features'
            }
        ]

        for plan_data in plans:
            SubscriptionPlan.objects.get_or_create(
                name=plan_data['name'],
                defaults={
                    'price': plan_data['price'],
                    'duration_days': plan_data['duration_days'],
                    'features': plan_data['features']
                }
            )

        # Create feature flags
        features = [
            {
                'name': 'advanced_generation',
                'description': 'Access to advanced music generation features',
                'enabled_for_all': False
            },
            {
                'name': 'unlimited_exports',
                'description': 'Unlimited music exports',
                'enabled_for_all': False
            },
            {
                'name': 'high_quality',
                'description': 'High quality audio output',
                'enabled_for_all': False
            },
            {
                'name': 'priority_support',
                'description': 'Priority customer support',
                'enabled_for_all': False
            }
        ]

        for feature_data in features:
            feature, created = FeatureFlag.objects.get_or_create(
                name=feature_data['name'],
                defaults={
                    'description': feature_data['description'],
                    'enabled_for_all': feature_data['enabled_for_all']
                }
            )

            # Associate features with plans
            if feature.name == 'advanced_generation':
                feature.enabled_plans.add(
                    SubscriptionPlan.objects.get(name='Pro'),
                    SubscriptionPlan.objects.get(name='Elite')
                )
            elif feature.name in ['unlimited_exports', 'high_quality']:
                feature.enabled_plans.add(
                    SubscriptionPlan.objects.get(name='Pro'),
                    SubscriptionPlan.objects.get(name='Elite')
                )
            elif feature.name == 'priority_support':
                feature.enabled_plans.add(
                    SubscriptionPlan.objects.get(name='Elite')
                )

        self.stdout.write(self.style.SUCCESS('Successfully initialized subscription plans and feature flags'))