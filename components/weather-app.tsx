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
      className="relative min-h-screen overflow-hidden px-4 py-12 text-slate-900"
      onMouseMove={(e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 10;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;
        setOffset({ x, y });
      }}
    >
      <WeatherBackground kind={kind} />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <form onSubmit={onSearch} className="z-10">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city"
            className="w-full rounded-2xl border border-white/30 bg-white/40 px-5 py-3 text-sm backdrop-blur-md placeholder:text-slate-600/80 focus:outline-none focus:ring-2 focus:ring-white/60"
          />
        </form>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-white/30 bg-white/35 p-8 shadow-glass backdrop-blur-xl"
            >
              <div className="h-6 w-40 animate-pulse rounded bg-white/70" />
              <div className="mt-6 h-20 w-36 animate-pulse rounded bg-white/70" />
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="h-16 animate-pulse rounded-xl bg-white/70" />
                <div className="h-16 animate-pulse rounded-xl bg-white/70" />
                <div className="h-16 animate-pulse rounded-xl bg-white/70" />
              </div>
            </motion.div>
          ) : error && !data ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/40 bg-white/50 p-8 text-center text-slate-700 shadow-glass backdrop-blur-xl"
            >
              {error}
            </motion.div>
          ) : (
            data && (
              <motion.section
                key={data.location.city}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.5 }}
                style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
                className="rounded-[2rem] border border-white/30 bg-white/35 p-8 shadow-glass backdrop-blur-xl"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-slate-700/80">
                  {data.location.city}, {data.location.country}
                </p>
                <motion.h1
                  key={data.current.temp}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-7xl font-semibold leading-none"
                >
                  {data.current.temp}°
                </motion.h1>
                <p className="mt-3 text-lg capitalize text-slate-700">{data.current.condition}</p>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label="High / Low" value={`${data.current.tempMax}° / ${data.current.tempMin}°`} />
                  <Metric label="Humidity" value={`${data.current.humidity}%`} />
                  <Metric label="Wind" value={`${data.current.windSpeed} m/s`} />
                  <Metric label="Feels" value={`${Math.round((data.current.tempMax + data.current.tempMin) / 2)}°`} />
                </div>

                <div className="mt-8">
                  <p className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-600">5-Day Forecast</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {data.forecast.map((day) => (
                      <motion.div
                        whileHover={{ y: -2, scale: 1.01 }}
                        key={day.date}
                        className="min-w-24 rounded-2xl border border-white/40 bg-white/45 p-3 text-center"
                      >
                        <p className="text-xs text-slate-600">{dateFmt.format(new Date(day.date))}</p>
                        <p className="mt-2 text-xl font-medium">{day.temp}°</p>
                        <p className="text-xs text-slate-600">{day.condition}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl bg-white/50 p-3 text-center transition">
      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-600">{label}</p>
      <p className="mt-1 text-base font-medium">{value}</p>
    </motion.div>
  );
}
