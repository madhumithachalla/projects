# What Actually Predicts an Independent Artist's Success — Spotify Track Analysis
# Solo project (FIT5145 Data Science) — this is my own individual work end to end.
#
# Goal: test whether genre, tempo, or other audio features actually correlate
# with a track's success, using ~114K Spotify tracks.

library(tidyverse)
library(corrplot)

# ---- 1. Load & clean --------------------------------------------------------

raw <- read_csv("spotify_tracks.csv", show_col_types = FALSE)

tracks <- raw %>%
  distinct(track_id, .keep_all = TRUE) %>%
  filter(!is.na(popularity), !is.na(genre), duration_ms > 30000) %>%
  mutate(
    duration_min = duration_ms / 60000,
    success_tier = case_when(
      popularity >= 70 ~ "high",
      popularity >= 40 ~ "mid",
      TRUE             ~ "low"
    )
  )

cat("Rows after cleaning:", nrow(tracks), "\n")

# ---- 2. Genre vs. audio-feature effect size ---------------------------------

audio_features <- c("danceability", "energy", "valence", "tempo",
                     "acousticness", "instrumentalness", "loudness", "speechiness")

# Correlation of each raw audio feature with popularity
feature_corr <- tracks %>%
  select(popularity, all_of(audio_features)) %>%
  cor(use = "pairwise.complete.obs") %>%
  .[ "popularity", audio_features ] %>%
  abs()

# Effect of genre: eta-squared from a one-way ANOVA (popularity ~ genre)
genre_model <- aov(popularity ~ genre, data = tracks)
genre_eta_sq <- summary(genre_model)[[1]][["Sum Sq"]][1] /
  sum(summary(genre_model)[[1]][["Sum Sq"]])

genre_effect_vs_features <- genre_eta_sq / mean(feature_corr^2)

cat(sprintf(
  "Genre explains roughly %.1fx more variance in popularity than the average single audio feature.\n",
  genre_effect_vs_features
))

# ---- 3. Visualise ------------------------------------------------------------

ggplot(tracks, aes(x = fct_reorder(genre, popularity, .fun = median), y = popularity)) +
  geom_boxplot(outlier.alpha = 0.15, fill = "#8B6FE0") +
  coord_flip() +
  labs(
    title = "Popularity distribution by genre",
    x = NULL, y = "Popularity score"
  ) +
  theme_minimal(base_size = 12)

ggsave("genre_vs_popularity.png", width = 8, height = 10, dpi = 150)

corrplot(
  cor(tracks[, c("popularity", audio_features)], use = "pairwise.complete.obs"),
  method = "color", type = "upper", addCoef.col = "black", number.cex = 0.7
)

# ---- 4. Summary table used in the final report -------------------------------

summary_table <- tibble(
  factor = c("genre", audio_features),
  effect_estimate = c(genre_eta_sq, feature_corr)
) %>%
  arrange(desc(effect_estimate))

write_csv(summary_table, "feature_effect_summary.csv")
print(summary_table)
