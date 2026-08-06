from django.apps import AppConfig


class CitizensConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'citizens'

    def ready(self):
        try:
            from django.core.management import call_command
            call_command('makemigrations', 'citizens', interactive=False)
            call_command('migrate', 'citizens', interactive=False)
            print("Successfully ran Django migrations for citizens programmatically.")
        except Exception as e:
            print(f"Failed to run citizens migrations programmatically: {e}")
