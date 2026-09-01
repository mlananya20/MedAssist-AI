"""
Module 7: Prediction history storage and retrieval.
"""
import json
from database.db import get_connection


def save_prediction(user_id, symptoms, predictions):
    top = predictions[0] if predictions else {}
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO predictions (user_id, symptoms, top_disease, confidence, all_predictions)
        VALUES (?, ?, ?, ?, ?)
    """, (
        user_id,
        json.dumps(symptoms),
        top.get("disease"),
        top.get("confidence"),
        json.dumps(predictions),
    ))
    conn.commit()
    conn.close()


def get_history(user_id, disease=None, search=None):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM predictions WHERE user_id = ?"
    params = [user_id]

    if disease:
        query += " AND top_disease = ?"
        params.append(disease)

    if search:
        query += " AND symptoms LIKE ?"
        params.append(f"%{search}%")

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        entry = dict(row)
        entry["symptoms"] = json.loads(entry["symptoms"])
        entry["all_predictions"] = json.loads(entry["all_predictions"])
        results.append(entry)
    return results


def get_distinct_diseases(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT DISTINCT top_disease FROM predictions WHERE user_id = ? AND top_disease IS NOT NULL",
        (user_id,),
    )
    rows = cursor.fetchall()
    conn.close()
    return [r["top_disease"] for r in rows]
