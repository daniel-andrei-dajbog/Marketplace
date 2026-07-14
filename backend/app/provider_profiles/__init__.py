from flask import Blueprint

provider_bp = Blueprint('provider_profiles', __name__)

from app.provider_profiles import routes 