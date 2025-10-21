from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import connections, DEFAULT_DB_ALIAS
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Verifies missing tables for specific apps and runs makemigrations and migrate if needed.'

    def handle(self, *args, **options):
        target_apps = [
            'biometrics',
            'dj_personas',
            'emotional_journey',
            'hybrid_dj',
            'voice_chat',
            'voice_emotion',
            'vr_dj',
            'dj_chat',
            'monitoring',
            'backend'
        ]

        missing_tables = []
        connection = connections[DEFAULT_DB_ALIAS]
        cursor = connection.cursor()

        for app_label in target_apps:
            try:
                app_config = apps.get_app_config(app_label)
            except LookupError:
                self.stdout.write(self.style.WARNING(f"App '{app_label}' not found in INSTALLED_APPS. Skipping."))
                continue

            for model in app_config.get_models():
                # Skip unmanaged or abstract models
                if not model._meta.managed or model._meta.abstract:
                    continue

                # For the 'backend' app, only check specific models
                if app_label == 'backend' and model.__name__ not in [
                    'Recommendation', 'DynamicPreference', 'ThemePreference'
                ]:
                    continue

                table_name = model._meta.db_table
                cursor.execute(
                    "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = %s);",
                    [table_name]
                )
                exists = cursor.fetchone()[0]
                if not exists:
                    missing_tables.append((app_label, model.__name__, table_name))

        if missing_tables:
            self.stdout.write(self.style.WARNING("Missing Tables Detected for the following managed models:"))
            for app_label, model_name, table in missing_tables:
                self.stdout.write(f"  - {app_label}.{model_name}: expected table '{table}' not found.")
            self.stdout.write("\nRunning 'makemigrations' and 'migrate' for the affected apps...\n")
            call_command('makemigrations', interactive=False)
            call_command('migrate', interactive=False)
            self.stdout.write(self.style.SUCCESS("Migrations have been created and applied."))
        else:
            self.stdout.write(self.style.SUCCESS("No missing tables detected for managed models in target apps.")) 