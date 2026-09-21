# Logo mark — source

**Solo personal project**

My own personal mark: an "M" and a "C" drawn as one continuous flowing line that
reads as an infinity loop, sitting on a small hand-drawn cosmic badge (a tiny Mars
and Saturn scene). It lives in the nav bar of my [portfolio site](https://madhumithachalla.github.io)
and, in a smaller corner version, in its footer.

## How it's built

The monogram is a single smooth cubic-bezier `<path>` — plain SVG, not a traced or
scanned image, so it stays crisp at any size and needed no image editor, just
plotting and nudging bezier control points by hand until the "M" and "C" read
clearly inside the loop. A glowing "photon" orbits the loop continuously, trailed
by a small fading dust trail in six colors, all driven by native SVG
`animateMotion` following that same path — no JS animation library.

The cosmic badge underneath is the same idea at a size most logos wouldn't bother
with: a tiny Mars and Saturn rendered in flat SVG shapes and radial gradients, sitting
behind the monogram.

## Files

- `logo-mark.svg` — the mark standalone: cosmic badge + monogram + orbiting
  photon, as it appears in the nav bar.
- `live-demo.html` — the mark rendered at a larger scale with the animation
  running, plus the corner-badge version used in the footer. Open directly in a
  browser, no build step.
