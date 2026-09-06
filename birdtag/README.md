# BirdTag — Serverless Media Tagging Platform

**Team project (4 people) · Monash University · My role: authentication & backend API**

A serverless system for automatically tagging and retrieving wildlife media using ML-based
species detection. I owned identity/access and 4 of the 8 backend functions.

## My contribution
- Designed and configured Amazon Cognito authentication end to end, then wired it into API
  Gateway authorizers across every protected route with CORS handled correctly.
- Co-built the core tag-query function (file handling, tagging logic, DynamoDB filtering)
  with a teammate.
- Independently built species search, tag editing, file deletion, and secure signed-upload
  functions.

## Files here
- `birdtag_auth_and_upload_demo.py` — a standalone reconstruction of the auth + signed-upload
  Lambda handler I personally wrote, rewritten fresh rather than copied from the real
  submission (Monash has strict academic integrity policies on group assignments, so the
  actual team code isn't reproduced here).
- `live-demo.html` — an interactive front-end walkthrough of the flow (sign-in → upload →
  tagging). Clearly labeled as a simulation, since the real thing needs the deployed AWS
  backend (Cognito, API Gateway, Lambda, DynamoDB, S3) to actually run.

**Stack:** AWS Lambda, API Gateway, Cognito, DynamoDB, S3, Python
