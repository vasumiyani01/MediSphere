from django.apps import AppConfig


class AdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'custom_admin'
    label = 'custom_admin'

    def ready(self):


        try:
            from django.db import connection
            cursor = connection.cursor()
            # Enable WAL mode and synchronous NORMAL for SQLite database to prevent locks and boost write speed
            try:
                cursor.execute("PRAGMA journal_mode=WAL;")
                cursor.execute("PRAGMA synchronous=NORMAL;")
                print("Successfully enabled WAL mode and NORMAL synchronization for SQLite.")
            except Exception as wal_err:
                print(f"Error setting WAL mode: {wal_err}")
            
            # Check if specialization column exists in users table, if not add it
            try:
                cursor.execute("SELECT specialization FROM users LIMIT 1;")
            except Exception:
                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN specialization VARCHAR(100) NULL;")
                    print("Added specialization column to users table.")
                except Exception as ex:
                    print(f"Error adding specialization column: {ex}")
            
            # Check if age column exists in users table, if not add it
            try:
                cursor.execute("SELECT age FROM users LIMIT 1;")
            except Exception:
                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN age INTEGER NULL;")
                    print("Added age column to users table.")
                except Exception as ex:
                    print(f"Error adding age column: {ex}")

            # Check if gender column exists in users table, if not add it
            try:
                cursor.execute("SELECT gender FROM users LIMIT 1;")
            except Exception:
                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN gender VARCHAR(20) NULL;")
                    print("Added gender column to users table.")
                except Exception as ex:
                    print(f"Error adding gender column: {ex}")
            
            # Run template conversion script on startup
            try:
                import os
                import shutil
                from django.conf import settings
                base = settings.BASE_DIR
                


                # 2. doctors/dashboard -> templates/doctors/dashboard.html
                dst_dir = os.path.join(base, 'doctors', 'templates', 'doctors')
                os.makedirs(dst_dir, exist_ok=True)
                jsx_path = os.path.join(dst_dir, 'dashboard.jsx')
                html_path = os.path.join(dst_dir, 'dashboard.html')
                if os.path.exists(jsx_path):
                    shutil.copy2(jsx_path, html_path)
                    os.remove(jsx_path)
                    print("Converted doctors dashboard.jsx to dashboard.html")
                
                src = os.path.join(base, 'doctors', 'dashboard.html')
                if os.path.exists(src):
                    shutil.copy2(src, html_path)
                    os.remove(src)
                    print("Moved doctors/dashboard.html to templates")

                # 3. pharmacies/dashboard -> templates/pharmacies/dashboard.html
                dst_dir = os.path.join(base, 'pharmacies', 'templates', 'pharmacies')
                os.makedirs(dst_dir, exist_ok=True)
                jsx_path = os.path.join(dst_dir, 'dashboard.jsx')
                html_path = os.path.join(dst_dir, 'dashboard.html')
                if os.path.exists(jsx_path):
                    shutil.copy2(jsx_path, html_path)
                    os.remove(jsx_path)
                    print("Converted pharmacies dashboard.jsx to dashboard.html")
                
                src = os.path.join(base, 'pharmacies', 'dashboard.html')
                if os.path.exists(src):
                    shutil.copy2(src, html_path)
                    os.remove(src)
                    print("Moved pharmacies/dashboard.html to templates")

                # 4. citizens/dashboard -> templates/citizens/dashboard.html
                dst_dir = os.path.join(base, 'citizens', 'templates', 'citizens')
                os.makedirs(dst_dir, exist_ok=True)
                jsx_path = os.path.join(dst_dir, 'dashboard.jsx')
                html_path = os.path.join(dst_dir, 'dashboard.html')
                if os.path.exists(jsx_path):
                    shutil.copy2(jsx_path, html_path)
                    os.remove(jsx_path)
                    print("Converted citizens dashboard.jsx to dashboard.html")
                
                src = os.path.join(base, 'citizens', 'dashboard.html')
                if os.path.exists(src):
                    shutil.copy2(src, html_path)
                    os.remove(src)
                    print("Moved citizens/dashboard.html to templates")

                # 5. Clean up old custom_admin login.jsx if it exists
                jsx_path = os.path.join(base, 'custom_admin', 'templates', 'custom_admin', 'login.jsx')
                if os.path.exists(jsx_path):
                    os.remove(jsx_path)
                    print("Removed old custom_admin/login.jsx")

                # 6. custom_admin/templates/custom_admin/dashboard.html -> custom_admin/templates/custom_admin/dashboard.jsx
                # Disabled to keep dashboard.html as requested.
                # src = os.path.join(base, 'custom_admin', 'templates', 'custom_admin', 'dashboard.html')
                # dst = os.path.join(base, 'custom_admin', 'templates', 'custom_admin', 'dashboard.jsx')
                # if os.path.exists(src):
                #     with open(src, 'r', encoding='utf-8') as f:
                #         content = f.read()
                #     content = content.replace('custom_admin/includes/logs.html', 'custom_admin/includes/logs.jsx')
                #     content = content.replace('custom_admin/includes/medicines.html', 'custom_admin/includes/medicines.jsx')
                #     content = content.replace('custom_admin/includes/overview.html', 'custom_admin/includes/overview.jsx')
                #     content = content.replace('custom_admin/includes/users.html', 'custom_admin/includes/users.jsx')
                #     with open(dst, 'w', encoding='utf-8') as f:
                #         f.write(content)
                #     os.remove(src)
                #     print("Converted custom_admin/dashboard.html to dashboard.jsx")

                # 7. custom_admin/templates/custom_admin/includes/*.html -> custom_admin/templates/custom_admin/includes/*.jsx
                inc_dir = os.path.join(base, 'custom_admin', 'templates', 'custom_admin', 'includes')
                if os.path.exists(inc_dir):
                    for filename in os.listdir(inc_dir):
                        if filename.endswith('.html'):
                            src = os.path.join(inc_dir, filename)
                            dst = os.path.join(inc_dir, filename[:-5] + '.jsx')
                            shutil.copy2(src, dst)
                            os.remove(src)
                            print(f"Converted include {filename} to .jsx")
                
                # 8. accounts/LoginModal.jsx -> accounts/templates/accounts/LoginModal.jsx
                src = os.path.join(base, 'accounts', 'LoginModal.jsx')
                dst_dir = os.path.join(base, 'accounts', 'templates', 'accounts')
                os.makedirs(dst_dir, exist_ok=True)
                dst = os.path.join(dst_dir, 'LoginModal.jsx')
                if os.path.exists(src):
                    shutil.copy2(src, dst)
                    os.remove(src)
                    print("Moved accounts/LoginModal.jsx to templates/accounts/")
            except Exception as ex:
                print(f"Error converting templates: {ex}")
        except Exception as e:
            print(f"Error in ready startup script: {e}")
