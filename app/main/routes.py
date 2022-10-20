import base64

from flask import render_template, request
from flask_login import login_required, current_user

from app import db
from app.cnn.CNN import CNN
import tensorflow as tf
from app.main import bp
from app.models import PredictionRecord, User

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

    result = red.infer(image)
    if current_user.is_authenticated:
        prediction = PredictionRecord(prediction_type=result["prediction"], user_id=current_user.id,
                                      confidence=result["confidence"])
        db.session.add(prediction)
        db.session.commit()

    return result


@bp.route("/statistics", methods=["GET"])
@login_required
def statistics():
    records = current_user.predictions.all()
    return render_template("statistics.html", title="Statistics", records=records)


@bp.route("/statistics/sorted", methods=["GET"])
def statistics_sorted():
    records = PredictionRecord.query.filter_by(user_id=current_user.id).with_entities(
        PredictionRecord.prediction_type,
        db.func.count(
            PredictionRecord.prediction_type)).group_by(
        PredictionRecord.prediction_type).all()

    results_array = []
    for record in records:
        results = {"prediction_type": record[0].name, "count": record[1]}
        results_array.append(results)

    return results_array


@bp.route("/dashboard", methods=["GET"])
def dashboard():
    users = User.query.count()
    predictions = PredictionRecord.query.count()
    average_confidence = PredictionRecord.query.with_entities(db.func.avg(PredictionRecord.confidence)).scalar()
    all_confidence = PredictionRecord.query.with_entities(PredictionRecord.confidence).all()
    # calculate the standard deviation
    average_confidence = round(average_confidence, 2)
    all_confidence = [confidence[0] for confidence in all_confidence]
    standard_deviation = round((sum([(confidence - average_confidence) ** 2 for confidence in all_confidence]) / (len(
        all_confidence) - 1)) ** 0.5, 2)

    return render_template("dashboard.html", title="Dashboard", users=users, predictions=predictions,
                           average_confidence=average_confidence, standard_deviation=standard_deviation)


@bp.route("/dashboard/statistics_per_day", methods=["GET"])
def statistics_per_day():
    # group the predictions by day
    records = PredictionRecord.query.with_entities(
        db.func.date(PredictionRecord.datetime),
        db.func.count(PredictionRecord.datetime)).group_by(
        db.func.date(PredictionRecord.datetime)).all()

    print(records)
    results_array = []
    for record in records:
        results = {"datetime": record[0], "count": record[1]}
        results_array.append(results)

    print(results_array)

    return results_array
