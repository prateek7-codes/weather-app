import { NextRequest, NextResponse } from 'next/server';
import { resolveKind, WeatherPayload } from '@/lib/weather';

const BASE = 'https://api.openweathermap.org/data/2.5';

const pickForecast = (entries: Array<{ dt_txt: string; main: { temp: number }; weather: Array<{ icon: string; main: string }> }>) => {
  const daily = entries.filter((entry) => entry.dt_txt.includes('12:00:00')).slice(0, 5);

  return daily.map((entry) => ({
    date: entry.dt_txt,
    temp: Math.round(entry.main.temp),
    icon: entry.weather[0]?.icon ?? '01d',
    condition: entry.weather[0]?.main ?? 'Clear'
  }));
};

export async function GET(req: NextRequest) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    return NextResponse.json({ message: 'Missing OPENWEATHER_API_KEY' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const city = searchParams.get('city');

  if (!(lat && lon) && !city) {
    return NextResponse.json({ message: 'Pass lat/lon or city.' }, { status: 400 });
  }

  const query = city
    ? `q=${encodeURIComponent(city)}`
    : `lat=${encodeURIComponent(lat!)}&lon=${encodeURIComponent(lon!)}`;

  const [weatherRes, forecastRes] = await Promise.all([
    fetch(`${BASE}/weather?${query}&units=metric&appid=${key}`, { next: { revalidate: 300 } }),
    fetch(`${BASE}/forecast?${query}&units=metric&appid=${key}`, { next: { revalidate: 300 } })
  ]);

  if (!weatherRes.ok || !forecastRes.ok) {
    return NextResponse.json({ message: 'Unable to fetch weather data.' }, { status: 502 });
  }

  const weather = await weatherRes.json();
  const forecast = await forecastRes.json();

  const icon = weather.weather?.[0]?.icon ?? '01d';
  const isNight = icon.endsWith('n');

  const payload: WeatherPayload = {
    location: {
      city: weather.name,
      country: weather.sys?.country ?? ''
    },
    current: {
      temp: Math.round(weather.main?.temp ?? 0),
      tempMin: Math.round(weather.main?.temp_min ?? 0),
      tempMax: Math.round(weather.main?.temp_max ?? 0),
      humidity: weather.main?.humidity ?? 0,
      windSpeed: Math.round(weather.wind?.speed ?? 0),
      condition: weather.weather?.[0]?.description ?? 'Unknown',
      icon,
      weatherKind: resolveKind(weather.weather?.[0]?.main ?? 'Other', isNight),
      isNight
    },
    forecast: pickForecast(forecast.list ?? [])
  };

  return NextResponse.json(payload);
}
