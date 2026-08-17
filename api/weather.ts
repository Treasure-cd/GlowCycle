export default async function handler(req: any, res: any) {
  const { lat, lon } = req.query;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.WEATHER_API_KEY}`
  );
  const data = await response.json();
  res.status(response.status).json(data);
}