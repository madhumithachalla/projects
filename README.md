# Projects

A collection of the technical and personal projects behind my [portfolio](https://madhumithachalla.github.io)
and resume — real code, not just descriptions of it.

**License:** see [`LICENSE`](./LICENSE) — public to view and learn from, not licensed for reuse or reproduction without permission.

| Project | Type | What it is | Stack | AI assistance |
|---|---|---|---|---|
| [`birdtag/`](./birdtag) | Team (4) | Serverless wildlife media tagging | AWS Lambda, API Gateway, Cognito, DynamoDB, S3, Python | No |
| [`cloudpose-pipeline/`](./cloudpose-pipeline) | Solo | Pose-estimation microservice on a self-built OCI Kubernetes cluster, rewritten and extended from my own assignment submission | FastAPI, OpenCV, Docker, Kubernetes, OCI, Locust, Python | Yes, service code, load-test client, readme and live demo written by Claude from my own real assignment code and project notes |
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

CloudPose is solo work, not a team project, but a related rule applies: it was built to a
Monash-provided assignment specification that other students in the same unit also work
from, so a line-for-line copy of the real submission isn't published here. What is here
is my own submission's approach substantially rewritten and extended with real features
the assignment didn't require (the readme in that folder lists exactly what changed) —
different work, not the same code relabelled.

## Live demos

Several projects include a `live-demo.html` — an actual working (or clearly-labelled
simulated, for BirdTag) version you can open directly in a browser once this repo is
pushed and hosted, or by opening the file locally. No build step, no dependencies beyond
what's loaded via CDN in the file itself.

## Automatic portfolio tiles

New non-academic projects in top-level folders are discovered by the portfolio's
public GitHub integration on visits. Give a new project a `README.md`; optionally
add `portfolio.json` inside its folder for its display details:

```json
{
  "kind": "personal",
  "title": "My project",
  "description": "A short public description.",
  "demo": "https://example.com/",
  "categories": ["web", "automation"]
}
```

Use `kind` of `personal`, `professional`, or `competition`. Categories are `cloud`,
`mobile`, `web`, `data`, `automation`, `design`, and `team`. Only public descriptions
and demo links belong in metadata. Do not include application records, resumes,
credentials, or original coursework. No private repository is read or made public.

Keep original academic work private. For any public academic reconstruction or
project that should not get an automatic tile, use:

```json
{ "kind": "academic", "exclude": true }
```

BirdTag, CloudPose, ESaver and Spotify analysis carry explicit exclusion files.
The existing handwritten portfolio showcases are curated separately. Academic
markers in a new project's README also exclude it, even if it is mistakenly
labelled personal. Metadata makes the intention explicit; wording detection alone
cannot recognise undisclosed coursework.

The matching portfolio implementation and its tests are in
[`madhumithachalla.github.io`](https://github.com/madhumithachalla/madhumithachalla.github.io),
under `portfolio-sync.js` and `docs/07-automatic-project-tiles.md`. It continues to
discover future public folders and standalone public repositories after setup;
GitHub availability and public API limits can delay automatic tiles. Handwritten
tiles remain available when GitHub cannot be reached.
