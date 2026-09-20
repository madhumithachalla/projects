# Contact link icons — source

**Solo personal project**

The four icons that sit beside my contact links (email, LinkedIn, GitHub, portfolio) in
the footer of my [portfolio site](https://madhumithachalla.github.io#contact). Plain
inline SVG — no icon font, no external icon library, nothing loaded over the network.

## Why plain inline SVG

An icon font or a library like Font Awesome pulls in hundreds of icons to use four, adds
a network request, and renders slightly differently depending on when the font loads. A
handful of small inline `<svg>` elements avoids all of that: they're a few hundred bytes
each, part of the page's own markup, and render immediately with no flash of missing
icons.

## How they're styled

Every icon uses `fill="currentColor"` or `stroke="currentColor"` instead of a hardcoded
color, so it always matches the link text's own color — including on hover, where the
portfolio's CSS just changes the link's `color` and the icon follows automatically. No
per-icon color rules needed.

- **`email.svg`**, **`portfolio.svg`** — outline/stroke style (envelope, globe), matching
  the stroke-based icon language used elsewhere on the portfolio (nav icons, chat button).
- **`linkedin.svg`**, **`github.svg`** — solid brand marks, since a stroked outline of
  either logo reads poorly at small sizes.

## Files

- `email.svg`, `linkedin.svg`, `github.svg`, `portfolio.svg` — the four icons, standalone.
- `live-demo.html` — the icons rendered next to their real links, exactly as they appear
  in the portfolio footer. Open directly in a browser, no build step.
