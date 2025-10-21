from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Create shared schema'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("CREATE SCHEMA shared;")
            self.stdout.write(self.style.SUCCESS('Successfully created shared schema'))