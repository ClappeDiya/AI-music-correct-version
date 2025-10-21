"""
Management command to generate test JWT tokens for API testing.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.token_utils import get_tokens_for_user, create_test_user
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Generate a JWT token for testing API authentication'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='testuser',
                            help='Username for the test user')
        parser.add_argument('--email', type=str, default='test@example.com',
                            help='Email for the test user')
        parser.add_argument('--password', type=str, default='password123!',
                            help='Password for the test user')
        parser.add_argument('--create', action='store_true',
                            help='Create the user if it does not exist')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        create = options['create']
        
        if create:
            result = create_test_user(username, email, password)
            user = result['user']
            tokens = result['tokens']
            
            self.stdout.write(self.style.SUCCESS(f'User created/found: {user.username}'))
            self.stdout.write(self.style.SUCCESS(f'Access token: {tokens["access"]}'))
            self.stdout.write(self.style.SUCCESS(f'Refresh token: {tokens["refresh"]}'))
            
            # Print copy-paste friendly auth header
            self.stdout.write("\n" + "-" * 80)
            self.stdout.write("Copy and paste this into localStorage in your browser console:")
            self.stdout.write('localStorage.setItem("auth_token", "' + tokens["access"] + '");')
            self.stdout.write("-" * 80 + "\n")
            
            # Print curl example
            self.stdout.write("Example curl command to test the API:")
            self.stdout.write(f'curl -H "Authorization: Bearer {tokens["access"]}" http://localhost:8000/api/v1/music-education/educators/')
            self.stdout.write("-" * 80)
            
        else:
            try:
                user = User.objects.get(username=username)
                tokens = get_tokens_for_user(user)
                
                self.stdout.write(self.style.SUCCESS(f'Generated tokens for existing user: {user.username}'))
                self.stdout.write(self.style.SUCCESS(f'Access token: {tokens["access"]}'))
                self.stdout.write(self.style.SUCCESS(f'Refresh token: {tokens["refresh"]}'))
                
                # Print copy-paste friendly auth header
                self.stdout.write("\n" + "-" * 80)
                self.stdout.write("Copy and paste this into localStorage in your browser console:")
                self.stdout.write('localStorage.setItem("auth_token", "' + tokens["access"] + '");')
                self.stdout.write("-" * 80 + "\n")
                
                # Print curl example
                self.stdout.write("Example curl command to test the API:")
                self.stdout.write(f'curl -H "Authorization: Bearer {tokens["access"]}" http://localhost:8000/api/v1/music-education/educators/')
                self.stdout.write("-" * 80)
                
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User {username} does not exist. Use --create to create it.'))
