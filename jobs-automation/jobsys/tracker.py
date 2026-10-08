"""JSON tracker: one record per role, an event log, dedupe and timestamped transitions."""
import json
import os
import re
from datetime import datetime
from zoneinfo import ZoneInfo

from .dates import priority, today_melbourne

STATUSES = ["Found", "Materials Ready", "Preview Sent", "Approved", "Applied",
            "Manual Needed", "Skipped", "Interview", "Offer", "Rejected", "Closed"]
TRANSITIONS = {
    "Found": {"Materials Ready", "Preview Sent", "Skipped", "Closed"},
    "Materials Ready": {"Preview Sent", "Skipped", "Closed"},
    "Preview Sent": {"Approved", "Skipped", "Closed", "Manual Needed", "Applied"},
    "Approved": {"Applied", "Manual Needed", "Skipped", "Closed", "Preview Sent"},
    "Manual Needed": {"Applied", "Approved", "Skipped", "Closed"},
    "Applied": {"Interview", "Rejected", "Offer", "Closed"},
    "Interview": {"Offer", "Rejected", "Closed"},
    "Offer": {"Closed", "Rejected"},
    "Skipped": {"Found"},
    "Rejected": set(),
    "Closed": set(),
}
STAMP = {"Preview Sent": "previewAt", "Approved": "approvedAt", "Applied": "appliedAt", "Skipped": "skippedAt"}
_STRIP = re.compile(r"\b(pty|ltd|limited|inc|llc|group|the|australia|australian)\b|[^a-z0-9 ]")


def norm(s):
    return re.sub(r"\s+", " ", _STRIP.sub(" ", (s or "").lower())).strip()


def key(company, title):
    return norm(company) + "|" + norm(title)


def now_iso(tz="Australia/Melbourne"):
    return datetime.now(ZoneInfo(tz)).replace(microsecond=0).isoformat()


class DuplicateError(ValueError):
    pass


class Tracker:
    def __init__(self, path, ruled_out_path=None):
        self.path = path
        self.data = {"roles": [], "events": []}
        if os.path.exists(path):
            with open(path, encoding="utf8") as f:
                self.data = json.load(f)
        self.ruled_out = []
        if ruled_out_path and os.path.exists(ruled_out_path):
            with open(ruled_out_path, encoding="utf8") as f:
                self.ruled_out = json.load(f)

    @property
    def roles(self):
        return self.data["roles"]

    def save(self):
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        with open(self.path, "w", encoding="utf8") as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
            f.write("\n")

    def get(self, role_id):
        return next((r for r in self.roles if r["roleId"] == role_id), None)

    def find_duplicate(self, company, title, url=None):
        k = key(company, title)
        for r in self.roles:
            if key(r["company"], r["title"]) == k or (url and r.get("applyUrl") == url):
                return "tracked as %s" % r["roleId"]
        for ro in self.ruled_out:
            if norm(ro["company"]) == norm(company) and (not ro.get("title") or norm(ro["title"]) in norm(title) or norm(title) in norm(ro["title"])):
                return "on the ruled-out list (%s)" % ro["reason"]
        return None

    def next_id(self):
        nums = [int(r["roleId"][1:]) for r in self.roles if re.fullmatch(r"J\d+", r["roleId"])]
        return "J%04d" % (max(nums + [0]) + 1)

    def add(self, role, allow_duplicate=False):
        dup = self.find_duplicate(role["company"], role["title"], role.get("applyUrl"))
        if dup and not allow_duplicate:
            raise DuplicateError("%s | %s: %s" % (role["company"], role["title"], dup))
        role = dict(role)
        role.setdefault("roleId", self.next_id())
        role.setdefault("status", "Found")
        role.setdefault("foundDate", today_melbourne().isoformat())
        self.roles.append(role)
        self.event(role["roleId"], "Added", "status %s" % role["status"])
        return role

    def event(self, role_id, event, detail=""):
        self.data["events"].append({"at": now_iso(), "roleId": role_id, "event": event, "detail": detail})

    def set_status(self, role_id, status, by="system", detail=""):
        r = self.get(role_id)
        if r is None:
            raise KeyError(role_id)
        if status not in STATUSES:
            raise ValueError("unknown status %r" % status)
        if status != r["status"] and status not in TRANSITIONS.get(r["status"], set()):
            raise ValueError("%s: cannot go from %s to %s" % (role_id, r["status"], status))
        if status == "Approved" and r["status"] != "Preview Sent" and r["status"] not in ("Manual Needed",):
            raise ValueError("%s: only a role with a sent preview can be approved" % role_id)
        r["status"] = status
        ts = now_iso()
        if status in STAMP:
            r[STAMP[status]] = ts
        if status == "Approved":
            r["approvedBy"] = by
        if status == "Applied":
            r["appliedBy"] = by
        self.event(role_id, status, detail or "by " + by)
        return r

    def approve_all(self, by="madhumitha"):
        """APPROVE ALL approves only roles with a sent preview (never a Found role)."""
        out = []
        for r in self.roles:
            if r["status"] == "Preview Sent":
                self.set_status(r["roleId"], "Approved", by=by, detail="APPROVE ALL")
                out.append(r["roleId"])
        return out

    def enriched(self, today=None):
        today = today or today_melbourne()
        out = []
        for r in self.roles:
            x = dict(r)
            x["closingKnown"] = bool(r.get("closing"))
            x["priority"] = priority(r.get("closing"), today, r.get("status"))
            out.append(x)
        return out
