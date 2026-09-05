# ESaver — Energy Dashboard & Community App

**Team project (4 people) · Monash University (FIT5046) · My role: weather integration & recommendation logic**

An Android app pairing live weather data with practical energy-saving tips, plus a
real-time community chat for users to share their own.

## My contribution
- Built the home dashboard and integrated live weather data via a Retrofit REST client.
- Built the recommendation logic that turns current weather conditions into actionable tips.
- Wired up Firestore for real-time chat sync across users.

## Files here
- `esaver_weather_integration_demo.kt` — a standalone reconstruction of the weather
  integration + recommendation engine I personally built, rewritten fresh rather than
  copied from the real team submission.
- `live-demo.html` — a genuinely working browser version: pulls real live weather (via the
  free Open-Meteo API, no key required) and runs the same recommendation logic, ported to
  JavaScript. Not a simulation — the weather data and tips are real.

**Stack:** Kotlin, Retrofit, Firebase Firestore
