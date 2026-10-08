# Resume builder fixes (areas/application-pack-builder.md)

Quality gate says never below 9pt fonts or 0.6 inch margins. The old builder used 8pt and 8.5pt lines and top/bottom margins of 0.55 and 0.51 inch.

- `base()`: `s.top_margin = Cm(1.6); s.bottom_margin = Cm(1.6)` (0.63 inch); keep left/right 1.8 cm.
- Contact, tagline and work-rights lines: `size=9`, not 8 or 8.5. If the page count goes over 2, trim content, never the font.
- Contact line follows the locked skeleton: `Melbourne, VIC | +61 468 934 292 | rchmadhumitha@gmail.com | linkedin.com/in/madhumitha-challa | AWS CCP`.
- References: print `References available on request` only (locked skeleton). Named referees only when a form asks.
- Cover letter date: `datetime.now(ZoneInfo("Australia/Melbourne")).strftime("%-d %B %Y")`, not a fixed date.
- Output folder: not the hard-coded `/home/claude/jobs_out/applications`.
