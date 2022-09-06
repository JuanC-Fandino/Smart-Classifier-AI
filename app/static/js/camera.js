var _model = undefined;
const video = document.getElementById('player');
const image = document.getElementById('imageF');

tf.loadGraphModel("../static/models/jsmodel/model.json").then(model => {
    _model = model;
    if (getUserMediaSupported()) {
        enableCam();
    } else {
        console.warn('getUserMedia() is not supported by your browser');
    }
});

// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will
// define in the next step
async function predictWebcam() {
    let example = tf.browser.fromPixels(video).resizeBilinear([256, 256]);

    // reshape the tensor to be a 4d
    example = example.reshape([-1, 256, 256, 3]);

    // normalize the image
    example = example.div(255.0);

    // make the prediction
    // IMPORT and image from an url and make a prediction and not use the webcam
    let example2 = tf.browser.fromPixels(image).resizeBilinear([256, 256]);
    example2 = example2.reshape([-1, 256, 256, 3]);
    example2 = example2.div(255.0);


    const prediction = await _model.predict(example2).dataSync();
    console.log(prediction);

    // call this function again to keep predicting when the browser is ready
    // window.requestAnimationFrame(predictWebcam);

    let predictions = await _model.predict(example).data();

    const classes = ['Aluminio', 'Carton', 'Envases_Plastico', 'Organicos', 'Papel', 'Plasticos', 'Tetra_Pak', 'Vidrio'];

    console.log(predictions, "here");
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

    console.log(results);

    const resultadosElemento = document.getElementById("results-box");
    document.getElementById("prediction").innerText = results[0].className + " - " + (Math.round(results[0].probability, 2)) + "%";
    var bolsa = "roja";
    switch (results[0].className) {
        case "Basura":
            resultadosElemento.style.backgroundColor = "black";
            bolsa = "negra";
            break;
        case "Carton":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        case "Metal":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        case "Papel":
            resultadosElemento.style.backgroundColor = "white";
            bolsa = "blanca";
            break;
        case "Plastico":
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
        video.addEventListener('loadeddata', predictWebcam);
    });
}

