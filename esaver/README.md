# ESaver — Energy Dashboard & Community App

**Team project (4 people) · Monash University · My role: weather integration & recommendation logic**

ESaver is an Android app that turns live local weather into practical, actionable
energy-saving tips, plus a real-time chat where users share their own tips with each
other. My part was the home dashboard, the logic that turns a weather reading into
recommendations, and the real-time sync that powers the community chat.

## Why it exists

Generic energy-saving advice ("turn off lights when not in use") is easy to ignore
because it's not tied to *today's* conditions. ESaver's premise is that "it's 31°C and
humid right now — here's what actually helps today" is more persuasive and more useful
than a static tips list, and pairing that with a community feed keeps users engaged
instead of opening the app once and forgetting about it.

## My contribution

- **Built the home dashboard** and integrated live weather data via a Retrofit REST
  client — the screen users see first, showing current conditions and today's tips.
- **Built the recommendation engine**: the logic layer that maps a weather reading
  (temperature, humidity, conditions) to a short list of specific, actionable tips.
- **Wired up Firebase Firestore** for real-time chat sync, so a tip one user posts
  appears for everyone else immediately without a manual refresh.

## How the recommendation logic actually works

The core of what I built is `RecommendationEngine.tipsFor(weather)`, which runs a small
set of independent condition checks and accumulates whichever tips apply — it's not a
single lookup table, so a hot, humid, clear day can surface multiple relevant tips at
once rather than just one:

- **Temperature band** (mutually exclusive): ≥28°C suggests raising the aircon setpoint
  a couple of degrees instead of running it at full blast; ≤12°C suggests layering up
  before reaching for the heater; anything in between suggests using natural airflow
  instead of either.
- **Humidity ≥70%** adds a tip about a fan often beating extra aircon, independent of
  the temperature band, since humidity affects perceived heat on its own.
- **Clear conditions** adds a tip about skipping lights in favour of daylight.

The weather itself comes from a Retrofit-defined `WeatherApi` interface (a
`suspend fun` using Kotlin coroutines, hitting a `/current` endpoint with lat/lon
query params) — a small, typed contract rather than raw JSON parsing scattered through
the UI layer.

## Files here

- **`esaver_weather_integration_demo.kt`** — a standalone reconstruction of the weather
  integration + recommendation engine I personally built, rewritten fresh rather than
  copied from the real team submission (see the note below on why).
- **`live-demo.html`** — a genuinely working browser version. It pulls **real live
  weather** from the free [Open-Meteo](https://open-meteo.com/) API (no key required,
  by city search or geolocation) and runs the exact same tip logic as
  `RecommendationEngine.tipsFor()`, ported line-for-line to JavaScript. This is not a
  simulation — the weather and the tips it produces are real, for wherever you search.
  It's also mirrored at
  [`madhumithachalla.github.io/projects/demos/esaver-demo.html`](https://madhumithachalla.github.io/projects/demos/esaver-demo.html),
  which additionally builds a small Eco Score gauge and a weekly challenge/streak
  tracker on top of the same idea for the portfolio's version of the demo.

## Why this is a reconstruction, not the real submission

ESaver was a 4-person Monash assignment with a shared Android Studio project and a
shared Firebase backend that no longer exists in its original form. Monash's academic
integrity policy on group coursework means the real submission isn't published here —
future students in the same unit could otherwise find and copy it. What's here is the
*pattern* I actually used for the piece I owned, rewritten fresh, not the team's actual
Kotlin source.

## Running the demo

Open `live-demo.html` (or the mirrored copy linked above) directly in a browser. It
needs network access to reach Open-Meteo's public API; nothing else to install.

## Limitations

- The `.kt` file is a standalone reconstruction, not a runnable Android module — it
  isn't wired into an Activity/Fragment or a Gradle build, since reproducing the whole
  app shell isn't the point (the logic is).
- The Firestore real-time chat piece isn't represented in the browser demo, since a
  live chat needs a backing Firestore project to sync against.

**Stack:** Kotlin, Retrofit, Kotlin coroutines, Firebase Firestore
