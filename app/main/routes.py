import base64

from flask import render_template, request
from flask_login import login_required
from app.cnn.CNN import CNN
import tensorflow as tf
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
    data = request.files
    if data:
        image = data["image"]
        image = image.read()
        image = tf.io.decode_image(image, channels=3)
    elif request.form:
        image = request.form["image"]
        offset = image.index(',') + 1
        img_bytes = base64.b64decode(image[offset:])
        image = tf.io.decode_image(img_bytes, channels=3)

    return red.infer(image)
