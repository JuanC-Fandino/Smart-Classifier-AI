import os
from datetime import timedelta
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):

    SECRET_KEY = "123123"
    DEBUG = True
    WTF_CSRF_ENABLED = False
    PERMANENT_SESSION_LIFETIME = timedelta(days=5)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')



