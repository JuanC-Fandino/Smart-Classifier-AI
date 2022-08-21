from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired


class LoginForm(FlaskForm):
    username = StringField('Usuario', validators=[DataRequired()], render_kw={"placeholder": "Usuario", "class": "text-muted"})
    password = PasswordField('Contraseña', validators=[DataRequired()], render_kw={"placeholder": "Contraseña"})
    remember_me = BooleanField('Recuérdame')
    submit = SubmitField('Ingresar')
