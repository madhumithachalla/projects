"""MoveNet TFLite wrapper: loaded once, reused across requests, thread-safe."""
import threading

import cv2
import numpy as np
import tensorflow as tf

SKELETON_CONNECTIONS = [
    (5, 6), (5, 11), (6, 12), (11, 12), (5, 7), (6, 8), (7, 9), (8, 10),
    (11, 13), (12, 14), (13, 15), (14, 16),
]


class PoseModel:
    def __init__(self, model_path: str, confidence_threshold: float = 0.3):
        self.confidence_threshold = confidence_threshold
        self._lock = threading.Lock()
        self.interpreter = tf.lite.Interpreter(model_path=model_path)
        self.interpreter.allocate_tensors()
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()
        self.input_shape = tuple(self.input_details[0]["shape"][1:3])

    def predict(self, image: np.ndarray) -> list[dict]:
        height, width, _ = image.shape
        resized = cv2.resize(image, self.input_shape)
        input_data = np.expand_dims(resized, axis=0).astype(np.float32) / 255.0

        # The TFLite interpreter isn't safe to invoke from multiple threads at
        # once; asyncio.to_thread can still schedule overlapping calls, so this
        # lock serialises inference while letting FastAPI stay fully async.
        with self._lock:
            self.interpreter.set_tensor(self.input_details[0]["index"], input_data)
            self.interpreter.invoke()
            raw = self.interpreter.get_tensor(self.output_details[0]["index"])

        keypoints = raw[0][0]  # (17, 3): y, x, confidence - normalised 0..1
        return [
            {"y": float(y * height), "x": float(x * width), "confidence": float(c)}
            for y, x, c in keypoints
        ]

    def annotate(self, image: np.ndarray, keypoints: list[dict]) -> np.ndarray:
        annotated = image.copy()
        for kp in keypoints:
            if kp["confidence"] >= self.confidence_threshold:
                cv2.circle(annotated, (int(kp["x"]), int(kp["y"])), 5, (0, 255, 0), -1)
        for start, end in SKELETON_CONNECTIONS:
            a, b = keypoints[start], keypoints[end]
            if a["confidence"] >= self.confidence_threshold and b["confidence"] >= self.confidence_threshold:
                cv2.line(annotated, (int(a["x"]), int(a["y"])), (int(b["x"]), int(b["y"])), (0, 0, 255), 2)
        return annotated
