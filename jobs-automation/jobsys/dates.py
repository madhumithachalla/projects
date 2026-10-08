"""Closing-date extraction and priority tiers (Australian day-first dates)."""
import re
from datetime import date, datetime
from zoneinfo import ZoneInfo

MONTHS = {m: i for i, m in enumerate(
    ["january", "february", "march", "april", "may", "june", "july",
     "august", "september", "october", "november", "december"], 1)}
_MN = "|".join(list(MONTHS) + [m[:3] for m in MONTHS])
_DATE = (
    r"(?P<d1>\d{1,2})[/.\-](?P<m1>\d{1,2})[/.\-](?P<y1>\d{2,4})"
    r"|(?P<d2>\d{1,2})(?:st|nd|rd|th)?\s+(?P<m2>" + _MN + r")[a-z]*\.?,?\s+(?P<y2>\d{4})"
    r"|(?P<m3>" + _MN + r")[a-z]*\.?\s+(?P<d3>\d{1,2})(?:st|nd|rd|th)?,?\s+(?P<y3>\d{4})"
)
DATE_RE = re.compile(_DATE, re.I)
CLOSE_RE = re.compile(r"\b(?:applications?\s+)?clos(?:e|es|ed|ing)(?:\s+date)?\b", re.I)


def melbourne_now(tz="Australia/Melbourne"):
    return datetime.now(ZoneInfo(tz))


def today_melbourne(tz="Australia/Melbourne"):
    return melbourne_now(tz).date()


def _month(name):
    n = name.lower()
    return MONTHS.get(n) or next(v for k, v in MONTHS.items() if k.startswith(n[:3]))


def parse_match(m):
    try:
        if m.group("d1"):
            y = int(m.group("y1"))
            y += 2000 if y < 100 else 0
            return date(y, int(m.group("m1")), int(m.group("d1")))
        if m.group("d2"):
            return date(int(m.group("y2")), _month(m.group("m2")), int(m.group("d2")))
        return date(int(m.group("y3")), _month(m.group("m3")), int(m.group("d3")))
    except ValueError:
        return None


def extract_closing(text):
    """Return (date|None, raw_text|None). Only a date that follows the word
    'close/closing/closes' within 70 characters counts; a posted date never does."""
    for c in CLOSE_RE.finditer(text or ""):
        window = text[c.end():c.end() + 70]
        m = DATE_RE.search(window)
        if m:
            d = parse_match(m)
            if d:
                return d, (c.group(0) + " " + window[:m.end()]).strip()
    return None, None


def priority(closing, today=None, status=None):
    """CRITICAL <=2 days, URGENT 3-5, NORMAL 6-14 or no date, FUTURE 15+, CLOSED past.
    A role with no closing date is NORMAL by rule, never skipped for lacking one."""
    if status in ("Applied", "Skipped", "Interview", "Offer", "Rejected", "Closed"):
        return ""
    if not closing:
        return "NORMAL"
    if isinstance(closing, str):
        closing = date.fromisoformat(closing)
    today = today or today_melbourne()
    n = (closing - today).days
    if n < 0:
        return "CLOSED"
    return "CRITICAL" if n <= 2 else "URGENT" if n <= 5 else "NORMAL" if n <= 14 else "FUTURE"


def fmt_dmy(d):
    if not d:
        return "not listed"
    if isinstance(d, str):
        d = date.fromisoformat(d)
    return d.strftime("%d/%m/%Y")
