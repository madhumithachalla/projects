"""Seed the tracker with the roles known on 08/10/2026 (master document + today's 21 previews)."""
import json
import os

from .portals import categorise, employer_type
from .profile import ROOT

TODAY = "2026-10-08"
LEAD_AT = "2026-10-08T14:00:00+11:00"   # first lead preview went out ~14:00 AEDT

# id, company, title, location, closing, url, tier, status, flags, extra
NEW = [
 ("J0033", "St Joseph's College", "ICT Technician (fixed term)", "Ferntree Gully VIC", "2026-10-14", "https://to.indeed.com/aafgzbwskhrj", "2",
  ["Key criterion asks for support of the Salesian faith ethos. Decide whether you want to apply.", "First Aid Level 2 is listed (willingness to obtain allowed); not on your record.", "Fixed-term full-time: confirm start date against the visa work limit until December 2026."]),
 ("J0034", "Melbourne Polytechnic", "Service Centre Technical Analyst", "Preston VIC", "2026-10-22", "https://to.indeed.com/aafplyd2l99j", "2",
  ["ITIL certification is desirable; you hold none, so it is not claimed.", "Portal needs pre-screening answers, a CV and a cover letter of up to 2 pages."]),
 ("J0005", "Bank Australia", "IT Service Desk Analyst", "Collingwood VIC", "2026-10-28", "https://to.indeed.com/aamwxtngbkvk", "2",
  ["Manage Engine is the ticketing tool in the ad; not on your record.", "After-hours support is expected."]),
 ("J0035", "Capgemini", "Service Desk Analyst", "Melbourne VIC", None, "https://to.indeed.com/aawvy92ksvbg", "2", ["Shift-based work is expected."]),
 ("J0036", "VicRoads", "Digital Platforms Support Analyst", "Melbourne VIC", None, "https://to.indeed.com/aakkd7bwfz6x", "2",
  ["Ad wants at least two years and hands-on Jira, Confluence and ServiceNow; those are not on your record."]),
 ("J0037", "Munro Footwear Group", "Graduate Integration Engineer", "Melbourne VIC", None, "https://to.indeed.com/aazsnmdqjhy9", "1",
  ["Boomi, Azure DevOps and CI/CD are not on your record and are not claimed."]),
 ("J0038", "Woods & Co", "IT Support Officer (recruiter ad)", "Melbourne VIC", None, "https://to.indeed.com/aadyqvckstcc", "2",
  ["Employer is unnamed. Salesforce, VoIP and ITIL are not on your record.", "Already in the email-apply queue: merge, do not duplicate."]),
 ("J0039", "Estia Health", "Service Desk Analyst (12-month fixed term)", "Melbourne VIC", None, "https://to.indeed.com/aa6p8wd6qj28", "2",
  ["Ad lists a minimum of 2 years in a similar service desk role. Decide how your Cognizant support roles are presented.", "Weekly after-hours rotation; influenza vaccination evidence required in flu season.", "Apply button only; emailed applications are not accepted."]),
 ("J0040", "WHSmith", "Entry Level IT Support Analyst", "Sydney NSW", None, "https://to.indeed.com/aajzvgx7wsqy", "2",
  ["Requires relocation to Sydney (hybrid, 3 days in the office).", "Weekend and extended-hours support are expected."]),
 ("J0041", "Oroton", "IT Service Desk Analyst", "Chippendale NSW", None, "https://to.indeed.com/aabnhqk6cpkj", "2",
  ["Requires relocation to Sydney.", "JIRA, Hyper-V, Mac builds, Meraki and Intune are not on your record and are not claimed.", "On-call roster applies."]),
 ("J0042", "ADAPTOVATE", "Graduate Forward Deployed AI Consultant", "Melbourne VIC", None, "https://to.indeed.com/aar8vd8kz4h7", "3B",
  ["ADAPTOVATE is an agile-transformation and change consultancy. It is on your ruled-out list as a poor fit; this preview was sent in error. Recommended: SKIP.", "Ad text says Sydney team and a Melbourne office; location unclear."]),
 ("J0043", "efex", "Service Desk Analyst", "Sydney NSW", None, "https://to.indeed.com/aasmp748zk8y", "2",
  ["Requires relocation to Sydney.", "Salesforce ticketing, RMM tools, firewalls and VOIP are not on your record."]),
 ("J0044", "Decjuba", "IT Support Officer", "Cremorne VIC", None, "https://to.indeed.com/aa79cyyymdbp", "2",
  ["Posted 07/09/2026 with no closing date, so it may be filled. Check first.", "RMM tools, Darktrace and CrowdStrike are not on your record."]),
 ("J0045", "Russell Kennedy", "Junior Systems Administrator", "Melbourne VIC", None, "https://to.indeed.com/aakkn8j8n269", "3",
  ["Posted 07/09/2026 with no closing date, so it may be filled. Check first.", "Veeam, Intune, Palo Alto, Terraform and ISO 27001 are not on your record."]),
 ("J0046", "Iress", "Support Analyst", "Melbourne VIC", None, "https://to.indeed.com/aapnq9qhmqjv", "2",
  ["Ad prefers a finance or economics background; not on your record, so not claimed."]),
 ("J0047", "REA Group", "Associate Software Engineer", "Richmond VIC", None, "https://to.indeed.com/aapjymjpjm2z", "3B",
  ["STRETCH: asks for 12 months of paid software development experience; yours is project and capstone work."]),
 ("J0048", "synogize", "Graduate Consultant, Data & Analytics", "South Melbourne VIC", None, "https://to.indeed.com/aaw6c9bfvsrp", "3B",
  ["dbt, Matillion, Snowflake, Tableau and Power BI are not on your record.", "Asks for full working rights: you hold a Student Visa (500). Confirm start date."]),
 ("J0049", "Bed Bath N' Table", "IT Systems Support Analyst", "Melbourne VIC", None, "https://to.indeed.com/aagpqbyhxz6k", "2",
  ["Posted 28/08/2026 with no closing date, so it may be filled. Check first.", "Apple iOS and wireless are not on your record.", "Rotating shifts and an after-hours roster apply."]),
 ("J0050", "Bega Group", "Regional Support Analyst", "Docklands VIC", None, "https://to.indeed.com/aag792r2gz9p", "2",
  ["Posted 30/07/2026 with no closing date; likely filled. Check before spending time.", "ITIL certification desired; you hold none."]),
 ("J0051", "Medical IT", "IT Support Administrator (remote)", "Canberra ACT (remote)", None, "https://to.indeed.com/aavljqr6ktqz", "2",
  ["A current Australian driver's licence is essential. Your licence status is not on record.", "Posted 04/08/2026 with no closing date; may be filled."]),
 ("J0052", "Amazon", "Software Development Graduate 2027", "Melbourne VIC", None, "https://to.indeed.com/aazww4xrjndc", "1",
  ["STRETCH: depth in C/C++ or Java OOP, distributed systems and optimisation maths is not on your record.", "Applications reviewed on a rolling basis; online assessment then three virtual interviews."]),
]
EARLIER = [
 ("J0001", "Court Services Victoria", "AVC Technology IT Support Specialist", "Melbourne VIC", "2026-10-06", "https://to.indeed.com/aahf22tff86k", "2", "Closed", ["Closed 06/10/2026 before a manual apply could be made."]),
 ("J0002", "City of Boroondara", "Test Analyst (FT to Aug 2027)", "Camberwell VIC", "2026-10-07", None, "3B", "Closed", ["Closed 07/10/2026. Resume needed a rebuild first."]),
 ("J0003", "City of Melbourne", "Service Analyst (2yr contract)", "Melbourne VIC", "2026-10-09", "https://to.indeed.com/aac2yxclfytr", "2", "Manual Needed", ["Portal requires an account (sign-in needed from you).", "Documents may carry old visa wording: regenerate."]),
 ("J0004", "Motorola Solutions", "Graduate Engineer", "Melbourne VIC", None, "https://to.indeed.com/aacbfpwcvq6b", "1", "Manual Needed", ["External portal needs an account.", "Documents may carry old visa wording: regenerate."]),
 ("J0031", "KPMG Australia", "2027 Graduate Program, Technology and Digital", "Melbourne VIC", "2026-10-31", None, "1", "Materials Ready", ["Resume needs a rebuild to the locked skeleton.", "Visa wording needs care: Student Visa (500) now, 485 from December 2026."]),
 ("J0032", "ACS Foundation", "Graduate Quality Assurance Analyst", "Melbourne VIC", "2026-10-23", None, "3B", "Found", ["Start date is October 2026 but you cannot start full-time until December 2026. Ask first."]),
]


def _role(rid, company, title, loc, closing, url, tier, status, flags, found_on, foundDate=TODAY, preview=False):
    pname, cat, note = categorise(url, company, found_on)
    r = {"roleId": rid, "company": company, "title": title, "location": loc, "salary": "", "closing": closing,
         "foundOn": found_on, "portalName": pname, "portalCategory": cat, "portalNote": note, "employerType": employer_type(company, title),
         "applyUrl": url, "applyRoute": "Indeed link (employer page unchecked)" if "indeed" in (url or "") else "unknown",
         "accountNeeded": "Unknown", "tier": tier, "status": status, "previewType": "LEAD" if preview else "",
         "foundDate": foundDate, "flags": flags, "matched": [], "notes": ""}
    if preview:
        r["previewAt"] = LEAD_AT
    return r


def build():
    roles = []
    for rid, c, t, l, cl, u, tier, st, fl in EARLIER:
        found = {"J0002": "Gov or council site", "J0031": "GradConnection", "J0032": "GradConnection"}.get(rid, "Indeed")
        r = _role(rid, c, t, l, cl, u, tier, st, fl, found, foundDate="2026-10-05")
        if rid in ("J0003", "J0004"):
            r["approvedAt"] = "2026-10-05T00:00:00+11:00"
        roles.append(r)
    for rid, c, t, l, cl, u, tier, fl in NEW:
        roles.append(_role(rid, c, t, l, cl, u, tier, "Preview Sent", fl, "Indeed", preview=True))
    # Bank Australia was already J0005 before today's preview: it keeps foundDate 2026-10-06
    for r in roles:
        if r["roleId"] == "J0005":
            r["foundDate"] = "2026-10-06"
    roles.sort(key=lambda r: r["roleId"])
    return {"roles": roles, "events": [{"at": LEAD_AT, "roleId": r["roleId"], "event": "Lead preview sent", "detail": "Seeded from the 08/10/2026 batch"} for r in roles if r.get("previewType")]}


def write(path=None):
    path = path or os.path.join(ROOT, "data", "tracker.json")
    with open(path, "w", encoding="utf8") as f:
        json.dump(build(), f, indent=2, ensure_ascii=False)
        f.write("\n")
    return path
