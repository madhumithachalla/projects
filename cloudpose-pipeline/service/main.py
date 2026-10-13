"""CloudPose FastAPI service: pose estimation with startup-loaded model,
confidence-filtered keypoints, and a concurrent batch endpoint."""
import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .codec import decode_base64_image, encode_image_base64
from .pose_model import PoseModel

log = logging.getLogger("cloudpose")
logging.basicConfig(level=logging.INFO)

MODEL_PATH = os.getenv("POSE_MODEL_PATH", "./models/movenet-full-256.tflite")
CONFIDENCE_THRESHOLD = float(os.getenv("POSE_CONFIDENCE_THRESHOLD", "0.3"))

model: PoseModel | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    log.info("Loading pose model from %s", MODEL_PATH)
    model = PoseModel(MODEL_PATH, CONFIDENCE_THRESHOLD)
    log.info("Model loaded, ready to serve")
    yield
    model = None


app = FastAPI(title="CloudPose", lifespan=lifespan)


class PoseRequest(BaseModel):
    id: str
    image: str = Field(..., description="Base64-encoded JPEG/PNG image")
    response_format: str = Field("keypoints", pattern="^(keypoints|image|both)$")


class BatchPoseRequest(BaseModel):
    items: list[PoseRequest] = Field(..., max_length=32)


def _run_inference(request: PoseRequest) -> dict:
    image = decode_base64_image(request.image)
    keypoints = model.predict(image)
    result: dict = {"id": request.id, "keypoints": keypoints}
    if request.response_format in ("image", "both"):
        annotated = model.annotate(image, keypoints)
        result["image"] = encode_image_base64(annotated)
    return result


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/pose-estimation")
async def pose_estimation(request: PoseRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    try:
        return await asyncio.to_thread(_run_inference, request)
    except Exception as exc:
        log.exception("Pose estimation failed for id=%s", request.id)
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/pose-estimation/batch")
async def pose_estimation_batch(request: BatchPoseRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    async def run_one(item: PoseRequest) -> dict:
        try:
            return await asyncio.to_thread(_run_inference, item)
        except Exception as exc:
            log.exception("Pose estimation failed for id=%s", item.id)
            return {"id": item.id, "error": str(exc)}

    results = await asyncio.gather(*(run_one(item) for item in request.items))
    return {"count": len(results), "results": results}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "60600"))
    uvicorn.run(app, host="0.0.0.0", port=port)
