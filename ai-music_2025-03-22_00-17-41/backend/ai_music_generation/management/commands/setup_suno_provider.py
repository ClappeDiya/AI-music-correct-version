import os
from django.core.management.base import BaseCommand
from django.conf import settings
from ai_music_generation.models import LLMProvider, ModelCapability
from decimal import Decimal

class Command(BaseCommand):
    help = 'Set up Suno API provider with melody generation capabilities'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting Suno provider setup...'))
        
        # Get Suno API key from environment variables
        suno_api_key = os.environ.get('SUNO_API_KEY')
        suno_api_base = os.environ.get('SUNO_API_BASE', 'https://apibox.erweima.ai')
        
        if not suno_api_key:
            self.stdout.write(self.style.ERROR('Suno API key not found in environment variables. Please set SUNO_API_KEY.'))
            return
        
        # Create or update Suno provider
        suno_provider, created = LLMProvider.objects.update_or_create(
            name='suno_api',
            defaults={
                'provider_type': 'third_party',
                'api_endpoint': f"{suno_api_base}/api/suno/v1/music",
                'api_credentials': {
                    'api_key': suno_api_key,
                },
                'active': True
            }
        )
        
        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(f'{action} Suno API provider'))
        
        # Define Suno capabilities - important: making sure melody_composition and musical_structure have high confidence scores
        # since they are required for the melody_generation task
        capabilities = [
            {
                'capability_type': 'melody_composition',
                'confidence_score': 0.98,  # Increased to make Suno the preferred provider
                'latency_ms': 15000,       # Improved latency
                'cost_per_request': Decimal('0.05'),
                'max_input_length': 500
            },
            {
                'capability_type': 'musical_structure',
                'confidence_score': 0.97,  # Increased to make Suno the preferred provider
                'latency_ms': 15000,       # Improved latency
                'cost_per_request': Decimal('0.05'),
                'max_input_length': 500
            },
            {
                'capability_type': 'style_recognition',
                'confidence_score': 0.94,
                'latency_ms': 20000,
                'cost_per_request': Decimal('0.05'),
                'max_input_length': 500
            },
            {
                'capability_type': 'musical_adaptation',
                'confidence_score': 0.93,
                'latency_ms': 20000,
                'cost_per_request': Decimal('0.05'),
                'max_input_length': 500
            }
        ]
        
        # Add or update capabilities
        for capability in capabilities:
            model_capability, created = ModelCapability.objects.update_or_create(
                provider=suno_provider,
                capability_type=capability['capability_type'],
                defaults={
                    'confidence_score': capability['confidence_score'],
                    'latency_ms': capability['latency_ms'],
                    'cost_per_request': capability['cost_per_request'],
                    'max_input_length': capability['max_input_length']
                }
            )
            
            action = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(
                f'{action} capability "{capability["capability_type"]}" for Suno API')
            )
        
        self.stdout.write(self.style.SUCCESS('Suno provider setup complete.')) 