"""The hard gates. These functions are the only code that may answer 'can this
be submitted?'. Silence is never approval; the closing-soon lane is the single
exception and needs every condition to hold."""
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

APPROVED_STATES = {"Approved"}
STOP_CONDITIONS = ("account", "password", "captcha", "identity", "financial",
                   "self_identification", "sponsorship_future", "answer_not_on_file",
                   "blocked_site", "computer_not_linked")


def hours_to_close(role, now=None, tz="Australia/Melbourne"):
    """Hours until 11:59pm Melbourne on the closing date, or None when not listed."""
    if not role.get("closing"):
        return None
    now = now or datetime.now(ZoneInfo(tz))
    end = datetime.fromisoformat(role["closing"] + "T23:59:00").replace(tzinfo=ZoneInfo(tz))
    return (end - now).total_seconds() / 3600


def closing_soon_lane_ok(role, ctx, now=None, window_hours=24):
    """True only if the role closes within the window AND every condition holds.
    ctx keys: quality_gate_passed, calendar_clear, stops (list of stop conditions)."""
    h = hours_to_close(role, now)
    if h is None or h < 0 or h > window_hours:
        return False, "not within %d hours of closing" % window_hours
    if not ctx.get("quality_gate_passed"):
        return False, "quality gate not passed"
    if not ctx.get("calendar_clear"):
        return False, "calendar not clear (class or assessment)"
    stops = [s for s in ctx.get("stops", []) if s in STOP_CONDITIONS]
    if stops:
        return False, "stop condition: " + ", ".join(stops)
    return True, "closing-soon lane"


def can_submit(role, ctx=None, now=None):
    """(allowed, why). Approved roles may be submitted; nothing else except the lane."""
    ctx = ctx or {}
    if role.get("status") in APPROVED_STATES and not role.get("appliedAt"):
        stops = [s for s in ctx.get("stops", []) if s in STOP_CONDITIONS]
        if stops:
            return False, "stop condition: " + ", ".join(stops)
        return True, "approved"
    if role.get("status") == "Preview Sent":
        return closing_soon_lane_ok(role, ctx, now)
    return False, "status is %s" % role.get("status")
