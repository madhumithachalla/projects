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
- **Colors** — all colors are hex values inline in the `<style>` block at the top
  (matches your portfolio site's palette: deep purple `#100D18` background, `#C4A6FB` /
  `#A78BFA` / `#EDE4FF` accents).
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
