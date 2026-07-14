from flask import request, jsonify
from app.provider_profiles import provider_bp  
from app.models import Provider, User 
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

@provider_bp.route('/create', methods=['POST'])
@jwt_required()
def create_profile():
    data = request.get_json()
    current_user_id = get_jwt_identity()

    user = User.query.get(current_user_id)
    if not user or user.role != 'provider':
        return jsonify({'message': 'Doar furnizorii pot avea un profil de Provider'}), 403
    
    existing_profile = Provider.query.filter_by(user_id=current_user_id).first()
    if existing_profile:
        return jsonify({'message': 'Profilul exista deja'}), 400
    
    new_profile = Provider(
        name=data.get('name'), 
        city=data.get('city'), 
        user_id=current_user_id
    )

    db.session.add(new_profile)
    db.session.commit()

    return jsonify({'message': 'Profil creat cu succes'}), 201


@provider_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    profile = Provider.query.filter_by(user_id=current_user_id).first()

    if not profile:
        return jsonify({'message': 'Profilul nu a fost gasit'}), 404
    
    return jsonify({
        'id': profile.id,
        'nume': profile.name,
        'oras': profile.city
    }), 200


@provider_bp.route('/update', methods=['PATCH'])
@jwt_required()
def update_user():
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    profile = Provider.query.filter_by(user_id=current_user_id).first()

    if not profile:
        return jsonify({'message': 'Profilul nu a fost gasit'}), 404
    
    profile.name = data.get('name', profile.name)
    profile.city = data.get('city', profile.city)

    db.session.commit()

    return jsonify({'message': 'Profil actualizat cu succes'}), 200