from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired


class LoginForm(FlaskForm):
    username = StringField('Email', validators=[DataRequired()],
                           render_kw={"placeholder": "Email", "class": "text-muted"})
    password = PasswordField('Contraseña', validators=[DataRequired()], render_kw={"placeholder": "Contraseña"})
    remember_me = BooleanField('Recuérdame')
    submit = SubmitField('Ingresar')


class RegisterForm(FlaskForm):
    name = StringField('Nombre', validators=[DataRequired()])
    lastname = StringField('Apellido', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired()])
    password = PasswordField('Contraseña', validators=[DataRequired()])
    password_confirm = PasswordField('Confirmar contraseña', validators=[DataRequired()])
    submit = SubmitField('Crear cuenta')
