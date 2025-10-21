from django.core.management.base import BaseCommand, CommandError
from django.apps import apps
from django.db import connections, DEFAULT_DB_ALIAS


class Command(BaseCommand):
    help = "Fixes missing tables by creating them for models where tables are not present."

    def handle(self, *args, **options):
        connection = connections[DEFAULT_DB_ALIAS]
        existing_tables = connection.introspection.table_names()
        created_tables = []
        skipped_models = []
        errors = []

        for model in apps.get_models():
            # Only process models that are managed and not proxies
            if not model._meta.managed or model._meta.proxy:
                continue
            db_table = model._meta.db_table
            if db_table not in existing_tables:
                self.stdout.write(f"Table '{db_table}' for model '{model._meta.label}' is missing. Creating...")
                try:
                    with connection.schema_editor() as schema_editor:
                        schema_editor.create_model(model)
                    created_tables.append(db_table)
                except Exception as e:
                    errors.append(f"Error creating table '{db_table}' for model '{model._meta.label}': {e}")
            else:
                skipped_models.append(model._meta.label)

        if created_tables:
            self.stdout.write(self.style.SUCCESS(f"Created missing tables: {', '.join(created_tables)}"))
        else:
            self.stdout.write(self.style.WARNING("No missing tables found."))

        if errors:
            for err in errors:
                self.stdout.write(self.style.ERROR(err))
            raise CommandError("Some tables could not be created.")
        else:
            self.stdout.write(self.style.SUCCESS("All missing tables fixed successfully.")) 