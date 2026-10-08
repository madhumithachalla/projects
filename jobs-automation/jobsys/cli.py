"""Command line: python -m jobsys <command>

  seed                      write data/tracker.json from the known roles
  classify FILE [--company --title --url --posted --json]   run the rules on an ad's text
  ingest FILE ...           classify an ad, dedupe, add to the tracker, write its LEAD preview
  list [--status S] [--category C]
  status ID STATUS          move a role (validated, timestamped)
  approve-all               approve every role that has a sent preview
  can-submit ID [--quality-gate --calendar-clear --stop X]
  previews                  write out/previews/<id>.json for every Preview Sent role
  build                     rewrite dashboard/data.js from the tracker
"""
import argparse
import json
import os
import sys

from . import seed as seedmod
from .dates import fmt_dmy
from .gates import can_submit
from .portals import categorise, employer_type
from .preview import message
from .profile import ROOT, load_profile
from .rules import classify
from .tracker import DuplicateError, Tracker

DATA = os.path.join(ROOT, "data")
TRACKER = os.path.join(DATA, "tracker.json")
RULED = os.path.join(DATA, "ruled_out.json")


def tracker():
    return Tracker(TRACKER, RULED)


def cmd_classify(a, profile):
    text = open(a.file, encoding="utf8").read()
    v = classify({"company": a.company, "title": a.title, "text": text, "posted": a.posted}, profile)
    if a.json:
        print(json.dumps({"decision": v.decision, "reasons": v.reasons, "flags": v.flags, "closing": v.closing.isoformat() if v.closing else None,
                          "tier": v.tier, "matched": v.matched, "gaps": v.gaps, "match_pct": v.match_pct}, indent=2))
        return 0
    print("%s | %s | %s" % (v.decision, a.company, a.title))
    print("Closes:", fmt_dmy(v.closing) if v.closing else "NOT LISTED (still tracked, NORMAL priority)")
    for r in v.reasons:
        print("  SKIP because:", r)
    for f in v.flags:
        print("  FLAG:", f)
    return 0 if v.decision == "PURSUE" else 3


def cmd_ingest(a, profile):
    t = tracker()
    code = 0
    for path in a.files:
        text = open(path, encoding="utf8").read()
        v = classify({"company": a.company, "title": a.title, "text": text, "posted": a.posted, "job_type": a.job_type}, profile)
        dup = t.find_duplicate(a.company, a.title, a.url)
        if dup:
            print("DUPLICATE, not added: %s | %s: %s" % (a.company, a.title, dup)); code = 2; continue
        pname, cat, note = categorise(a.url, a.company, a.found_on)
        role = {"company": a.company, "title": a.title, "location": a.location, "salary": a.salary,
                "closing": v.closing.isoformat() if v.closing else None, "foundOn": a.found_on, "portalName": pname,
                "portalCategory": cat, "portalNote": note, "employerType": employer_type(a.company, a.title), "applyUrl": a.url, "tier": v.tier, "flags": v.flags,
                "matched": v.matched, "gaps": v.gaps}
        if v.decision == "SKIP":
            role.update(status="Skipped", notes="; ".join(v.reasons))
            r = t.add(role); t.event(r["roleId"], "Skipped", role["notes"])
            print("SKIPPED %s: %s" % (r["roleId"], role["notes"]))
        else:
            role.update(status="Found", previewType="LEAD")
            r = t.add(role)
            m = message(r, profile)
            os.makedirs(os.path.join(ROOT, "out", "previews"), exist_ok=True)
            json.dump(m, open(os.path.join(ROOT, "out", "previews", r["roleId"] + ".json"), "w"), indent=2)
            print("ADDED %s | closes %s | preview written to out/previews/%s.json" % (r["roleId"], fmt_dmy(v.closing) if v.closing else "not listed", r["roleId"]))
    t.save()
    return code


def cmd_list(a, profile):
    t = tracker()
    for r in t.enriched():
        if a.status and r["status"] != a.status:
            continue
        if a.category and r["portalCategory"] != a.category:
            continue
        print("%-6s %-9s %-15s %-12s %-24s %s" % (r["roleId"], r["priority"] or "-", r["status"], fmt_dmy(r["closing"]) if r.get("closing") else "not listed", r["portalCategory"][:24], r["company"] + " | " + r["title"]))
    return 0


def cmd_status(a, profile):
    t = tracker(); t.set_status(a.id, a.status, by="cli"); t.save(); print(a.id, "->", a.status); return 0


def cmd_approve_all(a, profile):
    t = tracker(); ids = t.approve_all(); t.save(); print("approved", len(ids), "roles"); return 0


def cmd_can_submit(a, profile):
    t = tracker(); r = t.get(a.id)
    ok, why = can_submit(r, {"quality_gate_passed": a.quality_gate, "calendar_clear": a.calendar_clear, "stops": a.stop or []})
    print(("ALLOWED" if ok else "BLOCKED") + ": " + why); return 0 if ok else 4


def cmd_previews(a, profile):
    t = tracker(); out = os.path.join(ROOT, "out", "previews"); os.makedirs(out, exist_ok=True); n = 0
    for r in t.enriched():
        if r["status"] == "Preview Sent":
            json.dump(message(r, profile, flags=r.get("flags", []), matched=r.get("matched", [])), open(os.path.join(out, r["roleId"] + ".json"), "w"), indent=2); n += 1
    print("wrote", n, "previews to", out); return 0


def cmd_build(a, profile):
    t = tracker()
    os.makedirs(os.path.join(ROOT, "dashboard"), exist_ok=True)
    with open(os.path.join(ROOT, "dashboard", "data.js"), "w", encoding="utf8") as f:
        f.write("window.JOBS_DATA = " + json.dumps({"roles": t.enriched(), "events": t.data["events"][-200:], "profile": {"name": profile["name"]}}, ensure_ascii=False) + ";\n")
    print("dashboard/data.js written with", len(t.roles), "roles"); return 0


def main(argv=None):
    p = argparse.ArgumentParser(prog="jobsys", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--profile", default="madhumitha")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("seed"); s.set_defaults(fn=lambda a, pr: print("wrote", seedmod.write()) or 0)
    c = sub.add_parser("classify"); c.add_argument("file"); c.add_argument("--company", default=""); c.add_argument("--title", default=""); c.add_argument("--posted"); c.add_argument("--json", action="store_true"); c.set_defaults(fn=cmd_classify)
    i = sub.add_parser("ingest"); i.add_argument("files", nargs="+"); i.add_argument("--company", required=True); i.add_argument("--title", required=True)
    i.add_argument("--url"); i.add_argument("--location", default=""); i.add_argument("--salary", default=""); i.add_argument("--found-on", default="Indeed"); i.add_argument("--posted"); i.add_argument("--job-type", default=""); i.set_defaults(fn=cmd_ingest)
    l = sub.add_parser("list"); l.add_argument("--status"); l.add_argument("--category"); l.set_defaults(fn=cmd_list)
    st = sub.add_parser("status"); st.add_argument("id"); st.add_argument("status"); st.set_defaults(fn=cmd_status)
    sub.add_parser("approve-all").set_defaults(fn=cmd_approve_all)
    cs = sub.add_parser("can-submit"); cs.add_argument("id"); cs.add_argument("--quality-gate", action="store_true"); cs.add_argument("--calendar-clear", action="store_true"); cs.add_argument("--stop", action="append"); cs.set_defaults(fn=cmd_can_submit)
    sub.add_parser("previews").set_defaults(fn=cmd_previews)
    sub.add_parser("build").set_defaults(fn=cmd_build)
    a = p.parse_args(argv)
    try:
        return a.fn(a, load_profile(a.profile))
    except (DuplicateError, ValueError, KeyError) as e:
        print("ERROR:", e, file=sys.stderr); return 2


if __name__ == "__main__":
    sys.exit(main())
