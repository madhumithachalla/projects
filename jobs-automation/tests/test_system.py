import json
import os
import sys
import tempfile
import unittest
from datetime import date, datetime
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from jobsys import preview, seed
from jobsys.dates import extract_closing, priority
from jobsys.gates import can_submit, closing_soon_lane_ok, hours_to_close
from jobsys.portals import categorise, employer_type
from jobsys.profile import ROOT, load_profile
from jobsys.tracker import DuplicateError, Tracker

P = load_profile()
RULED = os.path.join(ROOT, "data", "ruled_out.json")
NOW = datetime(2026, 10, 8, 14, 0, tzinfo=ZoneInfo("Australia/Melbourne"))


def tmp_tracker():
    d = tempfile.mkdtemp()
    return Tracker(os.path.join(d, "t.json"), RULED)


class Dates(unittest.TestCase):
    def test_priority_tiers(self):
        t = date(2026, 10, 8)
        self.assertEqual(priority("2026-10-09", t), "CRITICAL")
        self.assertEqual(priority("2026-10-13", t), "URGENT")
        self.assertEqual(priority("2026-10-22", t), "NORMAL")
        self.assertEqual(priority("2026-10-28", t), "FUTURE")
        self.assertEqual(priority("2026-10-07", t), "CLOSED")
        self.assertEqual(priority(None, t), "NORMAL")          # no date is never skipped
        self.assertEqual(priority("2026-10-09", t, "Applied"), "")

    def test_posted_date_is_not_a_closing_date(self):
        self.assertEqual(extract_closing("Posted 01 October 2026. Great team."), (None, None))

    def test_formats(self):
        self.assertEqual(extract_closing("Applications Close: Thursday, 22 October 2026")[0], date(2026, 10, 22))
        self.assertEqual(extract_closing("Applications Close: 14/10/2026")[0], date(2026, 10, 14))
        self.assertEqual(extract_closing("closes October 31, 2026")[0], date(2026, 10, 31))


class Portals(unittest.TestCase):
    def test_indeed_short_link(self):
        n, c, note = categorise("https://to.indeed.com/aabc", "Capgemini")
        self.assertEqual((n, c), ("Indeed", "Job board")); self.assertIn("not checked", note)

    def test_graduate_and_ats_and_gov(self):
        self.assertEqual(categorise("https://au.gradconnection.com/x", "KPMG")[1], "Graduate platform")
        self.assertEqual(categorise("https://acme.wd3.myworkdayjobs.com/x", "Acme")[1], "Employer career site")
        self.assertEqual(categorise("https://www.apsjobs.gov.au/x", "ATO")[1], "Government")
        self.assertEqual(categorise("mailto:hr@x.com.au", "X")[1], "Email apply")
        self.assertEqual(categorise(None, "KPMG", "GradConnection")[1], "Graduate platform")

    def test_employer_types(self):
        self.assertEqual(employer_type("Woods & Co"), "Recruiter / agency")
        self.assertEqual(employer_type("VicRoads"), "Government")
        self.assertEqual(employer_type("Estia Health"), "Health / aged care")
        self.assertEqual(employer_type("Melbourne Polytechnic"), "Education")


class TrackerTests(unittest.TestCase):
    def test_dedupe_by_company_and_title(self):
        t = tmp_tracker(); t.add({"company": "Bank Australia", "title": "IT Service Desk Analyst"})
        with self.assertRaises(DuplicateError):
            t.add({"company": "Bank Australia Pty Ltd", "title": "IT Service Desk Analyst"})

    def test_dedupe_by_url(self):
        t = tmp_tracker(); t.add({"company": "A", "title": "B", "applyUrl": "https://x/1"})
        with self.assertRaises(DuplicateError):
            t.add({"company": "C", "title": "D", "applyUrl": "https://x/1"})

    def test_ruled_out_list_blocks_adaptovate(self):
        t = tmp_tracker()
        with self.assertRaises(DuplicateError) as cm:
            t.add({"company": "ADAPTOVATE", "title": "Graduate Forward Deployed AI Consultant"})
        self.assertIn("ruled-out", str(cm.exception))

    def test_transitions_and_timestamps(self):
        t = tmp_tracker(); r = t.add({"company": "A", "title": "B", "status": "Preview Sent"})
        t.set_status(r["roleId"], "Approved", by="madhumitha")
        self.assertTrue(r["approvedAt"].endswith("+11:00") or r["approvedAt"].endswith("+10:00"))
        t.set_status(r["roleId"], "Applied", by="Agent")
        self.assertEqual(r["appliedBy"], "Agent")
        with self.assertRaises(ValueError):
            t.set_status(r["roleId"], "Found")

    def test_cannot_approve_a_role_that_never_had_a_preview(self):
        t = tmp_tracker(); r = t.add({"company": "A", "title": "B"})
        with self.assertRaises(ValueError):
            t.set_status(r["roleId"], "Approved")

    def test_approve_all_only_touches_sent_previews(self):
        t = tmp_tracker()
        a = t.add({"company": "A", "title": "One", "status": "Preview Sent"})
        b = t.add({"company": "B", "title": "Two", "status": "Found"})
        self.assertEqual(t.approve_all(), [a["roleId"]]); self.assertEqual(b["status"], "Found")

    def test_roundtrip(self):
        t = tmp_tracker(); t.add({"company": "A", "title": "B"}); t.save()
        self.assertEqual(len(Tracker(t.path).roles), 1)


class Gates(unittest.TestCase):
    def role(self, **kw):
        r = {"roleId": "J1", "status": "Preview Sent", "closing": "2026-10-08"}; r.update(kw); return r

    def test_silence_is_not_approval(self):
        ok, why = can_submit(self.role(closing="2026-11-30"), {"quality_gate_passed": True, "calendar_clear": True}, NOW)
        self.assertFalse(ok)

    def test_no_closing_date_never_auto_submits(self):
        self.assertFalse(can_submit(self.role(closing=None), {"quality_gate_passed": True, "calendar_clear": True}, NOW)[0])

    def test_approved_role_can_submit(self):
        self.assertTrue(can_submit(self.role(status="Approved", closing=None), {}, NOW)[0])

    def test_approved_but_already_applied(self):
        self.assertFalse(can_submit(self.role(status="Approved", appliedAt="x"), {}, NOW)[0])

    def test_closing_soon_lane_needs_everything(self):
        base = {"quality_gate_passed": True, "calendar_clear": True}
        self.assertTrue(can_submit(self.role(), base, NOW)[0])
        self.assertFalse(can_submit(self.role(), {**base, "quality_gate_passed": False}, NOW)[0])
        self.assertFalse(can_submit(self.role(), {**base, "calendar_clear": False}, NOW)[0])
        for stop in ("account", "captcha", "self_identification", "sponsorship_future", "computer_not_linked"):
            self.assertFalse(can_submit(self.role(), {**base, "stops": [stop]}, NOW)[0], stop)

    def test_stop_condition_blocks_even_an_approved_role(self):
        self.assertFalse(can_submit(self.role(status="Approved"), {"stops": ["account"]}, NOW)[0])

    def test_lane_window(self):
        self.assertFalse(closing_soon_lane_ok(self.role(closing="2026-10-10"), {"quality_gate_passed": True, "calendar_clear": True}, NOW)[0])
        self.assertFalse(closing_soon_lane_ok(self.role(closing="2026-10-07"), {"quality_gate_passed": True, "calendar_clear": True}, NOW)[0])
        self.assertGreater(hours_to_close(self.role(), NOW), 9)


class Previews(unittest.TestCase):
    def setUp(self):
        with open(os.path.join(ROOT, "data", "tracker.json"), encoding="utf8") as f:
            self.d = json.load(f)

    def test_every_preview_has_no_dashes_and_states_closing(self):
        for r in self.d["roles"]:
            if r["status"] != "Preview Sent":
                continue
            m = preview.message(r, P)
            text = m["subject"] + m["body"]
            self.assertNotIn("—", text); self.assertNotIn("–", text)
            self.assertIn("Closes", m["subject"])
            self.assertIn("Nothing has been submitted", m["body"])
            self.assertIn("Sponsorship required: No", m["body"])
            if not r.get("closing"):
                self.assertIn("NOT LISTED", m["body"]); self.assertIn("not listed", m["subject"])

    def test_recipients_come_from_profile(self):
        self.assertEqual(preview.message(self.d["roles"][0], P)["to"], P["recipients"])

    def test_never_claims_unverified_skills(self):
        bad = ("ITIL experience", "ServiceNow experience", "JIRA experience", "RHEL experience")
        blob = json.dumps(P["evidence"]) + json.dumps(P["base_facts"])
        for b in bad:
            self.assertNotIn(b.lower(), blob.lower())
        self.assertFalse(set(P["skills_verified"]) & set(P["not_claimable"]))


class SeedData(unittest.TestCase):
    def test_seed_has_no_duplicates_and_every_role_categorised(self):
        roles = seed.build()["roles"]
        keys = [(r["company"].lower(), r["title"].lower()) for r in roles]
        self.assertEqual(len(keys), len(set(keys)))
        ids = [r["roleId"] for r in roles]
        self.assertEqual(len(ids), len(set(ids)))
        for r in roles:
            self.assertNotEqual(r["portalCategory"], "Other", r["roleId"])
            self.assertTrue(r["employerType"])

    def test_adaptovate_is_flagged_skip(self):
        r = next(r for r in seed.build()["roles"] if r["company"] == "ADAPTOVATE")
        self.assertTrue(any("Recommended: SKIP" in f for f in r["flags"]))


if __name__ == "__main__":
    unittest.main()
