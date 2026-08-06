from django.apps import AppConfig
import sys
import os

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # Patch Django BaseContext.__copy__ for Python 3.14 compatibility
        try:
            from django.template.context import BaseContext
            
            def new_copy(self):
                duplicate = self.__class__.__new__(self.__class__)
                duplicate.__dict__.update(self.__dict__)
                duplicate.dicts = self.dicts[:]
                return duplicate
                
            BaseContext.__copy__ = new_copy
            print("Successfully monkey-patched Django BaseContext.__copy__ for Python 3.14 compatibility.")
        except Exception as patch_err:
            print(f"Failed to patch Django BaseContext: {patch_err}")

        # Clean up old extra admin template folder
        try:
            from django.conf import settings
            import shutil
            old_admin_templates = os.path.join(settings.BASE_DIR, 'admin', 'templates', 'admin')
            if os.path.exists(old_admin_templates):
                shutil.rmtree(old_admin_templates)
                print("Successfully cleaned up extra duplicate admin template folder.")
        except Exception as clean_err:
            pass

        # Run migrations only once in the auto-reloader process
        if 'runserver' in sys.argv and os.environ.get('RUN_MAIN') != 'true':
            return
        
        try:
            from django.db import connection
            existing_tables = connection.introspection.table_names()
            
            # 1. Identify which required Django admin/auth tables are missing
            required_django_tables = ['auth_user', 'django_admin_log', 'django_content_type', 'django_session']
            missing_django_tables = [t for t in required_django_tables if t not in existing_tables]
            
            # If any system tables are missing, restore them while preserving custom user data
            if missing_django_tables:
                print(f"System tables {missing_django_tables} are missing! Restoring them while preserving your custom user data...")
                
                # Delete migration history for system apps so Django's migrate command recreates them
                cursor = connection.cursor()
                try:
                    cursor.execute("DELETE FROM django_migrations WHERE app IN ('auth', 'admin');")
                except Exception:
                    pass
                
                from django.core.management import call_command
                call_command('migrate', fake_initial=True)
                
                # Re-seed the default superuser (admin/Admin)
                try:
                    from django.contrib.auth.models import User
                    if not User.objects.filter(username='admin').exists():
                        User.objects.create_superuser('admin', 'admin@medisphere.com', 'Admin')
                        print("Created default Django superuser (admin/Admin) successfully!")
                except Exception as e:
                    print(f"Failed to create superuser: {e}")
            
            # 2. Run standard migrations to ensure all custom models are up-to-date
            from django.core.management import call_command
            print("Auto-running database migrations...")
            call_command('makemigrations')
            call_command('migrate', fake_initial=True)
            
            # Seed default admin user in standard auth_user if missing
            try:
                from django.contrib.auth.models import User
                if not User.objects.filter(username='admin').exists():
                    User.objects.create_superuser('admin', 'admin@medisphere.com', 'Admin')
            except Exception:
                pass
                
            # Seed default admin in our custom users table (UserProfile) if missing
            try:
                from accounts.models import UserProfile
                from django.contrib.auth.hashers import make_password
                if not UserProfile.objects.filter(email='admin@medisphere.com').exists() and not UserProfile.objects.filter(mobile_number='0000000000').exists():
                    UserProfile.objects.create(
                        email='admin@medisphere.com',
                        name='Administrator',
                        mobile_number='0000000000',
                        password=make_password('Admin'),
                        user_type='admin',
                        is_approved=True
                    )
                    print("Created default custom admin user profile.")
            except Exception as e:
                print(f"Failed to create custom admin user profile: {e}")
                
            # Ensure the users table has the pharmacy specific columns
            try:
                cursor = connection.cursor()
                cursor.execute("PRAGMA table_info(users);")
                columns = [row[1] for row in cursor.fetchall()]
                
                if 'open_from' not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN open_from VARCHAR(5) NULL;")
                    print("Added column open_from to users table.")
                if 'closes_from' not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN closes_from VARCHAR(5) NULL;")
                    print("Added column closes_from to users table.")
                if 'checkout_option' not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN checkout_option VARCHAR(50) NULL;")
                    print("Added column checkout_option to users table.")
            except Exception as schema_err:
                print(f"Failed to verify/alter users table columns: {schema_err}")

            # Ensure orders and order_items tables exist
            try:
                cursor = connection.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS orders (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        order_id TEXT NOT NULL UNIQUE,
                        user_id INTEGER NOT NULL,
                        pharmacy_id INTEGER NOT NULL,
                        total_price REAL NOT NULL DEFAULT 0,
                        order_type TEXT NOT NULL DEFAULT 'normal',
                        delivery_method TEXT NOT NULL DEFAULT 'pickup',
                        status TEXT NOT NULL DEFAULT 'pending',
                        created_at TEXT NOT NULL,
                        FOREIGN KEY(user_id) REFERENCES users(id),
                        FOREIGN KEY(pharmacy_id) REFERENCES users(id)
                    );
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS order_items (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        order_id TEXT NOT NULL,
                        medicine_id INTEGER NOT NULL,
                        quantity INTEGER NOT NULL DEFAULT 1,
                        price REAL NOT NULL DEFAULT 0,
                        FOREIGN KEY(order_id) REFERENCES orders(order_id),
                        FOREIGN KEY(medicine_id) REFERENCES medicines(id)
                    );
                """)
                print("Orders and order_items tables verified/created successfully.")
            except Exception as order_err:
                print(f"Failed to create orders tables: {order_err}")
                
            # 3. Clean up only the actual unwanted tables (auth groups, permissions, etc.)
            # NEVER drop auth_user, auth_permission, or django_admin_log!
            try:
                cursor = connection.cursor()
                unwanted = [
                    'auth_group', 'auth_group_permissions', 
                    'auth_user_groups', 'auth_user_user_permissions'
                ]
                for t in unwanted:
                    cursor.execute(f"DROP TABLE IF EXISTS {t};")
                print("Dropped unwanted database tables successfully.")
            except Exception as drop_err:
                print(f"Failed to drop unwanted tables: {drop_err}")
                
        except Exception as e:
            print(f"Database setup failed: {e}")
