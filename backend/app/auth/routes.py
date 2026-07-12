from flask import request, jsonify
from app.auth import auth_bp
from app import db
from app.models import User
from flask_jwt_extended import create_access_token

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'client')

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email-ul exista deja"}), 400

    new_user = User(email=email, role=role)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Utilizator creat cu succes!"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Date de autentificare invalide"}), 401

    access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": access_token, "role": user.role}), 200