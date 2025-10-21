from django.test.runner import DiscoverRunner
from django.db import connections
import psycopg2

class SchemaTestRunner(DiscoverRunner):
    def setup_databases(self, **kwargs):
        # First create the test database
        old_config = super().setup_databases(**kwargs)
        
        # Get database connection parameters
        db_settings = connections['default'].settings_dict
        
        # Create raw connection to create schema in test database
        conn = psycopg2.connect(
            dbname=db_settings['TEST']['NAME'],
            user=db_settings['USER'],
            password=db_settings['PASSWORD'],
            host=db_settings['HOST'],
            port=db_settings['PORT']
        )
        conn.autocommit = True
        with conn.cursor() as cursor:
            cursor.execute("CREATE SCHEMA IF NOT EXISTS shared;")
        conn.close()
        
        return old_config