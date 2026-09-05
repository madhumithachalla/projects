// ESaver — Weather Integration & Recommendation Logic (representative demo)
//
// This is a standalone reconstruction of the piece of ESaver I personally built:
// the live-weather integration and the logic that turns conditions into energy-
// saving tips. ESaver was a 4-person Monash Android assignment, so this is NOT
// the team's actual submission — it's the pattern I used, rewritten fresh to
// show how my part of the app worked.
//
// Stack: Kotlin, Retrofit, coroutines

import retrofit2.http.GET
import retrofit2.http.Query

data class WeatherResponse(
    val tempCelsius: Double,
    val condition: String,
    val humidity: Int
)

interface WeatherApi {
    @GET("current")
    suspend fun getCurrentWeather(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double,
        @Query("units") units: String = "metric"
    ): WeatherResponse
}

data class EnergyTip(val title: String, val detail: String)

/**
 * Converts a weather reading into a short list of actionable, weather-specific
 * energy tips — the core piece of logic I owned in this project.
 */
class RecommendationEngine {

    fun tipsFor(weather: WeatherResponse): List<EnergyTip> {
        val tips = mutableListOf<EnergyTip>()

        when {
            weather.tempCelsius >= 28 -> tips += EnergyTip(
                "Cool smart, not hard",
                "Set aircon to 24–25°C instead of full blast — each extra degree saves roughly 5–8% on cooling energy."
            )
            weather.tempCelsius <= 12 -> tips += EnergyTip(
                "Layer before you heat",
                "It's cold enough that a jumper + closed curtains often beats reaching for the heater."
            )
            else -> tips += EnergyTip(
                "Good day to go natural",
                "Mild weather today — open windows for airflow instead of running AC or heating."
            )
        }

        if (weather.humidity >= 70) {
            tips += EnergyTip(
                "Watch the humidity",
                "High humidity makes rooms feel hotter than the thermometer says — a fan often beats extra aircon."
            )
        }

        if (weather.condition.contains("clear", ignoreCase = true)) {
            tips += EnergyTip(
                "Free daylight",
                "Clear skies — a good day to skip the lights and rely on natural light where you can."
            )
        }

        return tips
    }
}
