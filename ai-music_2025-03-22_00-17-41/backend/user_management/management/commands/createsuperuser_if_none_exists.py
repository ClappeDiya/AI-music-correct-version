from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Creates a superuser if none exists'

    def handle(self, *args, **kwargs):
        if User.objects.filter(is_superuser=True).count() == 0:
            username = 'admin'
            email = 'admin@example.com'
            password = 'admin'
            User.objects.create_superuser(username, email, password)
            self.stdout.write(f'Superuser created - username: {username}, password: {password}')
        else:
            self.stdout.write('Superuser already exists')