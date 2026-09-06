"""
Module 6 API route: GET /api/analytics/
Returns aggregated stats from the logged-in user's prediction history,
plus the Decision Tree vs Random Forest accuracy saved during training.
"""
import os
import joblib
from flask import Blueprint, jsonify, g
from database.prediction_repository import get_history
from utils.analytics_utils import compute_analytics
from utils.auth_utils import token_required

analytics_bp = Blueprint("analytics_bp", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPARISON_PATH = os.path.join(BASE_DIR, "ml", "saved_models", "model_comparison.pkl")


def _load_model_accuracy():
    try:
        comparison = joblib.load(COMPARISON_PATH)
        return {
            "decision_tree": comparison.get("decision_tree_accuracy"),
            "random_forest": comparison.get("random_forest_accuracy"),
        }
    except FileNotFoundError:
        return {}


@analytics_bp.route("/", methods=["GET"])
@token_required
def get_analytics():
    history = get_history(g.user_id)
    stats = compute_analytics(history, model_comparison_accuracy=_load_model_accuracy())
    return jsonify(stats)
