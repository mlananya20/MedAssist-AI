"""
MedAssist AI - Backend Entry Point
Run with: python app.py
"""
from flask import Flask
from flask_cors import CORS

from api.predict_routes import predict_bp
from api.profile_routes import profile_bp
from api.auth_routes import auth_bp
from api.history_routes import history_bp
from api.analytics_routes import analytics_bp
from api.report_routes import report_bp
from api.hospital_routes import hospital_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {"status": "ok", "service": "MedAssist AI backend"}

    app.register_blueprint(predict_bp, url_prefix="/api/predict")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(report_bp, url_prefix="/api/report")
    app.register_blueprint(hospital_bp, url_prefix="/api/hospitals")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
