# Full IELTS Mock Test Practice Tool

**Solo personal project**

Built for my own IELTS prep — a browser-based mock exam covering all four sections
(Listening, Reading, Writing, Speaking), because paid mock-test platforms were expensive
and I wanted something I could rerun as many times as I needed. I scored **Band 7 overall**
(Speaking 8.5) using early versions of this tool to practise.

## Features
- Listening and Reading auto-score against the official IELTS raw-score-to-band conversion
  tables, with a results breakdown by question type (form completion, multiple choice, map
  labelling, matching).
- Listening plays each transcript aloud using the browser's built-in text-to-speech, with
  adjustable playback speed — no audio files to host.
- Writing gives timed Task 1 & 2 practice with live word count.
- Speaking has per-part countdown timers plus an in-browser voice recorder (MediaRecorder
  API) to record and play back your own spoken answers.
- A Feedback dashboard aggregates results across sections, flags strong vs. weak question
  types with targeted tips, and tracks average band against a target score.

## Files here
- `ielts-mock-practice-tool.jsx` — the real, complete source (this is my actual code, not a
  reconstruction — it's solo work).

**Stack:** React, Web Speech API, MediaRecorder API, Recharts
