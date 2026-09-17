# What Actually Predicts an Independent Artist's Success

**Solo project · Monash University**

A statistical analysis of 114,000 real Spotify tracks testing a specific question:
does an individual audio feature (danceability, energy, tempo, etc.) meaningfully
predict a track's popularity — or does genre alone explain most of the variation,
regardless of what the track actually sounds like?

## Why it exists

There's a common belief among independent artists that specific production choices
("make it more danceable," "push the energy") are what get a track heard. This analysis
tests that belief against real listening data instead of taking it on faith, because if
genre dominates the outcome, that's a very different (and more useful) thing for an
independent artist to know than "tweak your mix."

## Headline finding

**Genre carries roughly 26.8x more predictive weight than any single audio feature** in
explaining a track's popularity tier. Concretely: which genre a track is released in
correlates with its popularity far more strongly than how danceable, energetic, or
acoustic it is.

## How the analysis actually works

1. **Clean** (`spotify_tracks.csv` → `tracks`): deduplicate by `track_id`, drop rows
   missing `popularity` or `genre`, and filter out anything under 30 seconds (likely
   interludes/skits rather than real tracks that could reasonably be judged on musical
   merit). Tracks are also bucketed into a `success_tier` (`high` ≥70, `mid` ≥40,
   otherwise `low`) for downstream interpretation, though the core statistical test uses
   the continuous `popularity` score, not the bucket.
2. **Quantify genre's effect** — an ANOVA (`aov(popularity ~ genre)`) is fit, and its
   **eta-squared** (the proportion of total variance in popularity explained by which
   genre a track belongs to) is computed directly from the ANOVA's sum-of-squares table.
3. **Quantify each audio feature's effect** — rather than fitting eight separate models,
   this takes the simpler, more transparent route: the absolute Pearson correlation of
   each of the eight audio features (`danceability`, `energy`, `valence`, `tempo`,
   `acousticness`, `instrumentalness`, `loudness`, `speechiness`) against `popularity`.
4. **Compare on the same scale** — genre's eta-squared and the audio features'
   correlations aren't the same statistic, so the comparison here is deliberately a
   *ratio*: genre's eta-squared divided by the **mean of the squared correlations**
   (squaring puts correlation on the same "variance explained" footing as eta-squared).
   That ratio is the 26.8x headline number.
5. **Visualise** — a boxplot of popularity by genre (reordered by median, via
   `fct_reorder`) shows the actual spread per genre rather than hiding it behind a
   single average; a correlation matrix heatmap (`corrplot`) shows how the eight audio
   features relate to popularity and to each other.

## Files here

- **`spotify_success_analysis.R`** — the real analysis pipeline described above:
  cleaning, the ANOVA/correlation effect-size calculation, and both visualisations, in R
  with `tidyverse` and `corrplot`.
- **`live-demo.html`** + **`spotify_data.js`** — an interactive browser version running
  the same method (genre eta-squared vs. mean squared feature correlation) live in
  JavaScript, against a 350-track representative sample built to reflect the same real
  pattern found in the full analysis — the actual 114K-row Spotify dataset isn't mine to
  redistribute publicly, so the demo uses a smaller stand-in sample rather than the raw
  data itself.

## Running the real analysis

```r
install.packages(c("tidyverse", "corrplot"))
```
Then, with a `spotify_tracks.csv` (columns: `track_id`, `popularity`, `genre`,
`duration_ms`, and the eight audio features listed above) in the working directory:
```r
source("spotify_success_analysis.R")
```
This prints the cleaned row count and the genre-effect ratio to the console, saves
`genre_vs_popularity.png` and a correlation heatmap, and writes
`feature_effect_summary.csv` with every factor's effect size, sorted descending.

**The browser demo:** open `live-demo.html` directly — no install needed.

## Limitations

- Correlation and eta-squared measure association, not causation — this shows genre is
  a far stronger *predictor* of popularity than any single audio feature, not that audio
  features have no causal effect on success at all.
- The comparison ratio (eta-squared ÷ mean squared correlation) is a reasonable,
  transparent way to compare two different effect-size statistics on the same footing,
  but it's not the only valid way to do that comparison — a multivariate model
  (e.g. a regression with genre and all audio features as predictors, comparing their
  standardized coefficients) would be a heavier-weight alternative worth exploring.
- Genre labels in the source dataset are Spotify's own categorisation, which is not
  perfectly consistent or mutually exclusive in the real world.

**Stack:** R, tidyverse, corrplot, statistical modelling (ANOVA / eta-squared, Pearson
correlation)
