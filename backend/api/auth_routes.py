"""
Module 13 API routes:
POST /api/auth/register  -> creates account + profile in one step, returns JWT
POST /api/auth/login     -> verifies credentials, returns JWT
"""
from flask import Blueprint, request, jsonify
from database.user_repository import create_user, get_user_by_email
from database.profile_repository import save_profile, get_profile
from utils.auth_utils import hash_password, verify_password, generate_token
from utils.health_utils import calculate_bmi, bmi_category

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if get_user_by_email(email):
        return jsonify({"error": "An account with this email already exists"}), 409

    create_user(email, hash_password(password))

    # Registration collects the full health profile in one step
    save_profile(
        user_id=email,
        age=data.get("age"),
        gender=data.get("gender"),
        height_cm=data.get("height_cm"),
        weight_kg=data.get("weight_kg"),
        medical_history=data.get("medical_history", ""),
        allergies=data.get("allergies", ""),
    )

    token = generate_token(email)
    profile = get_profile(email)
    bmi = calculate_bmi(profile.get("weight_kg"), profile.get("height_cm"))

    return jsonify({
        "token": token,
        "user_id": email,
        "profile": profile,
        "bmi": bmi,
        "bmi_category": bmi_category(bmi),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(email)
    profile = get_profile(email)
    bmi = calculate_bmi(profile.get("weight_kg"), profile.get("height_cm")) if profile else None

    return jsonify({
        "token": token,
        "user_id": email,
        "profile": profile,
        "bmi": bmi,
        "bmi_category": bmi_category(bmi) if bmi else None,
    })
