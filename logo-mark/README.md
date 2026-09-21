# Logo mark — source

**Solo personal project**

My own personal mark: an "M" and a "C" drawn as one continuous flowing line that
reads as an infinity loop, sitting on a small hand-drawn cosmic badge (a tiny Mars
and Saturn scene). It lives in the nav bar of my [portfolio site](https://madhumithachalla.github.io)
and, in a smaller corner version, in its footer.

## How it's built

The monogram's shape is my own handwriting: I hand-drew an M/C infinity loop and
sent over photos of it, and the "M" and "C" you see are traced from those —
hours of plotting and nudging cubic-bezier control points to match my actual
pen strokes, not a font or an auto-traced vector effect. The output ships as a
single smooth SVG `<path>` rather than an embedded scan, so it stays crisp at
any size while still being genuinely my handwriting. A glowing "photon" orbits
the loop continuously, trailed by a small fading dust trail in six colors, all
driven by native SVG `animateMotion` following that same path — no JS
animation library.

The cosmic badge underneath is the same idea at a size most logos wouldn't bother
with: a tiny Mars and Saturn rendered in flat SVG shapes and radial gradients, sitting
behind the monogram.

## Files

- `logo-mark.svg` — the mark standalone: cosmic badge + monogram + orbiting
  photon, as it appears in the nav bar.
- `live-demo.html` — the mark rendered at a larger scale with the animation
  running, plus the corner-badge version used in the footer. Open directly in a
  browser, no build step.
