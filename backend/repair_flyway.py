import psycopg2

conn_str = "postgresql://neondb_owner:npg_wY8TqbNr3VaI@ep-floral-hall-b4fh8o4f-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    cur.execute("DELETE FROM flyway_schema_history WHERE success = false;")
    conn.commit()
    print("Deleted failed flyway migrations.")
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()
