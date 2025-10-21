from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Drops all tables for the user_management app'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name LIKE 'user_management_%'
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            if tables:
                self.stdout.write(f'Dropping tables: {", ".join(tables)}')
                cursor.execute(f'DROP TABLE {", ".join(tables)} CASCADE')
                self.stdout.write(self.style.SUCCESS('Successfully dropped tables'))
            else:
                self.stdout.write('No tables to drop')