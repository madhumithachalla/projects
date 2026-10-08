"""Render a LEAD preview (no resume attached) from a tracker record + verdict facts.

Rules baked in: closing date shown or 'NOT LISTED', never a made-up skill,
'not on your record' lines for anything the ad wants that she lacks, and no
em or en dashes anywhere."""
import re

from .dates import fmt_dmy

DASHES = re.compile("[—–]")


def clean(s):
    return DASHES.sub("-", s)


def subject(role):
    parts = [role["company"], role["title"], role.get("location") or "Australia"]
    closes = "Closes: not listed" if not role.get("closing") else "Closes %s" % fmt_dmy(role["closing"])[:5]
    return clean("PREVIEW | %s | %s | Reply APPROVE, SKIP or changes" % (" | ".join(parts), closes))


def fit_lines(matched, profile, limit=6):
    seen, out = set(), []
    for t in matched:
        line = profile["evidence"].get(t)
        if line and line not in seen:
            seen.add(line)
            out.append(line)
        if len(out) >= limit:
            break
    for b in profile["base_facts"]:
        if len(out) >= 3:
            break
        out.append(b)
    return out


def body(role, profile, matched=None, flags=None, gaps=None, number=None, total=None):
    matched = matched if matched is not None else role.get("matched", [])
    flags = flags if flags is not None else role.get("flags", [])
    closes = fmt_dmy(role.get("closing")) if role.get("closing") else "NOT LISTED on the ad."
    if not role.get("closing"):
        closes += " Treated as NORMAL priority. Apply early."
    head = "Role %s of %s. " % (number, total) if number else ""
    lines = [
        "%sPortal: %s (%s). Tier %s." % (head, role.get("portalName", "?"), role.get("portalCategory", "?"), role.get("tier", "?")),
        "",
        "Company: " + role["company"],
        "Role: " + role["title"],
        "Location: " + (role.get("location") or "not listed"),
        "Salary: " + (role.get("salary") or "not listed"),
        "Closes: " + closes,
        "Apply: " + (role.get("applyUrl") or "not recorded"),
    ]
    if role.get("portalNote"):
        lines.append("Note: " + role["portalNote"])
    lines += ["", "Why it fits (verified record only):"]
    lines += ["- " + l for l in fit_lines(matched, profile)]
    lines += ["", "Needs your decision:"]
    lines += ["- " + f for f in flags] if flags else ["- Nothing flagged."]
    if profile.get("checks_note"):
        lines += ["", profile["checks_note"]]
    lines += [
        "",
        "STATUS: Lead preview only. Nothing has been submitted. Resume and cover letter are generated once you approve.",
        "Reply APPROVE to prepare and apply, SKIP to drop, or describe changes. Or press Approve on the dashboard.",
        "Visa on forms: " + profile["visa_line"],
        "Source: %s, found %s." % (role.get("foundOn", "?"), fmt_dmy(role["foundDate"]) if role.get("foundDate") else "?"),
    ]
    return clean("\n".join(lines))


def message(role, profile, **kw):
    return {"to": profile["recipients"], "subject": subject(role), "body": body(role, profile, **kw), "roleId": role["roleId"]}
