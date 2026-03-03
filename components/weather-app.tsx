'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Sun,
  Moon,
  Droplets,
  Wind,
  Gauge,
  Compass,
  Sunrise,
  Sunset,
  X,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { WeatherBackground } from '@/components/weather-background';
import { WeatherPayload } from '@/lib/weather';

const fetchWeather = async (params: string) => {
  const res = await fetch(`/api/weather?${params}`);
  if (!res.ok) throw new Error('Failed to load weather');
  return (await res.json()) as WeatherPayload;
};

interface CitySuggestion {
  id: string;
  name: string;
  country: string;
  display: string;
}

const toF = (c: number) => Math.round(c * 1.8 + 32);

export function WeatherApp() {
  const [data, setData] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [useF, setUseF] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const ticker = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported. Search for a city.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const weather = await fetchWeather(
            `lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          setData(weather);
          setError(null);
        } catch {
          setError('Unable to load weather. Please search for a city.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location denied. Search for your city below.');
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    try {
      const weather = await fetchWeather(`city=${encodeURIComponent(city.trim())}`);
      setData(weather);
      setError(null);
      setSuggestions([]);
    } catch {
      setError('City not found. Try another search.');
    } finally {
      setLoading(false);
    }
  };

  const kind = data?.current.weatherKind ?? 'Other';
  const temp = (v: number) => (useF ? toF(v) : v);

  return (
    <main className={`relative min-h-screen px-4 py-6 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <WeatherBackground kind={kind} darkMode={darkMode} />

      <div className="mx-auto max-w-3xl flex flex-col gap-10">

        {/* HEADER */}
        <header className="flex justify-between items-center">
          <p className="text-sm tracking-widest opacity-60">ATMOS</p>
          <button
            onClick={() => setDarkMode((s) => !s)}
            className="px-4 py-2 rounded-full bg-white/10 text-xs"
          >
            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </header>

        {/* SEARCH */}
        <form onSubmit={onSearch} className="relative max-w-md mx-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city..."
            className="w-full h-12 rounded-2xl pl-10 pr-4 bg-white/10 backdrop-blur-xl outline-none"
          />
        </form>

        {/* MAIN WEATHER */}
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : data && (
          <section className="text-center">
            <WeatherGlyph kind={kind} />
            <h1 className="text-7xl font-light">{temp(data.current.temp)}°</h1>
            <p className="opacity-70">{data.location.city}, {data.location.country}</p>
          </section>
        )}

        {/* DETAILS GRID */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <DetailCard label="Humidity" value={`${data?.current.humidity ?? '--'}%`} />
          <DetailCard label="Wind" value={`${data?.current.windSpeed ?? '--'} m/s`} />
          <DetailCard label="UV Index" value={`${data?.current.uvIndex ?? '--'}`} />
          <DetailCard label="Visibility" value={`${data?.current.visibility ?? '--'} km`} />
          <DetailCard label="Sunrise" value={data ? new Date(data.current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} />

          <DetailCard
            label="Air Quality"
            value={getAqiLabel(data?.current.aqi)}
            color={getAqiColor(data?.current.aqi)}
          />
        </section>

      </div>
    </main>
  );
}

/* COMPONENTS */

function DetailCard({
  label,
  value,
  color
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl p-4 bg-white/10 backdrop-blur-xl">
      <p className="text-xs uppercase opacity-60">{label}</p>
      <p className={`text-xl font-semibold ${color ?? ''}`}>{value}</p>
    </div>
  );
}

function WeatherGlyph({ kind }: { kind: string }) {
  if (kind === 'Clear') return <Sun size={70} className="text-yellow-300" />;
  if (kind === 'Clouds') return <Cloud size={70} />;
  if (kind === 'Rain') return <CloudRain size={70} />;
  if (kind === 'Snow') return <CloudSnow size={70} />;
  if (kind === 'Thunderstorm') return <CloudLightning size={70} />;
  return <Cloud size={70} />;
}

/* AQI HELPERS */

function getAqiLabel(aqi: number | undefined) {
  switch (aqi) {
    case 1: return 'Good';
    case 2: return 'Fair';
    case 3: return 'Moderate';
    case 4: return 'Poor';
    case 5: return 'Very Poor';
    default: return 'Unknown';
  }
}

function getAqiColor(aqi: number | undefined) {
  switch (aqi) {
    case 1: return 'text-green-400';
    case 2: return 'text-lime-400';
    case 3: return 'text-yellow-400';
    case 4: return 'text-orange-400';
    case 5: return 'text-red-400';
    default: return 'text-slate-400';
  }
}
