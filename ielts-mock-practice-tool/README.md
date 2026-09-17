# Full IELTS Mock Test Practice Tool

**Solo personal project**

A browser-based IELTS mock exam covering all four sections — Listening, Reading,
Writing, Speaking — built for my own test preparation because paid mock-test platforms
are expensive per attempt and I wanted something I could rerun as many times as I
needed, with instant, official-scale scoring.

**Live demo:** hosted as part of my portfolio at
[madhumithachalla.github.io/projects/demos/ielts-band-lab](https://madhumithachalla.github.io/projects/demos/ielts-band-lab/)

**Result:** I scored **Band 7 overall** (Speaking 8.5) using early versions of this tool
to practise.

## Why it exists

Official and third-party IELTS mock platforms charge per attempt, which makes repeated
practice expensive right when repetition is what actually improves your score. This tool
removes that constraint: unlimited attempts, instant scoring against the same conversion
tables the real test uses, and a feedback view that tracks which question *types* (not
just which sections) are actually weak — something a one-off paid mock rarely surfaces.

## Architecture

Single-page React app (`src/App.jsx`, ~1,300 lines — deliberately one file for a project
this size rather than a component-per-file structure, since the whole app is one
cohesive exam flow, not a general-purpose UI library). Structure, top to bottom:

- **Data** — `LISTENING`, `READING`, `WRITING`, `SPEAKING` constants hold the actual exam
  content (passages, questions, answer keys, prompts, per-part timings).
- **Scoring** — `listeningBand()` / `readingBand()` convert a raw correct-answer count
  into an IELTS band score using the same raw-score-to-band conversion tables the real
  test publishes, not a linear approximation.
- **Shared primitives** — small reusable pieces used across modules: `Timer` and
  `Countdown` (two different timing needs — count-up vs. count-down), `Gap` / `MCQ` /
  `LetterRow` / `Pills` (the four answer-input patterns IELTS questions actually use:
  fill-in-the-blank, multiple choice, letter-matching, and drag-style pill selection),
  and `BandRuler` / `ScoreCard` for results display.
- **`useSpeech()`** — a custom hook wrapping the browser's built-in `speechSynthesis`
  API, with play/pause/resume state and per-line tracking, so Listening audio doesn't
  need any hosted audio files at all — the transcript is spoken live.
- **`ListeningModule` / `ReadingModule`** — each owns its own answer state, a "checked"
  reveal state, and a `flattenListening()` / `flattenReading()` helper that turns the
  nested question-group structure into a flat list for scoring, since IELTS questions
  are naturally grouped (e.g. "questions 1–5 refer to this passage") but scored
  individually.
- **`WritingModule` / `WriteTask`** — timed Task 1 & Task 2 writing, live word count, and
  a Recharts chart component for Task 1's data-description prompts (IELTS Writing Task 1
  often requires describing a chart, so the practice prompt includes a real rendered one,
  not just a text description of data).
- **`Recorder`** — wraps the `MediaRecorder` API to record and immediately play back the
  user's own spoken answer for Speaking practice, entirely client-side (nothing is
  uploaded — the recording only exists in the browser tab).
- **`Feedback`** — aggregates results across every attempted section, cross-references
  wrong answers against `TIPS` (keyed by question type, not just by section) to surface
  targeted advice, and tracks a running average band against a user-set target score.
- **`loadLS` / `saveLS`** — small localStorage wrappers (wrapped in try/catch so a
  private-browsing tab or blocked storage never crashes the app) persisting results and
  dark-mode preference between visits, under the `bandlab_results` / `bandlab_theme`
  keys.

## Features

- Listening and Reading auto-score against the official IELTS raw-score-to-band
  conversion tables, with a results breakdown by question type (form completion,
  multiple choice, map labelling, matching).
- Listening plays each transcript aloud using the browser's built-in text-to-speech,
  with adjustable playback speed — no audio files to host.
- Writing gives timed Task 1 & 2 practice with a live chart (Recharts) and word count.
- Speaking has per-part countdown timers plus an in-browser voice recorder
  (MediaRecorder API) to record and play back your own spoken answers.
- A Feedback dashboard aggregates results across sections, flags strong vs. weak
  question types with targeted tips, and tracks average band against a target score.
- Dark mode, and progress/theme saved to `localStorage` between visits.

## Run it locally

```bash
npm install
npm run dev
```
Then open the URL Vite prints (usually `http://localhost:5173`).

To build a static production bundle (the same process used to produce the version
hosted under `projects/demos/ielts-band-lab/` on the portfolio site):
```bash
npm run build
```

## Files here

This is the full, real Vite + React source — my actual code, not a reconstruction, since
it's entirely solo work:
- `src/App.jsx` — the whole app: data, components, scoring logic, and styles.
- `src/main.jsx` — the Vite/React entry point.
- `index.html`, `vite.config.js`, `package.json` — standard Vite project scaffolding.

## Limitations

- Listening audio is synthesized speech (`speechSynthesis`), not professionally recorded
  native-speaker audio like the real test uses — useful for comprehension practice, but
  not a substitute for training your ear on real test-day audio quality.
- Writing and Speaking are self/practice-scored (word count, timing, playback) rather
  than machine- or examiner-graded — there's no automated band score for those two
  sections, since that would require a language model in the loop, which this
  zero-backend tool deliberately doesn't have.
- Question content is a fixed practice set, not a growing/randomised question bank.

**Stack:** React, Vite, Web Speech API (`speechSynthesis`), MediaRecorder API, Recharts
