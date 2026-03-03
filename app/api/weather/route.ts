import { NextRequest, NextResponse } from 'next/server';
import { resolveKind, WeatherPayload } from '@/lib/weather';

const BASE = 'https://api.openweathermap.org/data/2.5';

const toDayKey = (ts: number) =>
  new Date(ts * 1000).toISOString().slice(0, 10);

const conditionFromCode = (code: number) => {
  if (code <= 1) return 'Clear';
  if (code <= 3) return 'Clouds';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 99) return 'Thunderstorm';
  return 'Other';
};

export async function GET(req: NextRequest) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key)
    return NextResponse.json(
      { message: 'Missing OPENWEATHER_API_KEY' },
      { status: 500 }
    );

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const city = searchParams.get('city');

  if (!(lat && lon) && !city) {
    return NextResponse.json(
      { message: 'Pass lat/lon or city.' },
      { status: 400 }
    );
  }

  const query = city
    ? `q=${encodeURIComponent(city)}`
    : `lat=${encodeURIComponent(lat!)}&lon=${encodeURIComponent(lon!)}`;

  const [weatherRes, forecastRes] = await Promise.all([
    fetch(`${BASE}/weather?${query}&units=metric&appid=${key}`),
    fetch(`${BASE}/forecast?${query}&units=metric&appid=${key}`)
  ]);

  if (!weatherRes.ok || !forecastRes.ok) {
    return NextResponse.json(
      { message: 'Unable to fetch weather data.' },
      { status: 502 }
    );
  }

  const weather = await weatherRes.json();
  const forecast = await forecastRes.json();

  const wLat = weather.coord?.lat;
  const wLon = weather.coord?.lon;

  const openMeteoRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${wLat}&longitude=${wLon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&hourly=uv_index&timezone=auto&forecast_days=7`
  );
  const openMeteo = openMeteoRes.ok ? await openMeteoRes.json() : null;

  const icon = weather.weather?.[0]?.icon ?? '01d';
  const isNight = icon.endsWith('n');

  // ----------- DAILY FORECAST BUILD -----------
  const forecastMap = new Map<
    string,
    { min: number; max: number; icon: string; condition: string; pop: number }
  >();

  for (const entry of forecast.list ?? []) {
    const keyDay = toDayKey(entry.dt);
    const existing = forecastMap.get(keyDay);

    const tMin = Math.round(entry.main?.temp_min ?? entry.main?.temp ?? 0);
    const tMax = Math.round(entry.main?.temp_max ?? entry.main?.temp ?? 0);
    const pop = Math.round((entry.pop ?? 0) * 100);

    if (!existing) {
      forecastMap.set(keyDay, {
        min: tMin,
        max: tMax,
        icon: entry.weather?.[0]?.icon ?? '01d',
        condition: entry.weather?.[0]?.main ?? 'Clear',
        pop
      });
    } else {
      forecastMap.set(keyDay, {
        ...existing,
        min: Math.min(existing.min, tMin),
        max: Math.max(existing.max, tMax),
        pop: Math.max(existing.pop, pop)
      });
    }
  }

  const openDaily = openMeteo?.daily;

  const forecastDays = Array.from(forecastMap.entries())
    .slice(0, 7)
    .map(([date, day], index) => ({
      date,
      temp: Math.round((day.max + day.min) / 2),
      icon: day.icon,
      condition:
        openDaily?.weather_code?.[index] != null
          ? conditionFromCode(openDaily.weather_code[index])
          : day.condition,
      tempMin: openDaily?.temperature_2m_min?.[index] ?? day.min,
      tempMax: openDaily?.temperature_2m_max?.[index] ?? day.max,
      precipitationChance:
        openDaily?.precipitation_probability_max?.[index] ?? day.pop
    }));

  // ----------- UV INDEX -----------
  const nowHour = new Date().getHours();
  const uvIndex = openMeteo?.hourly?.uv_index?.[nowHour] ?? 0;

  // ----------- AIR QUALITY -----------
  const airRes = await fetch(
    `${BASE}/air_pollution?lat=${encodeURIComponent(
      wLat
    )}&lon=${encodeURIComponent(wLon)}&appid=${key}`
  );
  const air = airRes.ok ? await airRes.json() : null;

  const payload = {
    location: {
      city: weather.name,
      country: weather.sys?.country ?? '',
      lat: wLat,
      lon: wLon
    },
    current: {
      temp: Math.round(weather.main?.temp ?? 0),
      tempMin: Math.round(weather.main?.temp_min ?? 0),
      tempMax: Math.round(weather.main?.temp_max ?? 0),
      feelsLike: Math.round(weather.main?.feels_like ?? 0),
      humidity: weather.main?.humidity ?? 0,
      windSpeed: Math.round(weather.wind?.speed ?? 0),
      windDeg: weather.wind?.deg ?? 0,
      visibility: Math.round((weather.visibility ?? 0) / 1000),
      uvIndex: Math.round(uvIndex),
      aqi: air?.list?.[0]?.main?.aqi ?? 0,
      sunrise: weather.sys?.sunrise ?? 0,
      sunset: weather.sys?.sunset ?? 0,
      condition: weather.weather?.[0]?.description ?? 'Unknown',
      icon,
      weatherKind: resolveKind(
        weather.weather?.[0]?.main ?? 'Other',
        isNight
      ),
      isNight
    },
    forecast: forecastDays,
    updatedAt: new Date().toISOString()
  };

  return NextResponse.json(payload);
}
