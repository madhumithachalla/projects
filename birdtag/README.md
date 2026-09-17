# BirdTag — Serverless Wildlife Media Tagging Platform

**Team project (4 people) · Monash University · My role: authentication & backend API**

BirdTag lets users upload photos, audio, and video of wildlife and get them automatically
tagged by species using ML-based detection, then search and manage that media by tag. My
part of the system was everything an authenticated request touches before it reaches the
ML pipeline: identity, access control, and four of the system's eight backend Lambda
functions.

## Why it exists

Manually tagging and organising wildlife media (for a citizen-science or conservation
use case) doesn't scale — you end up with folders of untagged files nobody can search.
BirdTag automates the tagging step and puts search on top of it, so "find every clip
with a Superb Fairywren in it" is a query, not an afternoon of manual review.

## My contribution

- **Designed and configured the entire authentication layer**: an Amazon Cognito User
  Pool, wired into API Gateway as a Cognito authorizer on every protected route, with
  CORS configured correctly across all of them (a detail that's easy to get subtly wrong
  and breaks the frontend silently when it is).
- **Co-built the core tag-query Lambda** with a teammate — the function that takes a
  tag/species filter, looks it up in DynamoDB, and returns matching media records.
- **Independently built four Lambda functions**: species search, tag editing, file
  deletion, and secure signed-upload.
- Owned the pattern the rest of the team's protected endpoints followed: by the time any
  of my four functions (or anyone else's, once wired the same way) executes, the request
  has already been authenticated — the handler just reads a verified Cognito claim off
  `event['requestContext']['authorizer']['claims']`, no manual token verification inside
  application code.

## How the piece I owned actually works

The signed-upload flow (the one reconstructed in this folder) goes:

1. A signed-in user's browser calls the upload endpoint with a `fileName` and
   `contentType`.
2. API Gateway's Cognito authorizer has already rejected anything without a valid,
   unexpired Cognito token — the Lambda never sees an unauthenticated request.
3. The handler pulls the user's Cognito `sub` (their stable user ID) out of the verified
   claims, and uses it to namespace the S3 object key (`uploads/{user_id}/{uuid}_{file}`)
   so one user's files can never collide with or overwrite another's.
4. It generates a short-lived (5-minute) S3 presigned PUT URL scoped to that exact key,
   and returns it to the browser.
5. The browser uploads the actual file bytes **directly to S3** using that URL — the
   Lambda never touches the file body itself, which keeps it fast and keeps Lambda
   payload/timeout limits out of the picture entirely.

The species-tagging step downstream (ML inference on the uploaded file) was built by a
teammate; my four functions handle everything on the identity/access/data side of that.

## Files here

- **`birdtag_auth_and_upload_demo.py`** — a standalone reconstruction of the auth +
  signed-upload Lambda handler I personally wrote, rewritten fresh rather than copied
  from the real team submission (see the note below on why).
- **`live-demo.html`** — an interactive front-end walkthrough of the flow (sign in →
  upload → tagging), clearly labeled as a simulation for the parts that need the
  deployed AWS backend to actually run. It's also mirrored, with the same code, at
  [`madhumithachalla.github.io/projects/demos/birdtag-demo.html`](https://madhumithachalla.github.io/projects/demos/birdtag-demo.html)
  so it's reachable straight from the portfolio site.

## Why this is a reconstruction, not the real submission

BirdTag was a 4-person Monash assignment, and the actual codebase includes work by three
other students plus infrastructure config tied to a shared, now-defunct AWS account.
Monash's academic integrity policy on group coursework means I don't publish that code
publicly — future students in the same unit could otherwise find and copy it. What's
here is the *pattern* I actually used, written fresh from scratch, so it demonstrates the
real approach and real decisions without reproducing anyone's actual submission.

## Running the demo

The Python file isn't meant to run standalone — it's a Lambda handler that expects to be
invoked by API Gateway with a Cognito-authorizer-populated `event`. To see the flow it
represents, open `live-demo.html` (or the mirrored copy linked above) directly in a
browser; no install needed.

## Limitations

- The live demo simulates authentication and the ML tagging result (it picks a plausible
  species from a fixed list) — it doesn't call real AWS infrastructure, since that
  infrastructure was course-provided and is no longer running.
- Real species detection in the actual system was handled by a teammate's ML pipeline,
  not by the code in this folder.

**Stack:** AWS Lambda, API Gateway, Amazon Cognito, DynamoDB, S3, Python (boto3)
