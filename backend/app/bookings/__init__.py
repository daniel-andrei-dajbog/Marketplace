from flask import Blueprint

booking_bp = Blueprint('bookings', __name__)

from app.bookings import routes 