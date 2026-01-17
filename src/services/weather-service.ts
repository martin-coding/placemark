import axios from "axios";

function weatherCodeToIcon(code: number): string {
  if (code === 0) return "fas fa-sun";
  if (code === 1 || code === 2) return "fas fa-cloud-sun";
  if (code === 3) return "fas fa-cloud";

  if (code === 45 || code === 48) return "fas fa-smog";

  if (code >= 51 && code <= 67) return "fas fa-cloud-rain";
  if (code >= 71 && code <= 77) return "fas fa-snowflake";
  if (code >= 80 && code <= 82) return "fas fa-cloud-showers-heavy";
  if (code >= 95) return "fas fa-bolt";

  return "fas fa-cloud";
}

export async function getWeather(lat: number, lng: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;

  const response = await axios.get(url);
  const current = response.data.current_weather;

  return {
    temperature: current.temperature,
    windspeed: current.windspeed,
    icon: weatherCodeToIcon(current.weathercode),
  };
}
