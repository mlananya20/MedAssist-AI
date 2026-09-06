"""
Module 9 API routes:
GET /api/hospitals/geocode?address=...        -> lat/lon from a typed address
GET /api/hospitals/nearby?lat=..&lon=..        -> nearby hospitals/clinics + emergency number
"""
from flask import Blueprint, request, jsonify
from utils.hospital_utils import geocode_address, find_nearby_medical, get_emergency_number
from utils.auth_utils import token_required

hospital_bp = Blueprint("hospital_bp", __name__)


@hospital_bp.route("/geocode", methods=["GET"])
@token_required
def geocode():
    address = request.args.get("address", "").strip()
    if not address:
        return jsonify({"error": "address query param is required"}), 400

    try:
        location = geocode_address(address)
    except Exception:
        return jsonify({"error": "Could not reach the geocoding service"}), 502

    if not location:
        return jsonify({"error": "No location found for that address"}), 404

    return jsonify(location)


@hospital_bp.route("/nearby", methods=["GET"])
@token_required
def nearby():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    country_code = request.args.get("country_code", "")

    if lat is None or lon is None:
        return jsonify({"error": "lat and lon query params are required"}), 400

    try:
        results = find_nearby_medical(lat, lon)
    except Exception:
        return jsonify({"error": "Could not reach the hospital search service"}), 502

    return jsonify({
        "results": results,
        "emergency_number": get_emergency_number(country_code),
    })
