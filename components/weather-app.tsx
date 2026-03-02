'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Search, Sun, Moon, Droplets, Wind, Eye, Gauge, Compass, Sunrise, Sunset } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [useF, setUseF] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const ticker = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    const loadFromGeo = () => {
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
    };

    loadFromGeo();
  }, []);

  useEffect(() => {
    if (city.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=5&language=en&format=json`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const payload = await res.json();
        const nextSuggestions = (payload.results ?? []).map((entry: any) => ({
          id: `${entry.id}`,
          name: entry.name,
          country: entry.country ?? '',
          display: `${entry.name}, ${entry.country ?? ''}`
        }));
        setSuggestions(nextSuggestions);
      } catch {
        setSuggestions([]);
      }
    }, 260);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [city]);

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

  const selectCity = async (name: string) => {
    setCity(name);
    setLoading(true);
    try {
      const weather = await fetchWeather(`city=${encodeURIComponent(name)}`);
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
  const dateFmt = useMemo(() => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }), []);
  const timeFmt = useMemo(() => new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), []);

  const temp = (v: number) => (useF ? toF(v) : v);
  const unit = useF ? '°F' : '°C';

  return (
    <main
      className={`relative min-h-screen overflow-hidden px-4 py-6 ${darkMode ? 'text-white' : 'text-slate-900'} sm:px-6 sm:py-8`}
      onMouseMove={(e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 8;
        const y = (e.clientY / window.innerHeight - 0.5) * 8;
        setOffset({ x, y });
      }}
    >
      <WeatherBackground kind={kind} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-end gap-3">
          <Toggle label={useF ? '°F' : '°C'} on={useF} onToggle={() => setUseF((s) => !s)} />
          <Toggle label={darkMode ? 'Dark' : 'Light'} on={darkMode} onToggle={() => setDarkMode((s) => !s)} icon={darkMode ? <Moon size={13} /> : <Sun size={13} />} />
        </div>

        <div className="relative z-20">
          <form onSubmit={onSearch} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={17} />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search city..."
              className="w-full rounded-2xl border border-white/25 bg-slate-950/35 py-3.5 pl-11 pr-4 text-sm text-white backdrop-blur-2xl placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
            />
          </form>
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute mt-2 w-full overflow-hidden rounded-2xl border border-white/20 bg-slate-950/70 p-1 backdrop-blur-2xl"
              >
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion.id}
                    onClick={() => selectCity(suggestion.name)}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                  >
                    {suggestion.display}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <GlassPanel key="skeleton" className="p-8">
              <div className="h-5 w-40 animate-pulse rounded bg-white/30" />
              <div className="mt-5 h-28 w-52 animate-pulse rounded-2xl bg-white/30" />
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/30" />
                ))}
              </div>
            </GlassPanel>
          ) : error && !data ? (
            <GlassPanel key="error" className="p-10 text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">City not found</p>
              <p className="mt-4 text-lg text-white/90">{error}</p>
            </GlassPanel>
          ) : (
            data && (
              <motion.div
                key={data.location.city}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"
              >
                <GlassPanel className="relative p-6 sm:p-8" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/65">{data.location.city}, {data.location.country}</p>
                      <p className="mt-2 text-sm text-white/75">{dateFmt.format(now)} · {timeFmt.format(now)}</p>
                    </div>
                    <WeatherGlyph kind={kind} />
                  </div>

                  <motion.h1 key={temp(data.current.temp)} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-[96px] font-semibold leading-[0.9] tracking-[-0.04em] sm:text-[120px]">
                    {temp(data.current.temp)}°
                  </motion.h1>
                  <p className="mt-2 text-lg capitalize text-white/85">{data.current.condition}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Pill icon={<Gauge size={14} />} label={`Feels ${temp(data.current.feelsLike)}${unit}`} />
                    <Pill icon={<Droplets size={14} />} label={`${data.current.humidity}% Humidity`} />
                    <Pill icon={<Wind size={14} />} label={`${data.current.windSpeed} m/s`} />
                    <Pill icon={<Sun size={14} />} label={`UV ${data.current.uvIndex}`} />
                  </div>

                  <section className="mt-8">
                    <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/60">Hourly forecast</p>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {data.hourly.map((hour, index) => (
                        <motion.div key={hour.time} whileHover={{ y: -4 }} className={`min-w-[94px] rounded-2xl border p-3 text-center ${index === 0 ? 'border-white/50 bg-white/24' : 'border-white/20 bg-white/10'}`}>
                          <p className="text-xs text-white/70">{new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <div className="my-2 flex justify-center"><WeatherGlyph kind={hour.condition.includes('Rain') ? 'Rain' : kind} small /></div>
                          <p className="text-lg font-semibold">{temp(hour.temp)}°</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </GlassPanel>

                <div className="flex flex-col gap-6">
                  <GlassPanel className="p-6">
                    <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/60">7-Day forecast</p>
                    <div className="space-y-2">
                      {data.forecast.map((day) => (
                        <motion.div key={day.date} whileHover={{ scale: 1.01 }} className="rounded-2xl border border-white/20 bg-white/10 p-3">
                          <div className="flex items-center justify-between text-sm">
                            <p className="font-medium">{new Date(day.date).toLocaleDateString([], { weekday: 'short' })}</p>
                            <p className="text-white/80">{temp(day.tempMax ?? day.temp)}° / {temp(day.tempMin ?? day.temp)}°</p>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                            <motion.div className="h-full bg-cyan-300/80" initial={{ width: 0 }} animate={{ width: `${day.precipitationChance ?? 0}%` }} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassPanel>

                  <div className="grid grid-cols-2 gap-3">
                    <DetailCard icon={<Droplets size={16} />} label="Humidity" value={`${data.current.humidity}%`} />
                    <DetailCard icon={<Compass size={16} />} label="Wind Dir" value={`${data.current.windDeg}°`} />
                    <DetailCard icon={<Sun size={16} />} label="UV Index" value={`${data.current.uvIndex}`} />
                    <DetailCard icon={<Eye size={16} />} label="Visibility" value={`${data.current.visibility} km`} />
                    <DetailCard icon={<Sunrise size={16} />} label="Sunrise" value={new Date(data.current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                    <DetailCard icon={<Sunset size={16} />} label="AQI" value={`${data.current.aqi}/5`} />
                  </div>

                  <GlassPanel className="overflow-hidden p-0">
                    <iframe
                      title="weather-map"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.location.lon - 0.5}%2C${data.location.lat - 0.4}%2C${data.location.lon + 0.5}%2C${data.location.lat + 0.4}&layer=mapnik&marker=${data.location.lat}%2C${data.location.lon}`}
                      className="h-44 w-full border-0"
                    />
                  </GlassPanel>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        <footer className="text-center text-xs text-white/60">
          Powered by OpenWeather + Open-Meteo · Last updated {data ? new Date(data.updatedAt).toLocaleTimeString() : '--:--:--'}
        </footer>
      </div>
    </main>
  );
}

function GlassPanel({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      style={style}
      className={`relative rounded-[28px] border border-white/20 bg-slate-900/35 shadow-[0_28px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl ${className ?? ''}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 rounded-t-[28px] bg-gradient-to-b from-white/15 to-transparent" />
      {children}
    </motion.section>
  );
}

function Toggle({ label, on, onToggle, icon }: { label: string; on: boolean; onToggle: () => void; icon?: React.ReactNode }) {
  return (
    <button onClick={onToggle} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/35 px-3 py-1.5 text-xs text-white/90 backdrop-blur-xl">
      {icon}
      {label}
      <span className={`h-2.5 w-2.5 rounded-full ${on ? 'bg-emerald-300' : 'bg-white/40'}`} />
    </button>
  );
}

function Pill({ label, icon }: { label: string; icon: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/85">{icon}{label}</span>;
}

function DetailCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-white/20 bg-white/10 p-3.5">
      <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-white/65">{icon}{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </motion.div>
  );
}

function WeatherGlyph({ kind, small }: { kind: string; small?: boolean }) {
  const size = small ? 'h-6 w-6' : 'h-14 w-14';
  if (kind === 'Clear') return <motion.div className={`${size} rounded-full bg-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.8)]`} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />;
  if (kind === 'Clouds') return <motion.div className={`${size} rounded-full bg-white/70`} animate={{ x: [0, 4, 0] }} transition={{ duration: 3, repeat: Infinity }} />;
  if (kind === 'Rain') return <motion.div className={`${size} rounded-full bg-slate-200/80`} animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} />;
  return <div className={`${size} rounded-full bg-white/50`} />;
}
