export interface WeatherData {
  temp: number;
  humidity: number;
  condition: string;
}

export async function fetchLocalWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error("Failed to fetch weather");
    const data = await response.json();
    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      condition: data.weather[0].main,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}