var _model = undefined;
const video = document.getElementById('player');

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
        video: true
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
    });
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

    fetch('/infer', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            const resultadosElemento = document.getElementById("results-box");
            const texto = document.getElementById("text-inside");
            const titulo = document.getElementById("text-title-resultado");
            resultadosElemento.style.display = "block";
            document.getElementById("prediction").innerText = data.prediction + " - " + data.confidence;
            var bolsa;
            switch (data.prediction) {
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
                    resultadosElemento.style.backgroundColor = "green";
                    texto.style.color = "white";
                    titulo.style.color = "white";
                    titulo.style.setProperty("color", "white", "important");
                    bolsa = "verde";
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
                    texto.style.color = "white";
                    titulo.style.setProperty("color", "white", "important");
                    bolsa = "negra";

            }
            document.getElementById("bag").innerText = bolsa;
        });

}

// repeat the prediction when clicking the button
function repeatPrediction() {
    // hide the results box
    const resultadosElemento = document.getElementById("results-box");
    resultadosElemento.style.display = "none";
    getPredictionFromBackend();
}
