'use client';

import { motion } from 'framer-motion';
import { WeatherKind } from '@/lib/weather';

const particles = Array.from({ length: 24 }, (_, i) => i);

export function WeatherBackground({ kind }: { kind: WeatherKind }) {
  const styleMap: Record<WeatherKind, string> = {
    Clear: 'from-amber-200/80 via-orange-200/70 to-sky-200/80',
    Clouds: 'from-slate-200/80 via-slate-300/60 to-zinc-200/80',
    Rain: 'from-slate-500/80 via-slate-700/70 to-blue-900/80',
    Thunderstorm: 'from-slate-900 via-indigo-950 to-zinc-950',
    Snow: 'from-slate-100 via-sky-100 to-indigo-100',
    Night: 'from-slate-900 via-indigo-900 to-blue-950',
    Other: 'from-cyan-200 via-blue-200 to-indigo-200'
  };

  return (
    <motion.div
      key={kind}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className={`absolute inset-0 -z-10 bg-gradient-to-br ${styleMap[kind]} overflow-hidden`}
    >
      {(kind === 'Clouds' || kind === 'Rain') &&
        particles.slice(0, 8).map((p) => (
          <motion.div
            key={`cloud-${p}`}
            className="absolute h-16 w-32 rounded-full bg-white/20 blur-sm"
            style={{ top: `${10 + p * 8}%`, left: `${(p * 13) % 100}%` }}
            animate={{ x: [0, 24, 0], y: [0, -4, 0] }}
            transition={{ duration: 14 + p, repeat: Infinity }}
          />
        ))}

      {kind === 'Rain' &&
        particles.map((p) => (
          <motion.span
            key={`rain-${p}`}
            className="absolute h-8 w-[1.5px] bg-cyan-100/70"
            style={{ left: `${(p * 4) % 100}%`, top: '-8%' }}
            animate={{ y: ['0vh', '110vh'] }}
            transition={{ duration: 1.1 + (p % 4) * 0.3, repeat: Infinity, ease: 'linear', delay: p * 0.08 }}
          />
        ))}

      {kind === 'Snow' &&
        particles.map((p) => (
          <motion.span
            key={`snow-${p}`}
            className="absolute h-2 w-2 rounded-full bg-white/80"
            style={{ left: `${(p * 7) % 100}%`, top: '-3%' }}
            animate={{ y: ['0vh', '110vh'], x: [0, 10, -10, 0] }}
            transition={{ duration: 6 + (p % 5), repeat: Infinity, ease: 'linear', delay: p * 0.2 }}
          />
        ))}

      {kind === 'Night' &&
        particles.map((p) => (
          <motion.span
            key={`star-${p}`}
            className="absolute h-1 w-1 rounded-full bg-white"
            style={{ left: `${(p * 9) % 100}%`, top: `${(p * 13) % 100}%` }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + (p % 4), repeat: Infinity }}
          />
        ))}

      {kind === 'Thunderstorm' && (
        <motion.div
          className="absolute inset-0 bg-white/10"
          animate={{ opacity: [0, 0, 0.24, 0, 0] }}
          transition={{ repeat: Infinity, duration: 5, times: [0, 0.7, 0.74, 0.78, 1] }}
        />
      )}
    </motion.div>
  );
}
