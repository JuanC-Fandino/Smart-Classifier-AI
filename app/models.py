import enum
from datetime import datetime

from app import login, db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash


class PredictionType(enum.Enum):
    Aluminio = 0
    Carton = 1
    Contenedor_Plastico = 2
    Organico = 3
    Papel = 4
    Tetra_Pak = 5
    Vidrio = 6


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    last_name = db.Column(db.String(64))
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return '<User {}>'.format(self.username)


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


class PredictionRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    datetime = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    prediction_type = db.Column(db.Enum(PredictionType))
    confidence = db.Column(db.Float)
    isAccurate = db.Column(db.Boolean, default=None)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User', backref=db.backref('predictions', lazy='dynamic'))

    def __repr__(self):
        return '<PredictionRecord {}>'.format(self.prediction_type)
