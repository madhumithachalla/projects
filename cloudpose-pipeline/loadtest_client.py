"""Concurrent load-test client for a pose-estimation HTTP service.

Reconstruction of the approach I used to verify the deployed CloudPose service held up
under parallel requests, rewritten fresh for this repo (see README for why). Walks a
folder of images, base64-encodes each one, and fires them at a pose-detection endpoint
in parallel using a thread pool, then reports throughput.
"""
import argparse
import base64
import json
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests


def encode_request(image_path: Path) -> dict:
    with open(image_path, "rb") as f:
        payload = base64.b64encode(f.read()).decode("utf-8")
    return {
        "id": str(uuid.uuid5(uuid.NAMESPACE_OID, str(image_path))),
        "image": payload,
    }


def send_request(endpoint: str, image_path: Path) -> tuple[Path, float, bool]:
    body = encode_request(image_path)
    started = time.perf_counter()
    try:
        response = requests.post(endpoint, json=body, timeout=30)
        ok = response.ok
    except requests.RequestException:
        ok = False
    elapsed = time.perf_counter() - started
    return image_path, elapsed, ok


def run_load_test(input_folder: str, endpoint: str, num_workers: int) -> None:
    images = sorted(Path(input_folder).glob("*.jpg"))
    if not images:
        raise SystemExit(f"No .jpg images found in {input_folder}")

    started = time.perf_counter()
    results = []
    with ThreadPoolExecutor(max_workers=num_workers) as pool:
        futures = [pool.submit(send_request, endpoint, image) for image in images]
        for future in as_completed(futures):
            results.append(future.result())
    total_elapsed = time.perf_counter() - started

    ok_count = sum(1 for _, _, ok in results if ok)
    avg_latency = sum(elapsed for _, elapsed, _ in results) / len(results)

    print(json.dumps({
        "images": len(images),
        "workers": num_workers,
        "ok": ok_count,
        "failed": len(results) - ok_count,
        "total_seconds": round(total_elapsed, 3),
        "avg_latency_seconds": round(avg_latency, 3),
        "throughput_per_second": round(len(images) / total_elapsed, 2),
    }, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_folder", help="Folder of .jpg images to send")
    parser.add_argument("endpoint", help="Pose-detection endpoint URL")
    parser.add_argument("num_workers", type=int, help="Thread pool size")
    args = parser.parse_args()
    run_load_test(args.input_folder, args.endpoint, args.num_workers)
