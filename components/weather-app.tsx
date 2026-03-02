'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { WeatherBackground } from '@/components/weather-background';
import { WeatherPayload } from '@/lib/weather';

const fetchWeather = async (params: string) => {
  const res = await fetch(`/api/weather?${params}`);
  if (!res.ok) throw new Error('Failed to load weather');
  return (await res.json()) as WeatherPayload;
};

export function WeatherApp() {
  const [data, setData] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [offset, setOffset] = useState({ x: 0, y: 0 });

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

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    try {
      const weather = await fetchWeather(`city=${encodeURIComponent(city.trim())}`);
      setData(weather);
      setError(null);
    } catch {
      setError('City not found. Try another search.');
    } finally {
      setLoading(false);
    }
  };

  const kind = data?.current.weatherKind ?? 'Other';
  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat('en', {
        weekday: 'short'
      }),
    []
  );

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-900 sm:px-6 sm:py-10"
      onMouseMove={(e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 8;
        const y = (e.clientY / window.innerHeight - 0.5) * 8;
        setOffset({ x, y });
      }}
    >
      <WeatherBackground kind={kind} />

      <motion.div
        className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <form onSubmit={onSearch} className="z-10">
          <label htmlFor="city-search" className="sr-only">
            Search city
          </label>
          <div className="relative">
            <input
              id="city-search"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search city"
              className="w-full rounded-2xl border border-white/45 bg-white/45 px-5 py-3.5 text-sm font-medium text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl placeholder:text-slate-500/90 focus:outline-none focus:ring-2 focus:ring-sky-300/70"
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/30 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          </div>
        </form>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/30 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:p-8"
            >
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/50 to-transparent" />
              <div className="h-5 w-40 animate-pulse rounded-lg bg-white/70" />
              <div className="mt-6 h-24 w-44 animate-pulse rounded-2xl bg-white/70" />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="h-16 animate-pulse rounded-2xl bg-white/70" />
                <div className="h-16 animate-pulse rounded-2xl bg-white/70" />
                <div className="h-16 animate-pulse rounded-2xl bg-white/70" />
                <div className="h-16 animate-pulse rounded-2xl bg-white/70" />
              </div>
              <div className="mt-6 flex gap-3">
                <div className="h-20 w-20 animate-pulse rounded-2xl bg-white/70" />
                <div className="h-20 w-20 animate-pulse rounded-2xl bg-white/70" />
                <div className="h-20 w-20 animate-pulse rounded-2xl bg-white/70" />
              </div>
            </motion.div>
          ) : error && !data ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-rose-100/80 bg-white/60 p-7 text-center text-sm font-medium text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-8"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Unable to load weather</p>
              <p className="mt-3 text-base text-slate-700">{error}</p>
            </motion.div>
          ) : (
            data && (
              <motion.section
                key={data.location.city}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
                className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-white/30 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl sm:p-8"
              >
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/55 to-transparent" />

                <div className="relative">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-600/90">
                    {data.location.city}, {data.location.country}
                  </p>
                  <motion.h1
                    key={data.current.temp}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
                    className="mt-4 text-[86px] font-semibold leading-[0.95] tracking-[-0.03em] text-slate-900 sm:text-[110px]"
                  >
                    {data.current.temp}°
                  </motion.h1>
                  <p className="mt-2 text-base font-medium capitalize text-slate-700/95 sm:text-lg">
                    {data.current.condition}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label="High / Low" value={`${data.current.tempMax}° / ${data.current.tempMin}°`} />
                  <Metric label="Humidity" value={`${data.current.humidity}%`} />
                  <Metric label="Wind" value={`${data.current.windSpeed} m/s`} />
                  <Metric label="Feels" value={`${Math.round((data.current.tempMax + data.current.tempMin) / 2)}°`} />
                </div>

                <div className="mt-8 border-t border-white/40 pt-6">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-600/90">
                    5-Day Forecast
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {data.forecast.map((day) => (
                      <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        key={day.date}
                        className="group min-w-[92px] rounded-2xl border border-white/45 bg-white/55 p-3.5 text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                      >
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                          {dateFmt.format(new Date(day.date))}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{day.temp}°</p>
                        <p className="mt-1 text-xs font-medium text-slate-600 group-hover:text-slate-700">
                          {day.condition}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/40 bg-white/45 p-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1.5 text-base font-semibold text-slate-900">{value}</p>
    </motion.div>
  );
}
