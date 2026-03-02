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
    <main
      className={`relative min-h-screen overflow-hidden px-4 py-6 transition-all duration-500 sm:px-6 ${
        darkMode ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      <WeatherBackground kind={kind} darkMode={darkMode} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 sm:gap-12">
        <header className="flex items-center justify-between">
          <p className="text-sm font-medium tracking-[0.24em] opacity-65">ATMOS</p>
          <button
            onClick={() => setDarkMode((s) => !s)}
            className={`inline-flex h-11 min-w-[132px] items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-300 ${
              darkMode
                ? 'bg-white/10 text-slate-100 backdrop-blur-xl'
                : 'bg-white/75 text-slate-900 shadow-[0_6px_24px_rgba(15,23,42,0.08)]'
            }`}
          >
            <motion.span initial={false} animate={{ rotate: darkMode ? 0 : 180 }} transition={{ duration: 0.3 }}>
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
            </motion.span>
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.section key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center">
              <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-white/18" />
              <div className="mx-auto mt-8 h-24 w-64 animate-pulse rounded-2xl bg-white/15" />
            </motion.section>
          ) : error && !data ? (
            <motion.section key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
              <p className="text-sm opacity-80">{error}</p>
            </motion.section>
          ) : (
            data && (
              <motion.section
                key={data.location.city}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative py-2 text-center"
              >
                <div className="pointer-events-none absolute left-1/2 top-4 h-52 w-52 -translate-x-1/2 rounded-full bg-sky-400/15 blur-3xl" />

                <motion.div
                  className="relative mx-auto mb-5 h-24 w-24"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
                  <div className="relative z-10">
                    <WeatherGlyph kind={kind} />
                  </div>
                </motion.div>

                <p className="text-xs tracking-[0.18em] opacity-55">
                  {new Date().toLocaleDateString()} · {now.toLocaleTimeString()}
                </p>
                <h1 className="mt-3 text-[88px] font-extralight leading-none tracking-[-0.065em] sm:text-[146px]">
                  {temp(data.current.temp)}°
                </h1>
                <p className="mt-1 text-sm capitalize opacity-68">{data.current.condition}</p>
                <p className="mt-2 text-xl font-medium opacity-85 sm:text-2xl">
                  {data.location.city}, {data.location.country}
                </p>

                <div className="mx-auto mt-8 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2.5">
                  <Metric icon={<Gauge size={14} />} label="Feels" value={`${temp(data.current.feelsLike)}°`} darkMode={darkMode} />
                  <Metric icon={<Droplets size={14} />} label="Humidity" value={`${data.current.humidity}%`} darkMode={darkMode} />
                  <Metric icon={<Wind size={14} />} label="Wind" value={`${data.current.windSpeed} m/s`} darkMode={darkMode} />
                  <button
                    onClick={() => setUseF((s) => !s)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-medium transition-all ${
                      darkMode ? 'bg-white/10 backdrop-blur-xl' : 'bg-slate-900/5'
                    }`}
                  >
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
              className={`h-[52px] w-full rounded-2xl pl-11 pr-11 text-sm outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.28)] ${
                darkMode ? 'bg-slate-800/50 backdrop-blur-xl' : 'bg-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
              }`}
            />
            {city && (
              <button
                type="button"
                onClick={() => setCity('')}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full opacity-70 transition hover:opacity-100"
              >
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
                className={`mt-2 rounded-2xl p-1 ${
                  darkMode ? 'bg-slate-900/65 backdrop-blur-2xl' : 'bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.08)]'
                }`}
              >
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectCity(s.name)}
                    className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/10"
                  >
                    <Search size={14} />
                    {s.display}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-55">Hourly Forecast</p>
          <div className="no-scrollbar flex gap-5 overflow-x-auto pb-2">
            {(data?.hourly ?? []).map((hour, idx) => (
              <article key={hour.time} className="min-w-[102px] text-center">
                <p className="text-xs opacity-65">
                  {new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="my-2 flex items-center justify-center">
                  <WeatherGlyph kind={hour.condition.includes('Rain') ? 'Rain' : kind} small />
                </div>
                <p className={`text-[22px] font-medium leading-none ${idx === 0 ? 'text-sky-300' : ''}`}>{temp(hour.temp)}°</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-55">7-Day Forecast</p>
          <div className="space-y-3">
            {(data?.forecast ?? []).map((day) => (
              <article key={day.date} className="py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <DayGlyph condition={day.condition} />
                    <p className="text-sm font-medium">{new Date(day.date).toLocaleDateString([], { weekday: 'long' })}</p>
                  </div>
                  <p className="text-sm opacity-70">{temp(day.tempMax ?? day.temp)}° / {temp(day.tempMin ?? day.temp)}°</p>
                </div>
                <div className={`mt-2 h-[2px] rounded-full ${darkMode ? 'bg-white/14' : 'bg-slate-300/80'}`}>
                  <div className="h-[2px] rounded-full bg-sky-400" style={{ width: `${day.precipitationChance ?? 0}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-x-6 gap-y-3">
          <DetailCard icon={<Droplets size={16} className="text-sky-400" />} label="Humidity" value={`${data?.current.humidity ?? '--'}%`} />
          <DetailCard icon={<Compass size={16} className="text-indigo-400" />} label="Wind" value={`${data?.current.windDeg ?? '--'}°`} />
          <DetailCard icon={<Sun size={16} className="text-amber-400" />} label="UV Index" value={`${data?.current.uvIndex ?? '--'}`} />
          <DetailCard icon={<Search size={16} className="text-emerald-400" />} label="Visibility" value={`${data?.current.visibility ?? '--'} km`} />
          <DetailCard icon={<Sunrise size={16} className="text-orange-400" />} label="Sunrise" value={data ? new Date(data.current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} />
          <DetailCard icon={<Sunset size={16} className="text-pink-400" />} label="AQI" value={`${data?.current.aqi ?? '--'}/5`} />
        </section>

        <footer className="pb-8 text-center text-sm opacity-55">
          Last updated: {data ? new Date(data.updatedAt).toLocaleTimeString() : '--:--:--'}
        </footer>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, darkMode }: { icon: React.ReactNode; label: string; value: string; darkMode: boolean }) {
  return (
    <div className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs ${darkMode ? 'bg-white/9 backdrop-blur-xl' : 'bg-slate-900/5'}`}>
      {icon}
      <span className="uppercase tracking-[0.12em] opacity-65">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] px-3 py-2 backdrop-blur-xl">
      {icon}
      <p className="text-[11px] font-semibold uppercase tracking-[1.4px] opacity-60">{label}</p>
      <p className="text-[15px] font-medium leading-none">{value}</p>
    </article>
  );
}

function WeatherGlyph({ kind, small }: { kind: string; small?: boolean }) {
  const size = small ? 20 : 78;
  const iconProps = { size, strokeWidth: 1.8 };

  if (kind === 'Clear') return <Sun {...iconProps} className="text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.55)]" />;
  if (kind === 'Clouds') return <Cloud {...iconProps} className="text-slate-200 drop-shadow-[0_0_14px_rgba(148,163,184,0.45)]" />;
  if (kind === 'Rain') return <CloudRain {...iconProps} className="text-sky-300 drop-shadow-[0_0_14px_rgba(56,189,248,0.45)]" />;
  if (kind === 'Snow') return <CloudSnow {...iconProps} className="text-blue-100 drop-shadow-[0_0_14px_rgba(147,197,253,0.45)]" />;
  if (kind === 'Thunderstorm') return <CloudLightning {...iconProps} className="text-indigo-300 drop-shadow-[0_0_14px_rgba(165,180,252,0.45)]" />;
  return <Cloud {...iconProps} className="text-slate-300 drop-shadow-[0_0_14px_rgba(148,163,184,0.45)]" />;
}

function DayGlyph({ condition }: { condition: string }) {
  const c = condition.toLowerCase();
  if (c.includes('clear')) return <Sun size={16} className="text-amber-300" />;
  if (c.includes('rain')) return <CloudRain size={16} className="text-sky-300" />;
  if (c.includes('snow')) return <CloudSnow size={16} className="text-blue-200" />;
  if (c.includes('thunder')) return <CloudLightning size={16} className="text-indigo-300" />;
  return <Cloud size={16} className="text-slate-300" />;
}
