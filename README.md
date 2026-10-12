# Projects

A collection of the technical and personal projects behind my [portfolio](https://madhumithachalla.github.io)
and resume — real code, not just descriptions of it.

**License:** see [`LICENSE`](./LICENSE) — public to view and learn from, not licensed for reuse or reproduction without permission.

| Project | Type | What it is | Stack | AI assistance |
|---|---|---|---|---|
| [`birdtag/`](./birdtag) | Team (4) | Serverless wildlife media tagging | AWS Lambda, API Gateway, Cognito, DynamoDB, S3, Python | No |
| [`spotify-success-analysis/`](./spotify-success-analysis) | Solo | Statistical analysis of 114K Spotify tracks | R, tidyverse, ggplot2 | Yes, used to understand how to lay out the analysis |
| [`esaver/`](./esaver) | Team (4) | Android energy-saving app | Kotlin, Retrofit, Firebase Firestore | No |
| [`document-extraction-pipeline/`](./document-extraction-pipeline) | Solo | OCR + pattern-matching pipeline for scanned PDFs | Python, pytesseract, PIL, pdf2image | No |
| [`ielts-mock-practice-tool/`](./ielts-mock-practice-tool) | Solo | Full IELTS mock exam, built for my own prep | React, Vite, Web Speech API, MediaRecorder API, Recharts | No |
| [`linkedin-banner-generator/`](./linkedin-banner-generator) | Solo | Code-based LinkedIn banner generator | HTML/CSS, Playwright, Node.js | No |
| [`contact-link-icons/`](./contact-link-icons) | Solo | Inline SVG icons for the portfolio's contact links | HTML, SVG | No |
| [`logo-mark/`](./logo-mark) | Solo | My M/C infinity monogram + cosmic badge, used in the portfolio's nav and footer | HTML, SVG, SVG animateMotion | Yes |
| [`CliMaze (ShelfShift)`](https://github.com/madhumithachalla/CliMaze) | Team (5) | Freshness-aware food waste prevention app for COP31. I led product, demand and stock planning, integration and the pitch | JavaScript (ES modules), HTML/CSS, Node.js tests, Playwright, GitHub Actions | Yes, readme proofread only |

## How these were built

The direction, content, and decisions behind every project here are mine: what to
build, what the real numbers and results are, what each write-up says, and (for the
team projects) exactly which piece was mine to own. An AI assistant (Claude) was used
as an implementation tool on some projects only, not all of them. The AI assistance
column in the table above shows which ones and how, from helping lay out an analysis
to proofreading a readme. It was never used to decide unprompted what a project should
be. Where a demo is a fresh reconstruction rather than real team code (see below),
that's a deliberate academic-integrity call I made, not a limitation of the tooling.

## A note on the team projects

BirdTag and ESaver were both group assignments at Monash University. Each folder contains
only the piece I personally built, described honestly, and — where actual code is included —
a fresh reconstruction of that piece rather than the real team submission. This is
deliberate: Monash has strict academic integrity policies around group coursework, and I
don't want real assignment code circulating publicly where future students in the same unit
could find it. Every solo project (Spotify, the OCR pipeline, the IELTS tool, the banner
generator) is included in full, since it's entirely my own work.

CliMaze (ShelfShift) is different: it is a competition build the team owns together, so
the full repo is public under my account with every member credited.

## Live demos

Several projects include a `live-demo.html` — an actual working (or clearly-labelled
simulated, for BirdTag) version you can open directly in a browser once this repo is
pushed and hosted, or by opening the file locally. No build step, no dependencies beyond
what's loaded via CDN in the file itself.
