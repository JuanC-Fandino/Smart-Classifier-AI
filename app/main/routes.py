import base64
import datetime

from flask import render_template, request, Response, jsonify
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
    else:
        prediction = PredictionRecord(prediction_type=result["prediction"], confidence=result["confidence"])
        db.session.add(prediction)
        db.session.commit()

    result["id"] = prediction.id

    return result


@bp.route("/statistics", methods=["GET"])
@login_required
def statistics():
    records = current_user.predictions.order_by(PredictionRecord.datetime.desc()).all()
    return render_template("statistics.html", title="Statistics", records=records)


@bp.route("/statistics/sorted", methods=["GET"])
@login_required
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
@login_required
def dashboard():
    users = User.query.count()
    predictions = PredictionRecord.query.count()
    average_confidence = PredictionRecord.query.with_entities(db.func.avg(PredictionRecord.confidence)).scalar()
    all_confidence = PredictionRecord.query.with_entities(PredictionRecord.confidence).all()
    average_confidence = round(average_confidence, 2)
    all_confidence = [confidence[0] for confidence in all_confidence]
    standard_deviation = round((sum([(confidence - average_confidence) ** 2 for confidence in all_confidence]) / (len(
        all_confidence) - 1)) ** 0.5, 2)

    predictions_with_feedback = PredictionRecord.query.filter(PredictionRecord.isAccurate != None).count()
    correct_predictions = PredictionRecord.query.filter_by(isAccurate=True).count()
    correct_predictions_percentage = round(correct_predictions / predictions_with_feedback * 100, 2)

    return render_template("dashboard.html", title="Dashboard", users=users, predictions=predictions,
                           average_confidence=average_confidence, standard_deviation=standard_deviation,
                           correct_predictions_percentage=correct_predictions_percentage)


@bp.route("/dashboard/statistics_per_day", methods=["GET"])
@login_required
def statistics_per_day():
    records = PredictionRecord.query.with_entities(
        db.func.date(PredictionRecord.datetime),
        db.func.count(PredictionRecord.datetime)).group_by(
        db.func.date(PredictionRecord.datetime)).all()

    results_array = []
    for record in records:
        results = {"datetime": record[0], "count": record[1]}
        results_array.append(results)

    return jsonify(results_array)


@bp.route("/dashboard/users_per_day", methods=["GET"])
@login_required
def users_per_day():
    records = User.query.with_entities(
        db.func.date(User.created_at),
        db.func.count(User.created_at)).group_by(
        db.func.date(User.created_at)).where(
        User.created_at >= f'{datetime.datetime.utcnow() - datetime.timedelta(days=7)}').all()

    results_array = []
    for record in records:
        results = {"datetime": record[0], "count": record[1]}
        results_array.append(results)

    return jsonify(results_array)


@bp.route("/dashboard/predictions_per_type", methods=["GET"])
@login_required
def predictions_per_type():
    records = PredictionRecord.query.with_entities(
        PredictionRecord.prediction_type,
        db.func.count(PredictionRecord.prediction_type)).group_by(
        PredictionRecord.prediction_type).all()

    results_array = []
    for record in records:
        results = {"type": record[0].name, "count": record[1]}
        results_array.append(results)

    return jsonify(results_array)


@bp.route("/dashboard/percentage_accurate_predictions/<prediction_type>", methods=["GET"])
@login_required
def percentage_accurate_predictions(prediction_type):
    predicitons_with_feedback = PredictionRecord.query.filter(PredictionRecord.isAccurate != None, PredictionRecord.prediction_type == prediction_type).count()
    correct_predictions = PredictionRecord.query.filter_by(isAccurate=True, prediction_type=prediction_type).count()
    try:
        correct_predictions_percentage = round(correct_predictions / predicitons_with_feedback * 100, 2)
    except ZeroDivisionError:
        correct_predictions_percentage = "No hay datos suficientes"

    return jsonify(correct_predictions_percentage)


@bp.route("/accuracy", methods=["POST"])
def attach_accuracy_to_prediction():
    data = request.form
    prediction_id = data["prediction_id"]
    accuracy = True if data["is_accurate"] == "true" else False
    prediction = PredictionRecord.query.filter_by(id=prediction_id).first()
    prediction.isAccurate = accuracy
    db.session.commit()

    return Response(status=200)
