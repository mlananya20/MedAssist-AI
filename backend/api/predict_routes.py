"""
Module 1 API route: POST /api/predict/
Expects JSON: {"symptoms": ["fever", "headache", "fatigue"]}
"""
from flask import Blueprint, request, jsonify
from ml.predict import predict_disease, explain_prediction, compare_models

predict_bp = Blueprint("predict_bp", __name__)


@predict_bp.route("/", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    symptoms = data.get("symptoms", [])

    if not symptoms or not isinstance(symptoms, list):
        return jsonify({"error": "Please provide a non-empty 'symptoms' list"}), 400

    predictions, unmatched = predict_disease(symptoms)
    explanation = explain_prediction(symptoms)
    model_comparison = compare_models(symptoms)

    return jsonify({
        "predictions": predictions,
        "explanation": explanation,
        "model_comparison": model_comparison,
        "unmatched_symptoms": unmatched,
    })
