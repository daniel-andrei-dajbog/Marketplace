from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='client') 

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
class Provider(db.Model):
    __tablename__ = 'provider_profiles'

    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(120), nullable = False)
    city = db.Column(db.String(120), nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable = False, unique = True)

class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(100), nullable = False)
    price = db.Column(db.Float, nullable = False)
    provider_id = db.Column(db.Integer, db.ForeignKey('provider_profiles.id'), nullable = False)
    
class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key = True)
    date = db.Column(db.Date, nullable = False)
    start_time = db.Column(db.Time, nullable = False)
    end_time = db.Column(db.Time, nullable = False)
    status = db.Column(db.String(120), nullable = False)
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable = False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable = False)

class ServiceAvailability(db.Model):
    __tablename__ = 'service_availability'

    id = db.Column(db.Integer, primary_key = True)
    day_of_week = db.Column(db.Integer, nullable = False)
    start_time = db.Column(db.Time, nullable = False)
    end_time = db.Column(db.Time, nullable = False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable = False)