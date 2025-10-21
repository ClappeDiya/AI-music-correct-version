from django.core.management.base import BaseCommand
from django.apps import apps
import inspect
from io import StringIO
from django.db import connections, DEFAULT_DB_ALIAS

class Command(BaseCommand):
    help = 'Audits Django apps for model fields, migration histories, and PostgreSQL schema integrity.'

    def handle(self, *args, **options):
        report_lines = []
        report_lines.append('==== Django Models Inspection ====')
        models_summary = {}

        # Iterate through all models in all installed apps
        for model in apps.get_models():
            model_info = {}
            model_info['app_label'] = model._meta.app_label
            model_info['model_name'] = model.__name__
            model_info['db_table'] = model._meta.db_table
            
            # Get all local concrete fields
            fields = []
            for field in model._meta.local_fields:
                field_info = {
                    'name': field.name,
                    'column': field.column,
                    'type': field.get_internal_type(),
                    'null': field.null,
                    'blank': field.blank,
                    'primary_key': field.primary_key,
                }
                fields.append(field_info)
            model_info['fields'] = fields

            # Get custom methods defined on the model (exclude inherited from django.db.models.Model)
            methods = []
            from django.db.models import Model
            for attr_name, attr_value in model.__dict__.items():
                if callable(attr_value) and not attr_name.startswith('_'):
                    # Only list if the method is not the same as the one from base Model
                    base_method = getattr(Model, attr_name, None)
                    if base_method != attr_value:
                        methods.append(attr_name)
            model_info['methods'] = list(set(methods))

            models_summary[model._meta.label] = model_info

        # Build report for models
        for label, info in models_summary.items():
            report_lines.append(f"\nModel: {label} (db_table: {info['db_table']})")
            report_lines.append("  Fields:")
            for field in info['fields']:
                report_lines.append(f"    - {field['name']} (column: {field['column']}, type: {field['type']}, null: {field['null']}, blank: {field['blank']}, pk: {field['primary_key']})")
            if info['methods']:
                report_lines.append("  Custom Methods:")
                for m in info['methods']:
                    report_lines.append(f"    - {m}")
            else:
                report_lines.append("  No custom methods detected.")

        # Migration history using showmigrations
        report_lines.append("\n==== Migration History ====")
        out = StringIO()
        from django.core.management import call_command
        call_command('showmigrations', stdout=out)
        migrations_output = out.getvalue()
        report_lines.append(migrations_output)

        # Database Schema Extraction using introspection for non-PostgreSQL DBs
        schema = {}
        connection = connections[DEFAULT_DB_ALIAS]
        engine = connection.settings_dict.get('ENGINE', '')
        if 'postgresql' in engine:
            report_lines.append("==== PostgreSQL Database Schema (public schema) ====")
            try:
                cursor = connection.cursor()
                cursor.execute("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, column_name;")
                rows = cursor.fetchall()
                for table_name, column_name, data_type in rows:
                    schema.setdefault(table_name, []).append((column_name, data_type))
                for table, columns in schema.items():
                    report_lines.append(f"\nTable: {table}")
                    for col, dtype in columns:
                        report_lines.append(f"    - {col}: {dtype}")
            except Exception as e:
                report_lines.append(f"Error retrieving PostgreSQL schema: {e}")
        else:
            report_lines.append("==== Database Schema (via introspection) ====")
            try:
                table_names = connection.introspection.table_names()
                for table in table_names:
                    cursor = connection.cursor()
                    description = connection.introspection.get_table_description(cursor, table)
                    columns = []
                    for column in description:
                        col_name = column[0]
                        # For many backends, type info might not be directly available
                        columns.append((col_name, ""))
                    schema[table] = columns
                for table, columns in schema.items():
                    report_lines.append(f"\nTable: {table}")
                    for col, dtype in columns:
                        report_lines.append(f"    - {col}: {dtype}")
            except Exception as e:
                report_lines.append(f"Error retrieving schema via introspection: {e}")

        # Integrity Check: Compare model fields with database schema
        report_lines.append("\n==== Integrity Check: Model Fields vs Database Schema ====")
        for label, info in models_summary.items():
            db_table = info['db_table']
            if db_table not in schema:
                report_lines.append(f"WARNING: Table {db_table} for model {label} not found in database schema.")
                continue
            db_columns = {col for col, _ in schema[db_table]}
            missing_fields = []
            for field in info['fields']:
                if field['column'] not in db_columns:
                    missing_fields.append(field['column'])
            if missing_fields:
                report_lines.append(f"Model {label} is missing columns in database: {missing_fields}")
            else:
                report_lines.append(f"Model {label}: All fields present in database.")

        # Final report output
        final_report = "\n".join(report_lines)
        self.stdout.write(final_report) 