"""
Module 6: Aggregates prediction history into dashboard-ready stats.
"""
from collections import Counter
from datetime import datetime, timedelta


def compute_analytics(history, model_comparison_accuracy=None):
    """
    history: list of dicts from prediction_repository.get_history()
    Each entry has: symptoms (list), top_disease, confidence, created_at, all_predictions
    """
    total_predictions = len(history)

    if total_predictions == 0:
        return {
            "total_predictions": 0,
            "disease_distribution": [],
            "most_common_symptoms": [],
            "weekly_trend": [],
            "average_confidence": 0,
            "model_accuracy": model_comparison_accuracy or {},
        }

    # Disease distribution
    disease_counts = Counter(h["top_disease"] for h in history if h.get("top_disease"))
    disease_distribution = [
        {"disease": disease, "count": count}
        for disease, count in disease_counts.most_common(8)
    ]

    # Most common symptoms (flatten all reported symptoms)
    symptom_counts = Counter()
    for h in history:
        for s in h.get("symptoms", []):
            symptom_counts[s] += 1
    most_common_symptoms = [
        {"symptom": s.replace("_", " ").title(), "count": c}
        for s, c in symptom_counts.most_common(8)
    ]

    # Average confidence
    confidences = [h["confidence"] for h in history if h.get("confidence") is not None]
    average_confidence = round(sum(confidences) / len(confidences), 1) if confidences else 0

    # Weekly trend — predictions per day over the last 7 days
    today = datetime.utcnow().date()
    day_counts = {(today - timedelta(days=i)): 0 for i in range(6, -1, -1)}
    for h in history:
        try:
            created = datetime.fromisoformat(h["created_at"]).date()
            if created in day_counts:
                day_counts[created] += 1
        except (ValueError, KeyError):
            continue
    weekly_trend = [
        {"date": day.strftime("%b %d"), "count": count}
        for day, count in day_counts.items()
    ]

    return {
        "total_predictions": total_predictions,
        "disease_distribution": disease_distribution,
        "most_common_symptoms": most_common_symptoms,
        "weekly_trend": weekly_trend,
        "average_confidence": average_confidence,
        "model_accuracy": model_comparison_accuracy or {},
    }
