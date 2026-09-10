# Projects

A collection of the technical and personal projects behind my [portfolio](https://madhumithachalla.github.io)
and resume — real code, not just descriptions of it.

**License:** see [`LICENSE`](./LICENSE) — public to view and learn from, not licensed for reuse or reproduction without permission.

| Project | Type | What it is | Stack |
|---|---|---|---|
| [`birdtag/`](./birdtag) | Team (4) | Serverless wildlife media tagging | AWS Lambda, API Gateway, Cognito, DynamoDB, S3, Python |
| [`spotify-success-analysis/`](./spotify-success-analysis) | Solo | Statistical analysis of 114K Spotify tracks | R, tidyverse, ggplot2 |
| [`esaver/`](./esaver) | Team (4) | Android energy-saving app | Kotlin, Retrofit, Firebase Firestore |
| [`document-extraction-pipeline/`](./document-extraction-pipeline) | Solo | OCR + pattern-matching pipeline for scanned PDFs | Python, pytesseract, PIL, pdf2image |
| [`ielts-mock-practice-tool/`](./ielts-mock-practice-tool) | Solo | Full IELTS mock exam, built for my own prep | React, Vite, Web Speech API, MediaRecorder API, Recharts |
| [`linkedin-banner-generator/`](./linkedin-banner-generator) | Solo | Code-based LinkedIn banner generator | HTML/CSS, Playwright, Node.js |

## A note on the team projects

BirdTag and ESaver were both group assignments at Monash University. Each folder contains
only the piece I personally built, described honestly, and — where actual code is included —
a fresh reconstruction of that piece rather than the real team submission. This is
deliberate: Monash has strict academic integrity policies around group coursework, and I
don't want real assignment code circulating publicly where future students in the same unit
could find it. Every solo project (Spotify, the OCR pipeline, the IELTS tool, the banner
generator) is included in full, since it's entirely my own work.

## Live demos

Several projects include a `live-demo.html` — an actual working (or clearly-labelled
simulated, for BirdTag) version you can open directly in a browser once this repo is
pushed and hosted, or by opening the file locally. No build step, no dependencies beyond
what's loaded via CDN in the file itself.
