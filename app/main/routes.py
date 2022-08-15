from flask import render_template
from flask_login import login_required
from app.main import bp


@bp.route("/", methods=["POST", "GET"])
def home():
    return render_template("home.html", title="Home", pagina_actual="HOME")
