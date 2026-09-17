# LinkedIn banner — source

**Solo personal project**

This is the actual code behind my LinkedIn banner (`madhumitha_linkedin_banner.png`).
It's plain HTML/CSS (`banner.html`) rendered to an exact 1584×396px PNG using a small
Node.js script (`render.js`) — no design tool (Canva, Figma, etc.) involved anywhere in
the pipeline, so every pixel is exactly where the code puts it and the whole thing is
reproducible from source.

## Why it exists

Design tools make pixel-perfect, brand-consistent output slow to iterate on — every
tweak means reopening the tool, re-exporting, and re-checking the exact 1584×396 crop.
Building the banner as HTML/CSS instead means it shares the portfolio site's actual
design tokens (the same accent palette, same visual language), and any change is a text
edit plus a one-command re-render, with the browser guaranteeing pixel-accurate layout
every time.

## Architecture

- **`banner.html`** is the actual banner design: pure HTML/CSS at a fixed 1584×396px
  canvas size (LinkedIn's exact banner spec), no JavaScript. Layout, gradient meteor
  streaks, the name treatment, tech pills, and the contact line are all CSS — nothing is
  a raster image.
- **`render.js`** uses [Playwright](https://playwright.dev/) to launch headless Chromium,
  open `banner.html` at the exact banner viewport with `deviceScaleFactor: 2` (for a
  crisp, high-DPI screenshot), wait briefly for web fonts to finish loading, then
  screenshot the page to a PNG. This is why the output has zero design-tool artifacts —
  it's a literal, exact screenshot of real rendered HTML/CSS, not a re-interpretation of
  one.
- **`editor.html`** is a separate, self-contained tool: the same banner design made
  `contenteditable` directly in the browser, so non-technical edits (change the tagline,
  swap a tech pill) don't require touching code at all. See below.

## Live editor (no code editing needed)

[**`editor.html`**](./editor.html) is an in-browser version of the banner you can edit
directly — click any text (name, tagline, pills, contact line, signature) to change it
in place, add/remove tech pills, then click **Download PNG**, **Download JPEG**, or
**Download PDF** to export, all sized to LinkedIn's exact 1584×396 spec. Runs entirely
client-side (via [html2canvas](https://html2canvas.hertzen.com/) and
[jsPDF](https://github.com/parallax/jsPDF), loaded from cdnjs) — nothing is uploaded
anywhere. Open it directly in a browser, or via GitHub Pages once this repo has Pages
enabled.

## To edit the banner via code

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
cd projects/linkedin-banner-generator
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

## Files here

- `banner.html` — the actual banner design (HTML/CSS, no JS).
- `render.js` — Playwright script that screenshots `banner.html` to a PNG.
- `editor.html` — the live, in-browser contenteditable editor with PNG/JPEG/PDF export.
- `madhumitha_linkedin_banner.png` — the current rendered output.

## Limitations

- `render.js` needs Playwright's bundled Chromium installed locally — it isn't a
  zero-dependency script, unlike `editor.html`, which needs only a browser.
- The 540px left-clear zone for the profile photo is tuned to LinkedIn's current profile
  photo size and position on both desktop and mobile as of when this was built; if
  LinkedIn changes that layout, the margin may need rechecking against a live profile.

**Stack:** HTML/CSS, Node.js, Playwright (render), html2canvas + jsPDF via CDN (editor)
