import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [row[0] for row in cursor.fetchall()]
print("All tables in db.sqlite3:")
for t in tables:
    print(f"  - {t}")

# Check if custom_reports exists
if 'custom_reports' in tables:
    print("\n'custom_reports' table EXISTS. Checking contents...")
    cursor.execute("SELECT COUNT(*) FROM custom_reports")
    count = cursor.fetchone()[0]
    print(f"  Row count: {count}")
    
    # Show columns
    cursor.execute("PRAGMA table_info(custom_reports)")
    cols = cursor.fetchall()
    print("  Columns:")
    for col in cols:
        print(f"    {col[1]} ({col[2]})")
else:
    print("\n'custom_reports' table does NOT exist.")

# Check if reports table exists
if 'reports' in tables:
    print("\n'reports' table EXISTS. Checking contents...")
    cursor.execute("SELECT COUNT(*) FROM reports")
    count = cursor.fetchone()[0]
    print(f"  Row count: {count}")

# Check migration state
print("\nMigration state for custom_admin:")
cursor.execute("SELECT name, applied FROM django_migrations WHERE app='custom_admin' ORDER BY id")
for row in cursor.fetchall():
    print(f"  {row[0]} (applied: {row[1]})")

conn.close()
