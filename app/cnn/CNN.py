import os
import tensorflow as tf
from tensorflow import keras


class CNN:
    def __init__(self):
        self.saved_path = os.path.join(os.path.dirname(__file__), '/model/jsmodel/saved_model.json')
        print(self.saved_path)
        self.model = keras.experimental.load_from_saved_model(self.saved_path)
        self.predict = self.model.signatures["serving_default"]
        self.image_size = 256

    def preprocess(self, image):
        image = tf.image.resize(image, (self.image_size, self.image_size))
        return tf.cast(image, tf.float32) / 255.0

    def infer(self, image=None):
        tensor_image = tf.convert_to_tensor(image, dtype=tf.float32)
        tensor_image = self.preprocess(tensor_image)
        shape = tensor_image.shape
        tensor_image = tf.reshape(tensor_image, [1, shape[0], shape[1], shape[2]])
        return self.predict(tensor_image)['conv2d_transpose_4']
