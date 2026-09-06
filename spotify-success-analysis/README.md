# What Actually Predicts an Independent Artist's Success

**Solo project · Monash University**

Statistical analysis of 114,000 real Spotify tracks testing whether genre, tempo, or
individual audio features actually correlate with a track's popularity — rather than
relying on industry folklore.

## Headline finding
Genre alone carries roughly **26.8x more predictive weight** than any single audio feature
in predicting a track's success tier.

## Files here
- `spotify_success_analysis.R` — the real analysis pipeline: cleaning, correlation analysis,
  genre-effect calculation (via variance decomposition), and visualisation, in R with tidyverse.
- `live-demo.html` + `spotify_data.js` — an interactive browser version of the same method,
  running against a 350-track representative sample (the real 114K-row dataset isn't mine to
  redistribute). Computes the genre-effect ratio live in JavaScript, mirroring the R approach.

**Stack:** R, tidyverse, ggplot2, statistical modelling
