"""
Module 3: Save and fetch user health profiles.
"""
from database.db import get_connection


def save_profile(user_id, age, gender, height_cm, weight_kg, medical_history="", allergies=""):
    """Creates a profile if it doesn't exist, or updates it if it does (upsert)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO user_profiles (user_id, age, gender, height_cm, weight_kg, medical_history, allergies, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            age=excluded.age,
            gender=excluded.gender,
            height_cm=excluded.height_cm,
            weight_kg=excluded.weight_kg,
            medical_history=excluded.medical_history,
            allergies=excluded.allergies,
            updated_at=CURRENT_TIMESTAMP
    """, (user_id, age, gender, height_cm, weight_kg, medical_history, allergies))
    conn.commit()
    conn.close()


def get_profile(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
