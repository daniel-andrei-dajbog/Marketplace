from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:parola123@localhost:5432/marketplace_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'cheie-secreta-si-foarte-lunga-pentru-practica-2026'

    db.init_app(app)
    jwt.init_app(app)

    from app.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.provider_profiles import provider_bp
    app.register_blueprint(provider_bp, url_prefix='/api/provider')

    from app.services import service_bp
    app.register_blueprint(service_bp, url_prefix='/api/services')

    from app.bookings import booking_bp
    app.register_blueprint(booking_bp, url_prefix='/api/bookings')

    with app.app_context():
        db.create_all()

    return app