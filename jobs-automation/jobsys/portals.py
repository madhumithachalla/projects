"""Classify where a role was found and how it will be applied for.

Categories are the single list used by the tracker, the dashboard, the Gmail
sub-labels (JOBS/<Label>) and the previews.
"""
import re
from urllib.parse import urlparse

CATEGORIES = {
    "Job board": "Board",
    "Graduate platform": "Graduate",
    "Employer career site": "Employer",
    "Government": "Government",
    "University / education": "University",
    "Health / aged care": "Health",
    "Recruiter / agency": "Recruiter",
    "Email apply": "Email-apply",
    "Gmail alert": "Alert",
    "Other": "Other",
}

_HOSTS = [
    (r"(^|\.)(indeed\.com|seek\.com\.au|seek\.co\.nz|linkedin\.com|jora\.com|glassdoor\.com|careerone\.com\.au)$", "Job board"),
    (r"(^|\.)(prosple\.com|gradconnection\.com|gradaustralia\.com\.au|graduateland\.com)$", "Graduate platform"),
    (r"(^|\.)(apsjobs\.gov\.au|vic\.gov\.au|nsw\.gov\.au|qld\.gov\.au|sa\.gov\.au|wa\.gov\.au|act\.gov\.au|tas\.gov\.au|nt\.gov\.au|gov\.au)$", "Government"),
    (r"(\.edu\.au|\.ac\.nz)$|(^|\.)(monash\.edu|unimelb\.edu\.au)$", "University / education"),
    (r"(myworkdayjobs\.com|workday\.com|greenhouse\.io|lever\.co|smartrecruiters\.com|successfactors\.(com|eu)|taleo\.net|icims\.com|jobvite\.com|ashbyhq\.com|bamboohr\.com|livehire\.com|pageuppeople\.com|elmotalent\.com\.au|employmenthero\.com|recruitee\.com)$", "Employer career site"),
]
_NAMES = [
    (r"\b(woods\s*&?\s*co|hays|randstad|robert half|michael page|hudson|talent international|peoplebank|chandler macleod|kelly services|adecco|manpower|programmed|davidson|ignite|paxus|fusion5|talent)\b", "Recruiter / agency"),
    (r"\b(estia|bupa|hospital|health network|aged care|medhealth|ramsay|healthscope|st john|ambulance|medical)\b", "Health / aged care"),
    (r"\b(university|polytechnic|tafe|college|school)\b", "University / education"),
    (r"\b(council|city of|shire|department|dept|vicroads|state government|australian public service)\b", "Government"),
]


FOUND_ON = {
    "indeed": "Job board", "seek": "Job board", "linkedin": "Job board", "jora": "Job board",
    "prosple": "Graduate platform", "gradconnection": "Graduate platform", "grad australia": "Graduate platform",
    "company site": "Employer career site", "aps jobs": "Government", "gov or council site": "Government",
    "university site": "University / education", "gmail alert": "Gmail alert", "email": "Email apply",
}

EMPLOYER_TYPES = [
    ("Recruiter / agency", r"\b(woods\s*&?\s*co|hays|randstad|robert half|michael page|hudson|talent international|peoplebank|chandler macleod|kelly services|adecco|manpower|programmed|davidson|ignite|paxus|recruitment)\b"),
    ("Government", r"\b(council|city of|shire|department|vicroads|court services|state government|public service|authority|nbn|services victoria)\b"),
    ("Education", r"\b(university|polytechnic|tafe|college|school|institute|academy)\b"),
    ("Health / aged care", r"\b(estia|bupa|hospital|health|aged care|medhealth|ramsay|healthscope|ambulance|medical)\b"),
    ("Financial services", r"\b(bank|banking|insurance|insurer|super|financial|capital|investment|iress|kpmg|deloitte|pwc|ey\b)"),
    ("Retail / consumer", r"\b(oroton|decjuba|whsmith|bed bath|munro|footwear|kogan|myer|woolworths|coles|dulux|bega|pfd|food)\b"),
    ("Technology / consulting", r"\b(capgemini|amazon|aws|rea group|synogize|efex|dxc|accenture|ibm|cognizant|infosys|telstra|consult|technolog|software|cloud|adaptovate|acs foundation|motorola)\b"),
]


def employer_type(company="", title=""):
    low = (company or "").lower()
    for label, pat in EMPLOYER_TYPES:
        if re.search(pat, low, re.I):
            return label
    return "Other"


def host_of(url):
    try:
        h = (urlparse(url).hostname or "").lower()
    except ValueError:
        return ""
    return h[4:] if h.startswith("www.") else h


def categorise(url=None, company="", found_on=None, apply_email=None):
    """Return (portal_name, category, note).

    Indeed short links (to.indeed.com) hide the employer's apply page, so the
    note says the real route is unchecked rather than guessing it."""
    if apply_email or (url or "").startswith("mailto:"):
        return "Email", "Email apply", ""
    h = host_of(url or "")
    if not url and found_on and found_on.lower() in FOUND_ON:
        return found_on, FOUND_ON[found_on.lower()], ""
    if h == "to.indeed.com" or h.endswith("indeed.com"):
        return "Indeed", "Job board", "Indeed link; employer apply page not checked yet"
    for pat, cat in _HOSTS:
        if re.search(pat, h):
            name = h.split(".")[0].capitalize() if h else (found_on or "Unknown")
            return (found_on or name), cat, ""
    low = (company or "").lower()
    for pat, cat in _NAMES:
        if re.search(pat, low):
            return (found_on or h or "Unknown"), cat, ""
    if found_on in ("Gmail alert",):
        return "Gmail alert", "Gmail alert", ""
    if h:
        return h, "Employer career site", ""
    return found_on or "Unknown", "Other", ""
