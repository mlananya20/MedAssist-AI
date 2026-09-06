"""
Module 8 API route: POST /api/report/generate
Expects the same shape as a /api/predict response: symptoms, predictions,
explanation, personalized_recommendations. Returns a downloadable PDF.
"""
import os
from flask import Blueprint, request, jsonify, g, send_file
from database.profile_repository import get_profile
from reports.report_generator import generate_report
from utils.auth_utils import token_required

report_bp = Blueprint("report_bp", __name__)


@report_bp.route("/generate", methods=["POST"])
@token_required
def generate():
    data = request.get_json(silent=True) or {}
    symptoms = data.get("symptoms", [])
    predictions = data.get("predictions", [])
    explanation = data.get("explanation", [])
    recommendations = data.get("personalized_recommendations", [])

    if not symptoms or not predictions:
        return jsonify({"error": "symptoms and predictions are required"}), 400

    profile = get_profile(g.user_id)
    output_path = generate_report(
        user_id=g.user_id,
        profile=profile,
        symptoms=symptoms,
        predictions=predictions,
        explanation=explanation,
        recommendations=recommendations,
    )

    return send_file(
        output_path,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=os.path.basename(output_path),
    )
