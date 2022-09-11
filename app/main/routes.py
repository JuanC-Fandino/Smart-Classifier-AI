from flask import render_template, request
from flask_login import login_required
from app.cnn.CNN import CNN
from app.main import bp
red = CNN()


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


@bp.route("/infer", methods=["POST"])
def infer():
    data = request.json
    image = data['image']
    return red.infer(image)
