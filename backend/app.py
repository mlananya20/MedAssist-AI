"""
MedAssist AI - Backend Entry Point
Run with: python app.py
"""
from flask import Flask
from flask_cors import CORS

# Blueprints will be registered here as you build them (Module by Module)
# from api.predict_routes import predict_bp
# from api.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {"status": "ok", "service": "MedAssist AI backend"}

    # app.register_blueprint(predict_bp, url_prefix="/api/predict")
    # app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
