import os
import tensorflow as tf
from tensorflow import keras
import numpy as np

PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))
clases = ['Aluminio', 'Carton', 'Envases_Plastico', 'Organicos', 'Papel', 'Plasticos', 'Tetra_Pak', 'Vidrio']


class CNN:
    def __init__(self):
        self.saved_path = os.path.join(PROJECT_ROOT, "residuos_model.h5")
        self.model = keras.models.load_model(self.saved_path)
        self.predict = tf.function(self.model)
        self.image_size = 256

    def preprocess(self, image):
        image = tf.image.resize(image, (self.image_size, self.image_size))
        return tf.cast(image, tf.float32) / 255.0

    def infer(self, image=None):
        tensor_image = self.preprocess(image)

        shape = tensor_image.shape
        tensor_image = tf.reshape(tensor_image, [1, shape[0], shape[1], 3])
        prediction = self.predict(tensor_image)
        class_name = clases[np.argmax(prediction)]

        confidence = round(float(prediction[0][np.argmax(prediction)] * 10), 2)
        return {
            "prediction": class_name,
            "confidence": f"{confidence}%"
        }
