'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Search, Sun, Moon, Droplets, Wind, Eye, Gauge, Compass, Sunrise, Sunset, X } from 'lucide-react';
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
  const temp = (v: number) => (useF ? toF(v) : v);

  return (
    <main className={`relative min-h-screen overflow-hidden px-4 py-6 transition-all duration-300 sm:px-6 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <WeatherBackground kind={kind} darkMode={darkMode} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <p className="text-sm font-medium tracking-[0.2em] opacity-70">ATMOS</p>
          <button
            onClick={() => setDarkMode((s) => !s)}
            className={`inline-flex h-11 min-w-[132px] items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-300 ${darkMode ? 'bg-white/10 text-slate-100' : 'bg-white/80 text-slate-900'}`}
          >
            <motion.span initial={false} animate={{ rotate: darkMode ? 0 : 180 }} transition={{ duration: 0.3 }}>
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
            </motion.span>
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.section
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`rounded-[28px] p-8 ${darkMode ? 'bg-white/8' : 'bg-white/75 shadow-[0_12px_45px_rgba(15,23,42,0.08)]'}`}
            >
              <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-white/20" />
              <div className="mx-auto mt-6 h-16 w-44 animate-pulse rounded-xl bg-white/20" />
              <div className="mx-auto mt-3 h-4 w-48 animate-pulse rounded bg-white/20" />
            </motion.section>
          ) : error && !data ? (
            <motion.section
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-[28px] p-8 text-center ${darkMode ? 'bg-white/8' : 'bg-white/75 shadow-[0_12px_45px_rgba(15,23,42,0.08)]'}`}
            >
              <p className="text-sm opacity-80">{error}</p>
            </motion.section>
          ) : (
            data && (
              <motion.section
                key={data.location.city}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-[32px] p-8 text-center ${darkMode ? 'bg-white/10 shadow-[0_30px_80px_rgba(2,6,23,0.45)]' : 'bg-white/80 shadow-[0_22px_64px_rgba(15,23,42,0.1)]'} backdrop-blur-2xl`}
              >
                <motion.div
                  className="mx-auto mb-4 h-24 w-24 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <WeatherGlyph kind={kind} />
                </motion.div>

                <p className="text-sm tracking-wide opacity-65">
                  {new Date().toLocaleDateString()} · {now.toLocaleTimeString()}
                </p>
                <h1 className="mt-2 text-[64px] font-extralight leading-none tracking-[-0.05em] sm:text-[88px]">
                  {temp(data.current.temp)}°
                </h1>
                <p className="mt-1 text-sm capitalize opacity-75">{data.current.condition}</p>
                <p className="mt-2 text-2xl font-medium">{data.location.city}, {data.location.country}</p>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric icon={<Gauge size={14} />} label="Feels" value={`${temp(data.current.feelsLike)}°`} darkMode={darkMode} />
                  <Metric icon={<Droplets size={14} />} label="Humidity" value={`${data.current.humidity}%`} darkMode={darkMode} />
                  <Metric icon={<Wind size={14} />} label="Wind" value={`${data.current.windSpeed} m/s`} darkMode={darkMode} />
                  <button onClick={() => setUseF((s) => !s)} className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-medium transition-all ${darkMode ? 'bg-white/10' : 'bg-slate-900/5'}`}>
                    <Compass size={14} /> {useF ? 'Use °C' : 'Use °F'}
                  </button>
                </div>
              </motion.section>
            )
          )}
        </AnimatePresence>

        <section className="mx-auto w-full max-w-[480px]">
          <form onSubmit={onSearch} className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search city..."
              className={`h-[52px] w-full rounded-2xl pl-11 pr-11 text-sm outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] ${darkMode ? 'bg-slate-800/70' : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]'}`}
            />
            {city && (
              <button type="button" onClick={() => setCity('')} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full opacity-70 transition hover:opacity-100">
                <X size={16} />
              </button>
            )}
          </form>

          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-2 rounded-2xl p-1 ${darkMode ? 'bg-slate-900/70' : 'bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]'}`}
              >
                {suggestions.map((s) => (
                  <button key={s.id} type="button" onClick={() => selectCity(s.name)} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/10">
                    <Search size={14} />
                    {s.display}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className={`rounded-[28px] p-6 ${darkMode ? 'bg-white/8' : 'bg-white/75 shadow-[0_12px_45px_rgba(15,23,42,0.08)]'}`}>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] opacity-65">Hourly Forecast</p>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {(data?.hourly ?? []).map((hour, idx) => (
              <article key={hour.time} className={`min-w-[96px] rounded-2xl p-3 text-center transition-all duration-200 hover:-translate-y-0.5 ${idx === 0 ? (darkMode ? 'bg-white/14' : 'bg-slate-900/5') : (darkMode ? 'bg-white/6' : 'bg-slate-900/3')}`}>
                <p className="text-xs opacity-70">{new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <div className="my-2 flex items-center justify-center"><WeatherGlyph kind={hour.condition.includes('Rain') ? 'Rain' : kind} small /></div>
                <p className="text-[22px] font-medium leading-none">{temp(hour.temp)}°</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`rounded-[28px] p-6 ${darkMode ? 'bg-white/8' : 'bg-white/75 shadow-[0_12px_45px_rgba(15,23,42,0.08)]`}>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] opacity-65">7-Day Forecast</p>
          <div className="space-y-2">
            {(data?.forecast ?? []).map((day) => (
              <article key={day.date} className={`rounded-2xl p-4 ${darkMode ? 'bg-white/6' : 'bg-slate-900/3'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{new Date(day.date).toLocaleDateString([], { weekday: 'long' })}</p>
                  <p className="text-sm opacity-70">{temp(day.tempMax ?? day.temp)}° / {temp(day.tempMin ?? day.temp)}°</p>
                </div>
                <div className={`mt-2 h-1.5 rounded-full ${darkMode ? 'bg-white/15' : 'bg-slate-200'}`}>
                  <div className="h-1.5 rounded-full bg-sky-400" style={{ width: `${day.precipitationChance ?? 0}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailCard icon={<Droplets size={18} className="text-sky-400" />} label="Humidity" value={`${data?.current.humidity ?? '--'}%`} darkMode={darkMode} />
          <DetailCard icon={<Compass size={18} className="text-indigo-400" />} label="Wind" value={`${data?.current.windDeg ?? '--'}°`} darkMode={darkMode} />
          <DetailCard icon={<Sun size={18} className="text-amber-400" />} label="UV Index" value={`${data?.current.uvIndex ?? '--'}`} darkMode={darkMode} />
          <DetailCard icon={<Eye size={18} className="text-emerald-400" />} label="Visibility" value={`${data?.current.visibility ?? '--'} km`} darkMode={darkMode} />
          <DetailCard icon={<Sunrise size={18} className="text-orange-400" />} label="Sunrise" value={data ? new Date(data.current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} darkMode={darkMode} />
          <DetailCard icon={<Sunset size={18} className="text-pink-400" />} label="AQI" value={`${data?.current.aqi ?? '--'}/5`} darkMode={darkMode} />
        </section>

        <footer className="pb-6 text-center text-sm opacity-60">
          Last updated: {data ? new Date(data.updatedAt).toLocaleTimeString() : '--:--:--'}
        </footer>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, darkMode }: { icon: React.ReactNode; label: string; value: string; darkMode: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs ${darkMode ? 'bg-white/8' : 'bg-slate-900/5'}`}>
      {icon}
      <span className="uppercase tracking-[0.12em] opacity-70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function DetailCard({ icon, label, value, darkMode }: { icon: React.ReactNode; label: string; value: string; darkMode: boolean }) {
  return (
    <article className={`rounded-[20px] p-6 transition-all duration-200 hover:-translate-y-0.5 ${darkMode ? 'bg-white/8' : 'bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] opacity-70">{label}</p>
      </div>
      <p className="mt-3 text-[22px] font-medium leading-none">{value}</p>
    </article>
  );
}

function WeatherGlyph({ kind, small }: { kind: string; small?: boolean }) {
  const cls = small ? 'h-8 w-8' : 'h-24 w-24';
  if (kind === 'Clear') {
    return <motion.div className={`${cls} rounded-full bg-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.5)]`} animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }} />;
  }
  if (kind === 'Clouds') {
    return <motion.div className={`${cls} rounded-full bg-slate-300 shadow-[0_0_36px_rgba(148,163,184,0.45)]`} animate={{ x: [0, 3, 0] }} transition={{ duration: 3, repeat: Infinity }} />;
  }
  if (kind === 'Rain') {
    return <motion.div className={`${cls} rounded-full bg-sky-400 shadow-[0_0_36px_rgba(56,189,248,0.45)]`} animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} />;
  }
  return <div className={`${cls} rounded-full bg-indigo-300 shadow-[0_0_30px_rgba(129,140,248,0.45)]`} />;
}
