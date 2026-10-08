# Corrected routine prompts (v8)

Paste into the two Cowork scheduled tasks. They call the engine so the rules live in one place and one test suite.
Attach the Gmail, Google Calendar and Indeed connectors to BOTH routines (the Night routine had no Gmail connector).

## Night run, 8:30 pm Melbourne, daily
Run the jobs-automation skill, Night run. Time zone Australia/Melbourne. Get the time with `TZ=Australia/Melbourne date` if current_time is unavailable.
1. Load tools in one ToolSearch call (Gmail search/send/get/label, Google Calendar list_events, Indeed search/details, ArtifactData).
2. In the JOBS repo run `python3 -m unittest discover -s tests`. If it fails, stop and email a one-line failure notice.
3. Gmail: make sure label JOBS and sub-labels exist. Process replies from rchmadhumitha@gmail.com (APPROVE, APPROVE ALL, SKIP, "I applied") with `python3 -m jobsys status` / `approve-all`. Silence is never approval.
4. Search per the playbook: Indeed always (no more than 5 detail lookups a minute; on a rate limit or connection error report it once and continue), Gmail alerts, then SEEK, LinkedIn, Prosple, GradConnection, APS Jobs, careers.vic.gov.au, university, health and company sites when a browser is linked. Save each ad's text to a file.
5. For each ad: `python3 -m jobsys ingest FILE --company ... --title ... --url ... --found-on ...`. It dedupes, applies the skip rules, categorises the portal and writes out/previews/<id>.json. Skipped roles are logged with reasons.
6. Send each out/previews/*.json (to, subject, body) with the Gmail connector. Cap 25 per night, CRITICAL, URGENT, NORMAL, FUTURE order; list the rest in the summary. Then `python3 -m jobsys status ID "Preview Sent"` for each one sent. A role with no closing date is still sent and says "not listed".
7. Closing-soon lane: for any role closing within 24 hours that is not approved, call `python3 -m jobsys can-submit ID --quality-gate --calendar-clear` only after the quality gate passed and the calendar is clear. Submit only if it prints ALLOWED. Otherwise set Manual Needed and send ACTION NEEDED.
8. `python3 -m jobsys build`; update the dashboard database and the workbook. Send the night summary to rchmadhumitha@gmail.com and mcha0218@student.monash.edu: needs attention first, then new roles, skipped with reasons, sources searched and not searched, blockers.
Rules: never create accounts, type passwords, solve CAPTCHAs or store credentials. No em dashes. Australian spelling. If this run stops on a usage limit, the next run first emails "Night run did not complete".

## Morning run, 8:00 am Melbourne, daily
Same tool loading and test step. Collect approvals (Gmail label:JOBS, dashboard, chat). For each Approved role in deadline order run `python3 -m jobsys can-submit ID`; submit only on ALLOWED, with the quality-gated PDFs, by email (her own Gmail only) or the linked browser. Set Applied only after a confirmation screen or sent email, via `python3 -m jobsys status ID Applied`. Any stop condition (account, password, CAPTCHA, identity or financial field, self-identification, sponsorship "now or in the future", answer not on file, blocked site, computer not linked): Manual Needed plus ACTION NEEDED email. Rescan for new CRITICAL roles. One report. Re-enable this routine in Cowork (it was off: device absent) and keep her computer awake and linked.
