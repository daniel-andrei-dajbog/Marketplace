from flask import request, jsonify
from app.services import service_bp  
from app.models import Provider, Service
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

@service_bp.route('/create', methods=['POST'])
@jwt_required()
def create_service():
    data = request.get_json()
    title = data.get('title')
    price = data.get('price')

    if not title or not price:
        return jsonify({'message': 'Titlul și prețul sunt obligatorii.'}), 400

    current_user_id = get_jwt_identity()

    provider = Provider.query.filter_by(user_id=current_user_id).first()
    if not provider:
        return jsonify({'message': 'Doar utlizatorii conectati ca provideri pot adauga servicii'}), 403
    
    existing_service = Service.query.filter_by(title=title, price=price, provider_id=provider.id).first()
    if existing_service:
        return jsonify({'message': 'Ai deja un serviciu adăugat cu acest nume si pret.'}), 400
    
    new_service = Service(title=data.get('title'), price=data.get('price'), provider_id=provider.id)

    db.session.add(new_service)
    db.session.commit()

    return jsonify({'message': 'Produs creat cu succes'}), 201

@service_bp.route('/me', methods=['GET'])
@jwt_required()
def get_services():
    current_user_id = get_jwt_identity()

    provider = Provider.query.filter_by(user_id=current_user_id).first()
    if not provider:
        return jsonify({'message': 'Profilul de provider nu a fost găsit.'}), 404

    services = Service.query.filter_by(provider_id=provider.id).all()
    
    services_list = []
    for s in services:
        services_list.append({
            'id': s.id,
            'title': s.title,
            'price': s.price
        })

    return jsonify(services_list), 200

@service_bp.route('/update/<int:service_id>', methods=['PATCH'])
@jwt_required()
def update_service(service_id):
    data = request.get_json()
    title = data.get('title')
    price = data.get('price')

    current_user_id = get_jwt_identity()

    provider = Provider.query.filter_by(user_id=current_user_id).first()
    if not provider:
        return jsonify({'message': 'Doar utlizatorii conectati ca provideri pot modifica servicii'}), 403

    service = Service.query.filter_by(id=service_id, provider_id=provider.id).first()
    if not service:
        return jsonify({'message': 'Serviciul nu a fost gasit'}), 404
    
    if title:
        service.title = title
    if price is not None:
        service.price = price

    db.session.commit()

    return jsonify({'message': 'Serviciul a fost actualizat cu succes'}), 200

@service_bp.route('/delete/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    current_user_id = get_jwt_identity()

    provider = Provider.query.filter_by(user_id=current_user_id).first()
    if not provider:
        return jsonify({'message': 'Doar utilizatorii conectati ca provideri pot sterge servicii'}), 403
    
    service = Service.query.filter_by(id=service_id, provider_id=provider.id).first()
    if not service:
        return jsonify({'message': 'Serviciul pe care doriti sa il stergeti nu a fost gasit'}), 404
    
    db.session.delete(service)
    db.session.commit()

    return jsonify({'message': 'Serviciul a fost eliminat cu succes'}), 200