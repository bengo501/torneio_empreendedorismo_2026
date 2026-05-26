/** Fetch current weather + rain probability (OpenMeteo — free, no API key) */
export async function getWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true&hourly=precipitation_probability,weathercode` +
      `&forecast_days=1&timezone=America%2FSao_Paulo`
    )
    const data = await res.json()
    const cw = data.current_weather || {}
    // Get rain probability for next few hours
    const hours = data.hourly || {}
    const now = new Date().getHours()
    const probs = (hours.precipitation_probability || []).slice(now, now + 4)
    const maxProb = probs.length ? Math.max(...probs) : 0

    return {
      temp: Math.round(cw.temperature ?? 22),
      windspeed: Math.round(cw.windspeed ?? 0),
      rainProb: maxProb,
      isRaining: (cw.weathercode ?? 0) >= 51,
      code: cw.weathercode ?? 0,
      emoji: weatherEmoji(cw.weathercode ?? 0, maxProb),
      label: weatherLabel(cw.weathercode ?? 0, maxProb),
      warn: maxProb > 50,
    }
  } catch {
    return { temp: 22, windspeed: 0, rainProb: 0, isRaining: false, code: 0, emoji: '☀️', label: 'Sem dados', warn: false }
  }
}

function weatherEmoji(code, rainProb) {
  if (code >= 80) return '⛈️'
  if (code >= 61) return '🌧️'
  if (code >= 51) return '🌦️'
  if (code >= 45) return '🌫️'
  if (code >= 3)  return '☁️'
  if (code >= 1)  return '🌤️'
  if (rainProb > 50) return '🌦️'
  return '☀️'
}

function weatherLabel(code, rainProb) {
  if (code >= 80) return 'Tempestade'
  if (code >= 61) return 'Chuva forte'
  if (code >= 51) return 'Garoa'
  if (code >= 45) return 'Neblina'
  if (code >= 3)  return 'Nublado'
  if (rainProb > 50) return `Chuva provável (${rainProb}%)`
  if (rainProb > 20) return `Possível chuva (${rainProb}%)`
  return 'Tempo bom'
}
