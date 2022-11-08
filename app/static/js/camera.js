var _model = undefined;
const video = document.getElementById('player');
video.onpause = function () {
    document.getElementById("spinner").style.display = "block"
    video.style.filter = "grayscale(100%)";
}

video.onplay = function () {
    document.getElementById("spinner").style.display = "none"
    video.style.filter = "grayscale(0%)";
}

if (getUserMediaSupported()) {
    enableCam();
} else {
    console.warn('getUserMedia() is not supported by your browser');
}

function load_model() {
    tf.loadGraphModel("../static/models/jsmodel/saved_model.json").then(model => {
        _model = model;
        if (getUserMediaSupported()) {
            enableCam();
        } else {
            console.warn('getUserMedia() is not supported by your browser');
        }
    });
}

// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function [TensorFlow.js - On Browser approach]
async function predictWebcam() {
    let image = tf.browser.fromPixels(video).resizeBilinear([256, 256]);

    // reshape the tensor to be a 4d
    image = image.reshape([-1, 256, 256, 3]);

    // normalize the image
    image = image.div(255.0);

    // call this function again to keep predicting when the browser is ready
    // window.requestAnimationFrame(predictWebcam);

    let predictions = await _model.predict(image).data();
    const classes = ['Aluminio', 'Carton', 'Envases_Plastico', 'Organicos', 'Papel', 'Plasticos', 'Tetra_Pak', 'Vidrio'];

    // get the model's prediction results
    let results = Array.from(predictions)
        .map(function (p, i) {
            return {
                probability: p,
                className: classes[i]
            };
        }).sort(function (a, b) {
            return b.probability - a.probability;
        }).slice(0, 8);

    const resultadosElemento = document.getElementById("results-box");
    document.getElementById("prediction").innerText = results[0].className + " - " + (Math.round(results[0].probability, 2)) + "%";
    var bolsa = "roja";
    switch (results[0].className) {
        case "Aluminio":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        case "Carton":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        case "Envases_Plastico":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        case "Organicos":
            resultadosElemento.style.backgroundColor = "black";
            bolsa = "negra";
            break;
        case "Papel":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        case "Plasticos":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        case "Tetra_Pak":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        case "Vidrio":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        default:
            resultadosElemento.style.backgroundColor = "black";
            bolsa = "negra";

    }
    document.getElementById("bag").innerText = bolsa;
}

// Enable the live webcam view and start classification.
function enableCam() {
    // getUsermedia parameters to force video but not audio.
    const constraints = {
        video: {
            facingMode: 'environment'
        }
    };
    // Get the video element and add the event listener for when the
    // video stream is ready to start.
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        // On Browser approach - Deprecated
        // video.addEventListener('loadeddata', predictWebcam);
        // On Backend approach - Automatic - Deprecated
        // video.addEventListener('loadeddata', getPredictionFromBackend);
        video.addEventListener('loadeddata', turnOnButton);
    });
}

function turnOnButton() {
    const botonEscanear = document.getElementById("scan_btn");
    botonEscanear.style.display = "flex";
}

// Call to the backend to get the prediction, send image as a form data file
function getPredictionFromBackend() {
    let canvas = document.createElement('canvas');

    canvas.width = 1920;
    canvas.height = 1080;

    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let image = canvas.toDataURL();
    let formData = new FormData();
    formData.append('image', image);

    // Freeze the video
    video.pause();


    fetch('/infer', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
        .then(data => {
            // Ocultar el contenido lateral y mostrar los resultados en su lugar
            const resultadosElemento = document.getElementById("results-box");
            const contenidoOriginal = document.getElementById("original-content");
            resultadosElemento.style.display = "block";
            contenidoOriginal.style.display = "none";

            // Poblamos los resultados
            const prediccion = document.getElementById("prediction");
            prediccion.innerText = data.prediction;
            const confianza = document.getElementById("confidence");
            confianza.innerText = `${data.confidence}%`;

            // Determinamos el color de la bolsa y mostramos la imagen correspondiente
            let bolsa;
            const bolsaElemento = document.getElementById("bag");
            const imagenResultado = document.getElementById("result-image");
            imagenResultado.src = image;
            bolsaElemento.style.color = "white";
            bolsaElemento.style.backgroundColor = "transparent";

            // Almacenamos el id de la predicción para poder enviarlo al backend en el feedback
            const id = document.getElementById("prediction_id");
            id.value = data.id;

            // Elegimos el color de la bolsa
            switch (data.prediction) {
                case "Aluminio":
                    bolsa = "blanca";
                    break;
                case "Carton":
                    bolsa = "blanca";
                    break;
                case "Envases_Plastico":
                    bolsa = "blanca";
                    break;
                case "Organicos":
                    bolsa = "verde";
                    bolsaElemento.style.color = "green";
                    break;
                case "Papel":
                    bolsa = "blanca";
                    break;
                case "Plasticos":
                    bolsa = "blanca";
                    break;
                case "Tetra_Pak":
                    bolsa = "blanca";
                    break;
                case "Vidrio":
                    bolsa = "blanca";
                    break;
                default:
                    bolsa = "negra";
                    bolsaElemento.style.color = "black";
                    bolsaElemento.style.backgroundColor = "white";
                    break;

            }
            bolsaElemento.innerText = bolsa;

            // Mostramos el componente de feedback
            const feedback = document.getElementById("feedback");
            feedback.style.display = "block";
            // Ocultamos el agradecimiento
            const thanksElement = document.getElementById("thanks");
            thanksElement.style.display = "none";

        })
        .catch(error => {
            console.error(error);
            alert("Error al procesar la imagen");
        })
        .then(() => {
            changeButtonState();
            // Unfreeze the video
            video.play();
        });
}

function changeButtonState() {
    const botonEscanear = document.getElementById("scan_btn");
    if (botonEscanear.disabled) {
        botonEscanear.disabled = false;
        botonEscanear.innerText = "Escanear";
    } else {
        botonEscanear.style.display = "flex";
        botonEscanear.innerHTML = ' <p class="spinner-border mt-auto mb-auto" role="status"></p><p class="processing">Procesando...</p>';
        botonEscanear.disabled = true;
    }
}

// repeat the prediction when clicking the button
function repeatPrediction() {
    const resultadosElemento = document.getElementById("results-box");
    resultadosElemento.style.display = "none";
    changeButtonState();
    getPredictionFromBackend();
}

function sendFeedback(isAccurate) {
    const id = document.getElementById("prediction_id").value;
    let formData = new FormData();
    formData.append('prediction_id', id);
    formData.append('is_accurate', isAccurate);
    fetch('/accuracy', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.status === 200) {
            const feedbackElement = document.getElementById("feedback");
            feedbackElement.style.display = "none";
            const thanksElement = document.getElementById("thanks");
            thanksElement.style.display = "block";
        } else {
            alert("Error al enviar el feedback");
        }
    }).catch(error => {
        console.error(error);
        alert("Error al enviar el feedback");
    });
}
