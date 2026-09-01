"""
Module 13: User account storage (separate from health profile data).
"""
from database.db import get_connection


def create_user(email, password_hash):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (user_id, email, password_hash) VALUES (?, ?, ?)",
        (email, email, password_hash),
    )
    conn.commit()
    conn.close()


def get_user_by_email(email):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
