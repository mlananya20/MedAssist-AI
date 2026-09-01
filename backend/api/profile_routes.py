"""
Module 3 API routes (now behind auth):
POST /api/profile/  -> update the logged-in user's profile
GET  /api/profile/   -> fetch the logged-in user's profile
"""
from flask import Blueprint, request, jsonify, g
from database.profile_repository import save_profile, get_profile
from utils.health_utils import calculate_bmi, bmi_category
from utils.auth_utils import token_required

profile_bp = Blueprint("profile_bp", __name__)


@profile_bp.route("/", methods=["POST"])
@token_required
def update_profile():
    data = request.get_json(silent=True) or {}
    user_id = g.user_id

    save_profile(
        user_id=user_id,
        age=data.get("age"),
        gender=data.get("gender"),
        height_cm=data.get("height_cm"),
        weight_kg=data.get("weight_kg"),
        medical_history=data.get("medical_history", ""),
        allergies=data.get("allergies", ""),
    )

    profile = get_profile(user_id)
    bmi = calculate_bmi(profile.get("weight_kg"), profile.get("height_cm"))
    return jsonify({
        "message": "Profile saved",
        "profile": profile,
        "bmi": bmi,
        "bmi_category": bmi_category(bmi),
    })


@profile_bp.route("/", methods=["GET"])
@token_required
def fetch_profile():
    profile = get_profile(g.user_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    bmi = calculate_bmi(profile.get("weight_kg"), profile.get("height_cm"))
    return jsonify({
        "profile": profile,
        "bmi": bmi,
        "bmi_category": bmi_category(bmi),
    })
