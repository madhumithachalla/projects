# LinkedIn banner — source

This is the actual code behind your LinkedIn banner (`madhumitha_linkedin_banner.png`).
It's plain HTML/CSS (`banner.html`) rendered to an exact 1584×396px PNG using a small
script (`render.js`) — no design tool involved, so every pixel is exactly where the code
puts it.

## To edit the banner

Everything — text, colors, fonts, layout, the meteor streaks — lives in `banner.html`.
Open it in any text editor. A few useful spots:

- **Your name / tagline / tech pills / contact line** — search for the `.content` div
  near the bottom of the `<body>`, plain HTML you can edit directly.
- **The "aka Female Photon..." signature** — the `.signature` div, right after `.content`.
- **Colors** — all colors are hex values inline in the `<style>` block at the top,
  matching the portfolio site's full accent palette (not just one hue): deep purple
  `#0D0A16` background, with coral `#FF6F5E`, amber `#FFCB73`, teal `#2DD4BF`, and
  violet `#C4A6FB` used across the name gradient, tech pills, and meteor streaks.
- **Contact line** — currently shows the portfolio URL, email, LinkedIn, and GitHub in
  that order, at a small font (13px) so all four fit on one line at the banner's
  1584px width. Add/remove a `<span>` + `<span class="dot">·</span>` pair to change it,
  and re-check that it still fits without wrapping after editing.
- **The left-clear zone for your profile photo** — `.content { left: 540px; ... }`.
  Don't reduce this below ~500px — LinkedIn's mobile app renders your profile circle
  much bigger than the desktop view does, and 540px is the smallest margin that clears
  both (verified against an actual screenshot of your live profile).

## To regenerate the PNG after editing

You'll need [Node.js](https://nodejs.org) installed, plus Playwright (a browser
automation library) to render the HTML into a pixel-perfect image:

```bash
cd projects/linkedin-banner
npm install playwright
npx playwright install chromium
node render.js
```

This produces `linkedin_banner.png` at 2x resolution (3168×792) for crisp text, so
resize it down to the exact required 1584×396 before uploading to LinkedIn:

```bash
python3 -c "
from PIL import Image
im = Image.open('linkedin_banner.png')
im = im.resize((1584, 396), Image.LANCZOS)
im.save('linkedin_banner_final.png')
"
```

(Needs Pillow: `pip install Pillow`.)

Then upload `linkedin_banner_final.png` to LinkedIn as your banner image.
