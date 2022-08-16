from flask import render_template
from flask_login import login_required
from app.main import bp


@bp.route("/", methods=["POST", "GET"])
def home():
    return render_template("home.html", title="Home")


@bp.route("/white", methods=["GET"])
def white():
    return render_template("white.html")


@bp.route("/black", methods=["GET"])
def black():
    return render_template("black.html")


@bp.route("/green", methods=["GET"])
def green():
    return render_template("green.html")
