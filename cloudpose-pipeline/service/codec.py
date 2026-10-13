"""Base64 <-> OpenCV image conversion."""
import base64
import io

import cv2
import numpy as np
from PIL import Image


def decode_base64_image(data: str) -> np.ndarray:
    raw = base64.b64decode(data)
    pil_image = Image.open(io.BytesIO(raw)).convert("RGB")
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)


def encode_image_base64(image: np.ndarray) -> str:
    ok, buffer = cv2.imencode(".jpg", image)
    if not ok:
        raise ValueError("Failed to encode annotated image")
    return base64.b64encode(buffer).decode("utf-8")
