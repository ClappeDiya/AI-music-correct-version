from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Check if shared schema exists'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'shared';")
            result = cursor.fetchone()
            if result:
                self.stdout.write(self.style.SUCCESS('Shared schema exists'))
            else:
                self.stdout.write(self.style.WARNING('Shared schema does not exist'))