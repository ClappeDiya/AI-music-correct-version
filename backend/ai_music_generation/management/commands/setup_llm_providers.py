import os
import json
from django.core.management.base import BaseCommand
from django.conf import settings
from ai_music_generation.models import LLMProvider


class Command(BaseCommand):
    help = 'Set up LLM providers with API keys from environment variables'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting LLM provider setup...'))
        
        # Setup OpenAI provider
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        openai_model = os.environ.get('OPENAI_MODEL', 'gpt-4')
        
        if openai_api_key:
            openai_provider, created = LLMProvider.objects.update_or_create(
                name='openai_gpt4',
                defaults={
                    'provider_type': 'third_party',
                    'api_endpoint': 'https://api.openai.com/v1/chat/completions',
                    'api_credentials': {
                        'api_key': openai_api_key,
                        'model': openai_model
                    },
                    'active': True
                }
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{action} OpenAI LLM provider'))
        else:
            self.stdout.write(self.style.WARNING('OpenAI API key not found in environment variables'))
        
        # Setup Anthropic provider
        anthropic_api_key = os.environ.get('ANTHROPIC_API_KEY')
        anthropic_model = os.environ.get('ANTHROPIC_MODEL', 'claude-2')
        
        if anthropic_api_key:
            anthropic_provider, created = LLMProvider.objects.update_or_create(
                name='anthropic_claude',
                defaults={
                    'provider_type': 'third_party',
                    'api_endpoint': 'https://api.anthropic.com/v1/messages',
                    'api_credentials': {
                        'api_key': anthropic_api_key,
                        'model': anthropic_model
                    },
                    'active': True
                }
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{action} Anthropic LLM provider'))
        
        # Setup Replicate provider
        replicate_api_key = os.environ.get('REPLICATE_API_KEY')
        
        if replicate_api_key:
            replicate_provider, created = LLMProvider.objects.update_or_create(
                name='replicate_music',
                defaults={
                    'provider_type': 'third_party',
                    'api_endpoint': 'https://api.replicate.com/v1/predictions',
                    'api_credentials': {
                        'api_key': replicate_api_key,
                    },
                    'active': True
                }
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{action} Replicate provider'))
            
        # Setup Stability AI provider
        stability_api_key = os.environ.get('STABILITY_API_KEY')
        
        if stability_api_key:
            stability_provider, created = LLMProvider.objects.update_or_create(
                name='stability_ai',
                defaults={
                    'provider_type': 'third_party',
                    'api_endpoint': 'https://api.stability.ai/v1/generation',
                    'api_credentials': {
                        'api_key': stability_api_key,
                    },
                    'active': True
                }
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{action} Stability AI provider'))
            
        # Setup Hugging Face provider
        huggingface_api_key = os.environ.get('HUGGINGFACE_API_KEY')
        
        if huggingface_api_key:
            huggingface_provider, created = LLMProvider.objects.update_or_create(
                name='huggingface',
                defaults={
                    'provider_type': 'third_party',
                    'api_endpoint': 'https://api-inference.huggingface.co/models',
                    'api_credentials': {
                        'api_key': huggingface_api_key,
                    },
                    'active': True
                }
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{action} Hugging Face provider'))
        
        self.stdout.write(self.style.SUCCESS('LLM provider setup complete.'))
