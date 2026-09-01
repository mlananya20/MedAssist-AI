"""
Module 1 API route: POST /api/predict/
Requires a valid JWT (Authorization: Bearer <token>).
Expects JSON: {"symptoms": ["fever", "headache", "fatigue"]}
"""
from flask import Blueprint, request, jsonify, g
from ml.predict import predict_disease, explain_prediction, compare_models
from database.profile_repository import get_profile
from database.prediction_repository import save_prediction
from utils.health_utils import get_personalized_recommendations
from utils.auth_utils import token_required

predict_bp = Blueprint("predict_bp", __name__)


@predict_bp.route("/", methods=["POST"])
@token_required
def predict():
    data = request.get_json(silent=True) or {}
    symptoms = data.get("symptoms", [])
    user_id = g.user_id

    if not symptoms or not isinstance(symptoms, list):
        return jsonify({"error": "Please provide a non-empty 'symptoms' list"}), 400

    predictions, unmatched = predict_disease(symptoms)
    explanation = explain_prediction(symptoms)
    model_comparison = compare_models(symptoms)

    save_prediction(user_id, symptoms, predictions)

    profile = get_profile(user_id)
    top_disease = predictions[0]["disease"] if predictions else None

    return jsonify({
        "predictions": predictions,
        "explanation": explanation,
        "model_comparison": model_comparison,
        "unmatched_symptoms": unmatched,
        "personalized_recommendations": get_personalized_recommendations(profile, top_disease),
    })
