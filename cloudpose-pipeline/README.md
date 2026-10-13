# CloudPose — FastAPI Pose-Estimation Microservice on a Self-Built OCI Kubernetes Cluster

**Solo coursework project · Monash University**

A pose-estimation web service (FastAPI + OpenCV) that I containerised, deployed to Oracle
Cloud Infrastructure, and load-tested against a Kubernetes cluster I built from bare VMs
by hand — no managed Kubernetes offering, no Terraform, just `kubeadm` and three real
instances.

## What it does

The service accepts an image (base64-encoded over HTTP), decodes it, runs pose detection,
and returns the detected keypoints as JSON — built as an async FastAPI app with Pydantic
request/response models, and OpenCV used for image decode/encode. CPU-bound detection work
is pushed off the event loop with `asyncio.to_thread` so the service stays responsive under
concurrent load instead of serialising requests behind the GIL.

## Infrastructure I built

- **Networking**: a manually configured OCI VCN — subnets, security lists and route tables
  set up by hand, not from a template, with the controller and worker nodes' security
  lists opened on the specific ports Kubernetes needs (6443 for the API server, 10250 for
  kubelet, plus the NodePort range).
- **Compute**: three Oracle Linux 8 VMs (`VM.Standard3.Flex`, 4 OCPU / 8GB RAM each) — one
  controller, two workers.
- **Cluster**: a Kubernetes cluster built from scratch across those three VMs with
  `kubeadm` — swap disabled, kernel modules and sysctl params set, `containerd` installed
  as the container runtime, `kubelet`/`kubeadm`/`kubectl` installed, `kubeadm init` run on
  the control-plane node with Flannel's pod network CIDR (`10.244.0.0/16`), worker nodes
  joined, and Flannel installed as the pod network CNI.
- **Images**: the service built into a Docker image and pushed to OCI Container Registry,
  then pulled onto the cluster.
- **Deployment**: the FastAPI service deployed with explicit CPU/memory requests (0.5 CPU,
  512MiB) on each pod, exposed externally via a NodePort service, and scaled to 3 replicas
  to test how Kubernetes handles the increased load.
- **Load testing**: throughput and latency verified with Locust, driving concurrent
  requests at the deployed service to check it holds up under parallel load rather than
  just working for one request at a time.

## Why this isn't the literal assignment submission

This started life as a university-provided specification (Monash FIT5225, Assignment 1)
that other students in the same unit also work from — so a line-for-line copy of what I
submitted isn't something to publish publicly, for the same academic-integrity reason I
apply to BirdTag. Instead of a vague "reconstruction," though, the service in
[`service/`](./service) is my own original submission's approach **substantially rewritten
and extended** with real engineering the assignment didn't ask for or grade:

| Original assignment service | This repo's version |
|---|---|
| Reloaded the TFLite model on every single request | Model loaded once at startup (FastAPI lifespan), reused across requests behind a thread lock |
| Drew every keypoint regardless of confidence, even near-zero ones | Confidence-threshold filtering before drawing or reporting a keypoint |
| Two near-duplicate routes (`/pose-estimation`, `/pose-estimation/image`) for keypoints vs. annotated image | One endpoint with a `response_format` field (`keypoints` / `image` / `both`) |
| No way to process more than one image per request | New `/pose-estimation/batch` endpoint, up to 32 images processed concurrently with `asyncio.gather` |
| No health/readiness signal, bare `except Exception: print()` | `/healthz` endpoint, structured logging, correct HTTP status codes (503 while the model's still loading, 400 on a bad request) |

This is different work, not the same code relabelled — different file structure, different
endpoint design, new features, real bugs fixed. The TFLite MoveNet model file itself isn't
bundled here (it's a large binary asset, not something to park in a git repo); point
`POSE_MODEL_PATH` at a MoveNet `.tflite` export (e.g. from TensorFlow Hub) to run it.

The real OCI tenancy and the three-VM cluster described above no longer exist (OCI
free-tier instances get recycled), so this service isn't deployed anywhere right now —
it's here to run locally or against your own cluster.

## Files here

- **`service/`** — the enhanced FastAPI pose-estimation service described above
  (`main.py`, `pose_model.py`, `codec.py`, `requirements.txt`).
- **`loadtest_client.py`** — a concurrent load-test client: it walks a folder of images,
  base64-encodes each one, and fires them at the service in parallel via a thread pool,
  timing total and average response time. The same *approach* Locust automates at larger
  scale, written fresh for this repo.
- **`live-demo.html`** — a live, fully in-browser pose-estimation demo. It runs a real
  pose-detection model (TensorFlow.js MoveNet — the same model family as `service/`, run
  through a different, in-browser runtime) against your webcam or an uploaded photo. The
  OCI/Kubernetes architecture section describes the real, now-decommissioned
  infrastructure; the load-test panel generates illustrative numbers since the original
  Locust report isn't available. It's also mirrored at
  [`madhumithachalla.github.io/projects/demos/cloudpose-demo.html`](https://madhumithachalla.github.io/projects/demos/cloudpose-demo.html)
  so it's reachable straight from the portfolio site.

## Running it

```bash
pip install -r service/requirements.txt
POSE_MODEL_PATH=./models/movenet-full-256.tflite uvicorn service.main:app --reload
python loadtest_client.py <input_folder> http://localhost:8000/pose-estimation <num_workers>
```

To see the pose detection and concurrency without installing anything, open
`live-demo.html` (or the mirrored copy linked above) directly in a browser.
