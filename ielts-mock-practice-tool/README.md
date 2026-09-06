# Full IELTS Mock Test Practice Tool

**Solo personal project**

Built for my own IELTS prep — a browser-based mock exam covering all four sections
(Listening, Reading, Writing, Speaking), because paid mock-test platforms were expensive
and I wanted something I could rerun as many times as I needed. I scored **Band 7 overall**
(Speaking 8.5) using early versions of this tool to practise.

**Live demo:** hosted as part of my portfolio at
[madhumithachalla.github.io/projects/demos/ielts-band-lab](https://madhumithachalla.github.io/projects/demos/ielts-band-lab/)

## Features
- Listening and Reading auto-score against the official IELTS raw-score-to-band conversion
  tables, with a results breakdown by question type (form completion, multiple choice, map
  labelling, matching).
- Listening plays each transcript aloud using the browser's built-in text-to-speech, with
  adjustable playback speed — no audio files to host.
- Writing gives timed Task 1 & 2 practice with a live chart (Recharts) and word count.
- Speaking has per-part countdown timers plus an in-browser voice recorder (MediaRecorder
  API) to record and play back your own spoken answers.
- A Feedback dashboard aggregates results across sections, flags strong vs. weak question
  types with targeted tips, and tracks average band against a target score.
- Dark mode, and progress/theme saved to `localStorage` between visits.

## Run it locally
```bash
npm install
npm run dev
```
Then open the URL Vite prints (usually `http://localhost:5173`).

## Files here
This is the full, real Vite + React source (my actual code, not a reconstruction —
it's solo work): `src/App.jsx` (the whole app — data, components, styles),
`src/main.jsx` (entry point), plus the usual Vite project files.

**Stack:** React, Vite, Web Speech API, MediaRecorder API, Recharts
