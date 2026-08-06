from django.apps import AppConfig


class PharmaciesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pharmacies'

    def ready(self):
        # Initialize SQLite tables on startup
        try:
            from django.db import connection
            cursor = connection.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS inventory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    medicine_id INTEGER NOT NULL,
                    mfg_date TEXT NOT NULL,
                    expiry_date TEXT NOT NULL,
                    stock INTEGER NOT NULL,
                    price REAL NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(medicine_id) REFERENCES medicines(id)
                );
            """)

            # Check if bills table needs migration
            try:
                cursor.execute("PRAGMA table_info(bills);")
                columns = [col[1] for col in cursor.fetchall()]
                if columns:
                    if 'medicine_id' in columns:
                        cursor.execute("DROP TABLE IF EXISTS bills;")
                        print("Dropped old bills table for multiple items migration.")
                    elif 'sgst' not in columns:
                        cursor.execute("ALTER TABLE bills ADD COLUMN subtotal REAL DEFAULT 0.0;")
                        cursor.execute("ALTER TABLE bills ADD COLUMN sgst REAL DEFAULT 0.0;")
                        cursor.execute("ALTER TABLE bills ADD COLUMN cgst REAL DEFAULT 0.0;")
                        cursor.execute("ALTER TABLE bills ADD COLUMN discount REAL DEFAULT 0.0;")
                        print("Added subtotal, sgst, cgst, and discount columns to bills table.")
            except Exception as drop_err:
                print(f"Failed to migrate old bills table: {drop_err}")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS bills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pharmacy_id INTEGER NOT NULL,
                    user_id INTEGER NULL,
                    customer_name TEXT NOT NULL,
                    subtotal REAL NOT NULL DEFAULT 0.0,
                    sgst REAL NOT NULL DEFAULT 0.0,
                    cgst REAL NOT NULL DEFAULT 0.0,
                    discount REAL NOT NULL DEFAULT 0.0,
                    total_price REAL NOT NULL DEFAULT 0.0,
                    bill_type TEXT NOT NULL,
                    payment_method TEXT NOT NULL,
                    bill_date TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(pharmacy_id) REFERENCES users(id),
                    FOREIGN KEY(user_id) REFERENCES users(id)
                );
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS bill_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bill_id INTEGER NOT NULL,
                    medicine_id INTEGER NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    price REAL NOT NULL,
                    FOREIGN KEY(bill_id) REFERENCES bills(id) ON DELETE CASCADE,
                    FOREIGN KEY(medicine_id) REFERENCES medicines(id)
                );
            """)
            print("Pharmacy inventory, bills, and bill_items SQLite tables verified/created successfully.")
        except Exception as e:
            print(f"Failed to create pharmacy tables: {e}")
