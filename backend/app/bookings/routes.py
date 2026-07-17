from flask import request, jsonify
from app.bookings import booking_bp  
from app.models import User, Booking, Service, Provider
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

@booking_bp.route('/create/<int:service_id>', methods=['POST'])
@jwt_required()
def create_booking(service_id):
    data = request.get_json()
    current_user_id = get_jwt_identity()

    user = User.query.filter_by(id=current_user_id).first()
    if not user:
        return jsonify({'message': 'Trebuie sa fii logat pentru a putea rezerva servicii'}), 403
    
    service = Service.query.filter_by(id=service_id).first()
    if not service:
        return jsonify({'message': 'Serviciul nu a fost gasit'}), 404
    
    provider = Provider.query.filter_by(user_id=current_user_id).first()
    if provider and service.provider_id == provider.id:
        return jsonify({'message': 'Eroare: Nu iti poti rezerva propriul serviciu!'}), 400

    try:
        date_str = data.get('date')
        start_str = data.get('start_time')

        booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        start_time = datetime.strptime(start_str, '%H:%M').time()

        start_datetime = datetime.strptime(f"{date_str} {start_str}", "%Y-%m-%d %H:%M")
        duration_minutes = 60  
        end_datetime = start_datetime + timedelta(minutes=duration_minutes)
        end_time = end_datetime.time()

        new_booking = Booking(
            date=booking_date,
            start_time=start_time,
            end_time=end_time,
            status='pending',
            client_id=current_user_id,
            service_id=service.id
        )

        db.session.add(new_booking)
        db.session.commit()

        return jsonify({'message': 'Rezervarea a fost efectuata cu succes'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Eroare la procesarea datelor rezervarii: {str(e)}'}), 400
    
@booking_bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def get_my_bookings():
    current_user_id = get_jwt_identity()

    user = User.query.filter_by(id=current_user_id).first()
    if not user:
        return jsonify({'message': 'Trebuie sa fi logat pentru a putea vedea rezervarile facute'}), 403
    
    bookings = Booking.query.filter_by(client_id=current_user_id).all()

    booking_list = []
    for b in bookings:
        booking_list.append({
            'id': b.id,
            'Data': b.date.strftime('%Y-%m-%d'),
            'Ora inceperii': b.start_time.strftime('%H:%M'),
            'Ora finalizarii': b.end_time.strftime('%H:%M'),
            'Status': b.status
        })
    
    return jsonify(booking_list), 200

@booking_bp.route('/<int:booking_id>/status', methods=['PATCH'])
@jwt_required()
def verify_status(booking_id):
    data = request.get_json()
    current_user_id = get_jwt_identity()

    status = data.get('status')
    if status not in ('confirmed', 'rejected', 'cancelled'):
        return jsonify({'message': 'A aparut o eroara la status'}), 400
    
    booking = Booking.query.filter_by(id=booking_id).first()
    if not booking:
        return jsonify({'message': 'Rezervarea nu a fost gasita'}), 404
    
    provider_profile = Provider.query.filter_by(user_id=current_user_id).first()
    service = Service.query.filter_by(id=booking.service_id).first()

    if status == 'cancelled':
        is_client = str(booking.client_id) == str(current_user_id)
        is_provider = provider_profile and service and str(service.provider_id) == str(provider_profile.id)
        
        if not (is_client or is_provider):
            return jsonify({
                'message': 'Nu ai permisiunea de a anula aceasta rezervare',
                'debug_booking_client': str(booking.client_id),
                'debug_current_user': str(current_user_id)
            }), 403
        
    if status in ('confirmed', 'rejected'):
        if not provider_profile:
            return jsonify({'message': 'Nu ai un profil de furnizor activ'}), 403
            
        if not service or str(service.provider_id) != str(provider_profile.id):
            return jsonify({'message': 'Doar furnizorul acestui serviciu poate accepta sau refuza rezervarea'}), 403
        
    booking.status = status
    db.session.commit()

    return jsonify({'message': 'Cererea a fost tratata cu succes'}), 200

@booking_bp.route('/provider-bookings', methods=['GET'])
@jwt_required()
def get_provider_bookings():
    current_user_id = get_jwt_identity()

    provider = Provider.query.filter_by(user_id=current_user_id).first()
    if not provider:
        return jsonify({'message': 'Trebuie sa fi logat ca furnizor'}), 403
    
    service = Service.query.filter_by(provider_id=provider.id).all()
    if not service:
        return jsonify({'message': 'Serviciul nu a fost gasit'}), 404
    
    service_ids = [s.id for s in service]
    
    bookings = Booking.query.filter(Booking.service_id.in_(service_ids)).all()

    booking_list = []
    for b in bookings:
        booking_list.append({
            'id': b.id,
            'Data': b.date.strftime('%Y-%m-%d'),
            'Ora inceperii': b.start_time.strftime('%H:%M'),
            'Ora finalizarii': b.end_time.strftime('%H:%M'),
            'Status': b.status
        })

    return jsonify(booking_list), 200