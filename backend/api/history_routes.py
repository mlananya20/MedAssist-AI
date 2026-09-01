"""
Module 7 API route: GET /api/history/?disease=X&search=Y
"""
from flask import Blueprint, request, jsonify, g
from database.prediction_repository import get_history, get_distinct_diseases
from utils.auth_utils import token_required

history_bp = Blueprint("history_bp", __name__)


@history_bp.route("/", methods=["GET"])
@token_required
def list_history():
    disease = request.args.get("disease") or None
    search = request.args.get("search") or None

    history = get_history(g.user_id, disease=disease, search=search)
    diseases = get_distinct_diseases(g.user_id)

    return jsonify({"history": history, "diseases": diseases})
