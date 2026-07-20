from flask import request, jsonify
from app.auth import auth_bp
from app import db
from app.models import User, UserProfile, Provider
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'client')

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email-ul exista deja"}), 400

    new_user = User(email=email, role=role)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.flush()

    if role == 'client':
        new_client = UserProfile(user_id=new_user.id, name='', wallet_balance=500.00)
        if hasattr(new_client, 'oras'):
            new_client.oras = ''
        elif hasattr(new_client, 'city'):
            new_client.city = ''
        db.session.add(new_client)

    elif role == 'provider':
        new_provider = Provider(user_id=new_user.id)
        if hasattr(new_provider, 'nume'):
            new_provider.nume = ''
        elif hasattr(new_provider, 'name'):
            new_provider.name = ''
        if hasattr(new_provider, 'oras'):
            new_provider.oras = ''
        elif hasattr(new_provider, 'city'):
            new_provider.city = ''
        db.session.add(new_provider)

        new_profile = UserProfile(user_id=new_user.id, name='', wallet_balance=500.00)
        db.session.add(new_profile)

    db.session.commit()
    return jsonify({"message": "Utilizator creat cu succes!"}), 201

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Date de autentificare invalide"}), 401

    access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": access_token, "role": user.role}), 200

@auth_bp.route('/profile', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_profile():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Utilizator inexistent"}), 404
        
    user_profile = UserProfile.query.filter_by(user_id=current_user_id).first()
    wallet_balance = float(user_profile.wallet_balance) if user_profile else 0.00

    name = ''
    city = ''

    if user.role == "client":
        if user_profile:
            name = user_profile.name or ''
            if hasattr(user_profile, 'oras'):
                city = user_profile.oras or ''
            elif hasattr(user_profile, 'city'):
                city = user_profile.city or ''
                
    elif user.role == "provider":
        provider_profile = Provider.query.filter_by(user_id=current_user_id).first()
        if provider_profile:
            if hasattr(provider_profile, 'nume'):
                name = provider_profile.nume or ''
            elif hasattr(provider_profile, 'name'):
                name = provider_profile.name or ''
                
            if hasattr(provider_profile, 'oras'):
                city = provider_profile.oras or ''
            elif hasattr(provider_profile, 'city'):
                city = provider_profile.city or ''

    return jsonify({
        "name": name,
        "wallet_balance": wallet_balance,
        "role": user.role,
        "oras": city,
        "city": city
    }), 200

@auth_bp.route('/profile/update', methods=['POST', 'PUT', 'OPTIONS'])
@jwt_required()
def update_profile():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Utilizator inexistent"}), 404

    data = request.get_json()
    new_name = data.get('name')
    new_city = data.get('oras') or data.get('city')

    if user.role == "client":
        user_profile = UserProfile.query.filter_by(user_id=current_user_id).first()
        if not user_profile:
            user_profile = UserProfile(user_id=current_user_id)
            db.session.add(user_profile)
            
        user_profile.name = new_name
        if hasattr(user_profile, 'oras'):
            user_profile.oras = new_city
        elif hasattr(user_profile, 'city'):
            user_profile.city = new_city
            
    elif user.role == "provider":
        provider_profile = Provider.query.filter_by(user_id=current_user_id).first()
        if not provider_profile:
            provider_profile = Provider(user_id=current_user_id)
            db.session.add(provider_profile)
            
        if hasattr(provider_profile, 'nume'):
            provider_profile.nume = new_name
        elif hasattr(provider_profile, 'name'):
            provider_profile.name = new_name
            
        if hasattr(provider_profile, 'oras'):
            provider_profile.oras = new_city
        elif hasattr(provider_profile, 'city'):
            provider_profile.city = new_city

    db.session.commit()
    return jsonify({"message": "Profil actualizat cu succes!"}), 200