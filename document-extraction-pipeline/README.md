# Automated Document Data-Extraction Pipeline

**Solo personal project**

Pulls specific data rows out of scanned, multi-page PDFs automatically: OCR the page,
locate rows of text by pixel position, pattern-match each row against a target format,
and produce an annotated output showing exactly what matched and where.

## Why it exists

Some scanned documents (multi-page forms, ID/record listings, exported reports) need a
specific field or ID pulled out and verified across dozens of pages. Doing that by eye is
slow and error-prone — it's easy to miss a match on page 14 of 20. This pipeline turns
that into: run the script, get a list of every matching row plus an annotated image
showing exactly where each one is, on every page, in one pass.

## How it actually works

The pipeline (`document_extraction_pipeline.py`) has three stages, run once per page:

1. **OCR with bounding boxes** — `pytesseract.image_to_data()` (not the simpler
   `image_to_string()`) is used specifically because it returns each recognised word's
   pixel position and size alongside its text, not just a text blob. That position data
   is what makes row-level (not just page-level) matching possible.
2. **Row grouping** (`_group_words_into_rows`) — OCR gives you words, not lines, so
   words are clustered into rows by dividing each word's vertical (`top`) pixel position
   by a fixed `ROW_HEIGHT_PX` (32px) and grouping by the resulting bucket. This is a
   deliberately simple heuristic rather than a layout-analysis model: it works well for
   documents with consistent, non-overlapping row spacing (most scanned forms and
   listings), and keeps the whole pipeline dependency-light.
3. **Pattern matching** (`_find_target_rows`) — each row's joined text is tested against
   a regex (`TARGET_PATTERN`, defaulting to a two-letter + six-digit ID format like
   `AB123456` as a worked example — swap this for whatever format the real document
   uses). A matching row's bounding box is computed as the union of its words' boxes, so
   the whole row gets flagged, not just the single word that happened to match.

The last step, `_annotate_page`, draws a red rectangle around every matching row's
bounding box directly on a copy of the original page image and saves it — so the output
isn't just a list of extracted text, it's visual proof of exactly where each match sits
on the actual scanned page.

## Files here

- **`document_extraction_pipeline.py`** — the real pipeline described above: PDF → images
  (via `pdf2image`, which shells out to `poppler`), OCR with bounding boxes
  (`pytesseract`), row grouping, regex matching, and annotated PNG output per page
  (`PIL`/`Pillow`).
- **`live-demo.html`** — a genuinely working in-browser version using
  [Tesseract.js](https://tesseract.projectnaptha.com/) (the same OCR engine, compiled to
  WebAssembly) so it runs the same idea entirely client-side — no server, nothing
  uploaded anywhere. Upload any photo of a printed page with an ID-like code and it
  extracts and pattern-matches the text live, in your browser.
- A more advanced version of the same idea — supporting PDF and Word (`.docx`) uploads
  in addition to images, a user-editable search pattern (plain text or full regex), and
  drawing the match box directly onto your original uploaded document (not just styled
  extracted text) with PNG/PDF export of the annotated result — lives in the portfolio
  repo at
  [`madhumithachalla.github.io/projects/demos/ocr-demo.html`](https://madhumithachalla.github.io/projects/demos/ocr-demo.html).
  This folder's `live-demo.html` is the original, simpler single-image version; the
  portfolio one is the actively maintained, feature-complete one.

## Running it

**The real Python pipeline:**
```bash
pip install pytesseract pdf2image Pillow
# pytesseract also needs the Tesseract OCR binary installed separately:
#   macOS:   brew install tesseract poppler
#   Ubuntu:  sudo apt install tesseract-ocr poppler-utils
python document_extraction_pipeline.py
```
It expects an `input_document.pdf` in the working directory by default (change the path
in the `if __name__ == "__main__":` block at the bottom of the file for your own file),
and writes `annotated_page_N.png` for each page.

**The browser demo:** open `live-demo.html` directly — no install needed.

## Limitations

- `ROW_HEIGHT_PX` is a fixed constant tuned for typical scanned-document row spacing —
  a document with unusually tight or widely-spaced rows may need it adjusted.
- The row-grouping heuristic assumes rows don't overlap vertically; it isn't a general
  table/layout parser for complex multi-column or skewed-scan documents.
- OCR accuracy depends on scan quality — a blurry or low-contrast scan will produce
  OCR errors like any OCR pipeline, which no amount of downstream regex tuning can fully
  correct.

**Stack:** Python, pytesseract (Tesseract OCR bindings), pdf2image, Pillow (PIL)
