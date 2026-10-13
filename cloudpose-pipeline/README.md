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
  set up by hand, not from a template.
- **Compute**: three Oracle Linux 8 VMs (`VM.Standard3.Flex`, 4 OCPU / 8GB RAM each).
- **Cluster**: a Kubernetes cluster built from scratch across those three VMs with
  `kubeadm` — swap disabled, kernel modules and sysctl params set, containerd and Docker
  installed, `kubelet`/`kubeadm`/`kubectl` installed, `kubeadm init
  --pod-network-cidr=192.168.0.0/16` on the control-plane node, worker nodes joined, and
  Calico installed as the pod network CNI.
- **Images**: the service built into a Docker image and pushed to OCI Container Registry,
  then pulled onto the cluster.
- **Load testing**: throughput and latency verified with Locust, driving concurrent
  requests at the deployed service to check it holds up under parallel load rather than
  just working for one request at a time.

## Why this folder doesn't contain the real submission

This was built to a university-provided specification that other students in the same
unit also work from. Even though it's solo (not team) work, publishing the actual
implementation publicly risks it being found and copied by someone currently doing the
same assignment — Monash's academic integrity policy is exactly as strict about that as
it is about team coursework. So, same rule I apply to BirdTag: what's here is a **fresh
reconstruction** of the pattern I actually used — written from scratch for this repo,
never copied from the real submission — plus an honest description of the architecture
above. The real server code, the real OCI tenancy and the real cluster no longer exist in
a form anyone could reuse anyway (OCI free-tier instances get recycled).

## Files here

- **`loadtest_client.py`** — a standalone reconstruction of the concurrent load-test
  client: it walks a folder of images, base64-encodes each one, and fires them at a pose-
  detection endpoint in parallel via a thread pool, timing total and average response
  time. This is the same *approach* the real client used (and the same approach Locust
  automates at larger scale), rewritten fresh rather than copied from the real submission.
- **`live-demo.html`** — a live, fully in-browser pose-estimation demo. It runs a real
  pose-detection model (TensorFlow.js MoveNet) client-side against your webcam or an
  uploaded photo — not a mock-up — plus a clearly-labelled simulated panel visualising
  what concurrent load-testing against the deployed service looks like. No server code,
  no real OCI infrastructure, and no assignment code is exposed by this page; it
  demonstrates the same skill set (pose estimation, concurrency, load-test interpretation)
  through a working demo instead of describing one. It's also mirrored at
  [`madhumithachalla.github.io/projects/demos/cloudpose-demo.html`](https://madhumithachalla.github.io/projects/demos/cloudpose-demo.html)
  so it's reachable straight from the portfolio site.

## Running the reconstruction

```bash
python loadtest_client.py <input_folder> <pose-detection-endpoint-url> <num_workers>
```

It isn't wired to a live endpoint (the real cluster no longer exists), so running it
as-is will just show connection errors — it's included to demonstrate the approach, not
to be run against a working service. To see the concurrency and the pose detection in
action, open `live-demo.html` (or the mirrored copy linked above) directly in a browser.
