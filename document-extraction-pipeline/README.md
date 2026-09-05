# Automated Document Data-Extraction Pipeline

**Solo personal project**

Pulls specific data rows out of scanned, multi-page PDFs automatically — OCR plus
pixel-level row detection to locate target rows, pattern-match to validate them, then
reassemble an annotated output. Built because doing this by hand for multi-page scanned
documents was slow and error-prone.

## Files here
- `document_extraction_pipeline.py` — the real pipeline: OCR via pytesseract, bounding-box
  row grouping, regex pattern matching, and annotated-image output.
- `live-demo.html` — a genuinely working in-browser version using Tesseract.js (WASM OCR
  running fully client-side, no server, no upload anywhere). Upload any image with an
  ID-like code and it extracts and pattern-matches the text live.

**Stack:** Python, pytesseract, PIL, pdf2image
