"""
Automated Document Data-Extraction Pipeline — solo personal project.

Pulls specific data rows out of scanned, multi-page PDFs automatically:
OCR + pixel-level row detection to locate target rows, pattern-match to
validate them, then reassemble an annotated output PDF. Built because doing
this by hand for multi-page scanned documents was slow and error-prone.

Stack: Python, pytesseract, PIL, pdf2image
"""

import re
from pathlib import Path

import pytesseract
from pdf2image import convert_from_path
from PIL import Image, ImageDraw


TARGET_PATTERN = re.compile(r"\b[A-Z]{2}\d{6}\b")  # example: record-ID pattern
ROW_HEIGHT_PX = 32


def extract_rows_from_pdf(pdf_path: str, dpi: int = 300):
    """
    Convert each page to an image, run OCR with bounding boxes, and group
    words into row-level candidates for downstream matching.
    """
    pages = convert_from_path(pdf_path, dpi=dpi)
    all_matches = []

    for page_num, page_image in enumerate(pages, start=1):
        ocr_data = pytesseract.image_to_data(
            page_image, output_type=pytesseract.Output.DICT
        )
        rows = _group_words_into_rows(ocr_data)
        matches = _find_target_rows(rows, page_num)
        all_matches.extend(matches)

        _annotate_page(page_image, matches, page_num)

    return all_matches


def _group_words_into_rows(ocr_data):
    """Cluster OCR word boxes into rows based on vertical (top) position."""
    rows = {}
    n = len(ocr_data["text"])
    for i in range(n):
        text = ocr_data["text"][i].strip()
        if not text:
            continue
        top = ocr_data["top"][i]
        row_key = top // ROW_HEIGHT_PX
        rows.setdefault(row_key, []).append({
            "text": text,
            "left": ocr_data["left"][i],
            "top": top,
            "width": ocr_data["width"][i],
            "height": ocr_data["height"][i],
        })
    return rows


def _find_target_rows(rows, page_num):
    """Validate row text against the target pattern and flag matches."""
    matches = []
    for row_key, words in rows.items():
        row_text = " ".join(w["text"] for w in words)
        if TARGET_PATTERN.search(row_text):
            left = min(w["left"] for w in words)
            top = min(w["top"] for w in words)
            right = max(w["left"] + w["width"] for w in words)
            bottom = max(w["top"] + w["height"] for w in words)
            matches.append({
                "page": page_num,
                "text": row_text,
                "bbox": (left, top, right, bottom),
            })
    return matches


def _annotate_page(page_image: Image.Image, matches, page_num: int):
    """Draw boxes around flagged rows and save an annotated preview image."""
    annotated = page_image.copy()
    draw = ImageDraw.Draw(annotated)
    for m in matches:
        draw.rectangle(m["bbox"], outline="red", width=3)

    out_path = Path(f"annotated_page_{page_num}.png")
    annotated.save(out_path)


if __name__ == "__main__":
    results = extract_rows_from_pdf("input_document.pdf")
    print(f"Found {len(results)} matching rows across the document.")
    for r in results:
        print(f"  Page {r['page']}: {r['text']}")
