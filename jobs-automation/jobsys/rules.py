"""Deterministic eligibility and fit rules, driven by a profile.

classify() returns a Verdict. Hard rules produce SKIP with reasons. Soft
issues produce flags that go into the preview as "needs your decision".
Nothing here guesses a closing date or invents a skill.
"""
import re
from dataclasses import dataclass, field
from datetime import date, timedelta

from .dates import extract_closing, today_melbourne

I = re.I
NUMWORDS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
            "seven": 7, "eight": 8, "nine": 9, "ten": 10}

CITIZEN = re.compile(
    r"(australian\s+citizen(?:ship)?|citizens?\s*(?:/|or|and)\s*(?:australian\s+)?(?:permanent\s+)?residents?"
    r"|permanent\s+residents?\s+only|\bpr\s+only|citizens?\s+only|citizenship\s+(?:is\s+)?required"
    r"|\bcitizen\s*/\s*pr\b)", I)
INCLUSIVE = re.compile(
    r"valid visa|visa with work|work entitlements|right to (?:live and )?work|non-australian|without regard|"
    r"regardless|never based|not based|equal opportunity|discriminat", I)
INTERNATIONAL_NO = re.compile(
    r"(?:not|unable to|cannot)\s+(?:be able to\s+)?support\s+international|no international (?:applicants|students)", I)
UNRESTRICTED = re.compile(r"(?:unrestricted|full|unlimited)\s+(?:working|work)\s+rights", I)
CLEARANCE_HARD = re.compile(r"\b(?:NV\s?[12]|negative vetting|baseline clearance|AGSVA)\b|hold(?:ing)?\s+an?\s+[^.]{0,30}clearance", I)
CLEARANCE_SOFT = re.compile(r"security clearance", I)
NICHE = [
    (re.compile(r"\bSAP\b"), "SAP"),
    (re.compile(r"ericsson\s+axe|\bPSTN\b", I), "Ericsson AXE / PSTN"),
    (re.compile(r"charles\s+river", I), "Charles River"),
    (re.compile(r"\bJDE\b|jd\s+edwards", I), "JDE"),
    (re.compile(r"penetration\s+test|pen[\s-]?test", I), "pen testing"),
    (re.compile(r"\bFIFO\b|fly[\s-]in", I), "FIFO"),
]
UNPAID = re.compile(r"unpaid\s+(?:internship|position|role|work|placement|volunteer)", I)
SENIOR_TITLE = re.compile(r"\b(?:senior|sr|lead|principal|head of|director|vice president|vp|avp|manager|architect)\b", I)
UNDERGRAD = re.compile(r"\bundergraduate\b", I)
POSTGRAD = re.compile(r"\b(?:post-?graduate|masters?)\b", I)
UNDERGRAD_ONLY_TEXT = re.compile(r"(?:must be|currently)\s+(?:enrolled|studying)[^.]{0,60}undergraduate", I)
LANGUAGE = re.compile(
    r"(?:mandarin|cantonese|japanese|korean|arabic|vietnamese|italian|german|french|spanish|indonesian|thai)"
    r"[^.]{0,80}(?:essential|required|mandatory)|(?:essential|required|mandatory)[^.]{0,40}"
    r"(?:mandarin|cantonese|japanese|korean|arabic|vietnamese|italian|german|french|spanish)", I)
DRIVER = re.compile(r"driver.?s?\s+licen[cs]e", I)
SHIFT = re.compile(r"on-?call|after-?hours|rotating (?:shift|roster)|weekend", I)
SPONSOR_FUTURE = re.compile(r"sponsorship[^.]{0,40}(?:now or in the future|in the future)", I)
FAITH = re.compile(r"faith|ethos of the (?:college|school)|salesian|catholic", I)
IT_TITLE = re.compile(
    r"\b(?:it|ict|technology|technical|software|developer|data|cloud|network|systems?|support|desktop|service desk|"
    r"helpdesk|help desk|digital|cyber|infrastructure|programmer|devops|platform|sql|integration|engineer|analyst)\b", I)
IT_STRONG = re.compile(
    r"\b(?:it|ict|software|developer|cloud|network|service desk|helpdesk|help desk|desktop|systems?|cyber|devops|"
    r"technology|data engineer|integration|programmer|platform|infrastructure)\b", I)

YEAR_PATTERNS = [
    ("min", re.compile(r"(?:minimum(?:\s+of)?|at least|min\.?)\s*(\w+)\s*\+?\s*years?", I)),
    ("range", re.compile(r"(\d+)\s*(?:-|to|–)\s*(\d+)\s*\+?\s*years?", I)),
    ("plus", re.compile(r"(\d+)\s*\+\s*years?", I)),
    ("exp", re.compile(r"\b(\w+)\s+years?['’]?\s+(?:of\s+)?(?:(?:relevant|professional|commercial|hands-on|proven|solid)\s+)*experience", I)),
]


def _num(tok):
    tok = tok.lower()
    if tok.isdigit():
        return int(tok)
    return NUMWORDS.get(tok)


def years_required(text):
    """Return (lowest_requirement, highest_figure, snippet) of the strictest
    experience requirement found, or (None, None, None).
    'minimum 2 years' counts; '140 years' of company history does not, because
    every pattern needs 'minimum', a plus sign, a range, or the word experience.
    A range such as '1-3 years' is read as a range, never as its upper figure."""
    text = text or ""
    found = []
    for kind, rx in YEAR_PATTERNS:
        for m in rx.finditer(text):
            after = text[m.end():m.end() + 70]
            if kind in ("range", "plus") and not re.search(r"experience|exp\b", after, I):
                continue
            if kind == "range":
                lo, hi = int(m.group(1)), int(m.group(2))
            else:
                lo = _num(m.group(1))
                if lo is None:
                    continue
                hi = lo
            if lo > 40:
                continue
            found.append((kind, m.span(), lo, hi, m.group(0)))
    spans = [f[1] for f in found if f[0] == "range"]
    best = (None, None, None)
    for kind, (a, b), lo, hi, snip in found:
        if kind != "range" and any(a < e and b > s for s, e in spans):
            continue
        if best[0] is None or lo > best[0] or (lo == best[0] and hi > (best[1] or 0)):
            best = (lo, hi, snip)
    return best


@dataclass
class Verdict:
    decision: str                       # PURSUE or SKIP
    reasons: list = field(default_factory=list)   # why SKIP
    flags: list = field(default_factory=list)     # needs her decision
    closing: date = None
    closing_raw: str = None
    years: tuple = (None, None, None)
    tier: str = ""
    matched: list = field(default_factory=list)
    gaps: list = field(default_factory=list)      # asked for, not on record
    match_pct: float = None


def _terms_in(text, profile):
    hits = []
    for term, rx in profile["vocab"].items():
        if re.search(rx, text, I):
            hits.append(term)
    return hits


def tier_of(title, profile):
    for tier, rx in profile["tiers"]:
        if re.search(rx, title or "", I):
            return tier
    return "2"


def classify(job, profile, today=None):
    """job: dict with company, title, text, optional posted (ISO), job_type."""
    today = today or today_melbourne(profile.get("timezone", "Australia/Melbourne"))
    text = job.get("text") or ""
    title = job.get("title") or ""
    full = title + "\n" + text
    rules = profile["rules"]
    v = Verdict(decision="PURSUE")

    # 1. closing date: shown if present, never required
    v.closing, v.closing_raw = extract_closing(text)
    if v.closing and v.closing < today:
        v.reasons.append("Closed on %s" % v.closing.strftime("%d/%m/%Y"))

    # 2. work rights and clearance
    for m in CITIZEN.finditer(full):
        window = full[max(0, m.start() - 200): m.end() + 250]
        if not INCLUSIVE.search(window):
            v.reasons.append("Citizenship or PR required")
            break
    if INTERNATIONAL_NO.search(full):
        v.reasons.append("International applicants not supported")
    if CLEARANCE_HARD.search(full):
        v.reasons.append("Security clearance required (NV1/NV2/Baseline/AGSVA)")
    elif CLEARANCE_SOFT.search(full):
        v.flags.append("Mentions a security clearance. Confirm it is only 'if required'.")
    if UNRESTRICTED.search(full):
        v.flags.append("Asks for full or unrestricted working rights. You hold a Student Visa (500) with hours limits until December 2026. Decide whether to apply.")
    if SPONSOR_FUTURE.search(full):
        v.flags.append("Sponsorship 'now or in the future' question. Held for you, never answered by the system.")

    # 3. level, pay, niche tools
    y = years_required(full)
    v.years = y
    if y[0] is not None:
        if y[0] >= rules["skip_years_at_or_above"] or (y[1] or 0) >= rules["skip_years_at_or_above"] and y[0] >= 3:
            v.reasons.append("Experience required: %s" % y[2])
        elif y[0] >= rules["flag_years_at_or_above"]:
            v.flags.append("Ad asks for '%s'. Your Cognizant support roles run May 2021 to Jul 2024; decide how it is presented." % y[2])
    if SENIOR_TITLE.search(title):
        v.reasons.append("Too senior (title)")
    if UNPAID.search(full):
        v.reasons.append("Unpaid")
    if (UNDERGRAD.search(title) and not POSTGRAD.search(title)) or UNDERGRAD_ONLY_TEXT.search(full):
        v.reasons.append("Requires undergraduate status")
    for rx, name in NICHE:
        if rx.search(full):
            v.reasons.append("Niche or excluded: %s" % name)
    if LANGUAGE.search(full):
        v.reasons.append("Requires a language not on your record")

    # 4. relevance
    terms = _terms_in(full, profile)
    if not (IT_TITLE.search(title) and (IT_STRONG.search(title) or len(terms) >= 2)):
        v.reasons.append("Not an IT role")

    # 5. fit
    ver = set(profile["skills_verified"])
    nope = set(profile["not_claimable"])
    v.matched = [t for t in terms if t in ver]
    v.gaps = [t for t in terms if t in nope]
    if len(v.matched) + len(v.gaps) >= 4:
        v.match_pct = round(len(v.matched) / (len(v.matched) + len(v.gaps)), 2)
        if v.match_pct < rules["min_match_flag"]:
            v.flags.append("Low skills match (%d%%). Most of the tools asked for are not on your record." % round(v.match_pct * 100))
    if v.gaps:
        v.flags.append("Asked for but NOT on your record, so never claimed: %s." % ", ".join(sorted(v.gaps)))

    # 6. practical flags
    if DRIVER.search(full):
        v.flags.append("A current driver's licence is required. Your licence status is not on record.")
    if SHIFT.search(full):
        v.flags.append("On-call, after-hours, rotating or weekend work is mentioned.")
    if FAITH.search(full):
        v.flags.append("The ad asks for support of a faith ethos. Decide whether you want to apply.")
    jt = (job.get("job_type") or "") + " " + full[:400]
    if re.search(r"full[\s-]?time|permanent|ongoing", jt, I):
        v.flags.append(profile["work_limit_note"])
    if not v.closing and job.get("posted"):
        try:
            age = (today - date.fromisoformat(job["posted"])).days
            if age > rules["stale_posted_days"]:
                v.flags.append("No closing date and posted %d days ago, so it may already be filled. Check before applying." % age)
        except ValueError:
            pass

    v.tier = tier_of(title, profile)
    if v.reasons:
        v.decision = "SKIP"
    return v
