'use client';

import { motion } from 'framer-motion';
import { WeatherKind } from '@/lib/weather';

const particles = Array.from({ length: 30 }, (_, i) => i);

export function WeatherBackground({ kind }: { kind: WeatherKind }) {
  const styleMap: Record<WeatherKind, string> = {
    Clear: 'from-amber-100 via-orange-200/90 to-sky-200/80',
    Clouds: 'from-slate-100 via-slate-300/80 to-zinc-200/90',
    Rain: 'from-slate-500/85 via-slate-700/90 to-blue-950/90',
    Thunderstorm: 'from-slate-950 via-indigo-950 to-zinc-950',
    Snow: 'from-slate-100 via-sky-100/95 to-indigo-100/95',
    Night: 'from-slate-950 via-indigo-950 to-blue-950',
    Other: 'from-cyan-100 via-sky-200/85 to-indigo-200/80'
  };

  return (
    <motion.div
      key={kind}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br ${styleMap[kind]}`}
    >
      <motion.div
        className="absolute -left-24 -top-28 h-[24rem] w-[24rem] rounded-full bg-white/30 blur-3xl"
        animate={{ x: [0, 18, 0], y: [0, -14, 0], opacity: [0.28, 0.38, 0.28] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-24 -right-16 h-[22rem] w-[22rem] rounded-full bg-sky-200/30 blur-3xl"
        animate={{ x: [0, -16, 0], y: [0, 10, 0], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {(kind === 'Clouds' || kind === 'Rain') &&
        particles.slice(0, 10).map((p) => (
          <motion.div
            key={`cloud-${p}`}
            className="absolute h-16 w-36 rounded-full bg-white/20 blur-sm"
            style={{ top: `${8 + p * 8}%`, left: `${(p * 11) % 100}%` }}
            animate={{ x: [0, 22, 0], y: [0, -6, 0], opacity: [0.2, 0.32, 0.2] }}
            transition={{ duration: 14 + p, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

      {kind === 'Rain' &&
        particles.map((p) => (
          <motion.span
            key={`rain-${p}`}
            className="absolute h-10 w-[1.5px] rounded-full bg-cyan-100/70"
            style={{ left: `${(p * 3.5) % 100}%`, top: '-8%' }}
            animate={{ y: ['0vh', '110vh'] }}
            transition={{ duration: 1 + (p % 4) * 0.22, repeat: Infinity, ease: 'linear', delay: p * 0.05 }}
          />
        ))}

      {kind === 'Snow' &&
        particles.map((p) => (
          <motion.span
            key={`snow-${p}`}
            className="absolute h-2 w-2 rounded-full bg-white/85"
            style={{ left: `${(p * 6.5) % 100}%`, top: '-4%' }}
            animate={{ y: ['0vh', '110vh'], x: [0, 10, -9, 0], opacity: [0.85, 0.6, 0.85] }}
            transition={{ duration: 6 + (p % 5), repeat: Infinity, ease: 'linear', delay: p * 0.18 }}
          />
        ))}

      {kind === 'Night' &&
        particles.map((p) => (
          <motion.span
            key={`star-${p}`}
            className="absolute h-[3px] w-[3px] rounded-full bg-white"
            style={{ left: `${(p * 9) % 100}%`, top: `${(p * 13) % 100}%` }}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 2 + (p % 4), repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

      {kind === 'Thunderstorm' && (
        <motion.div
          className="absolute inset-0 bg-white/15"
          animate={{ opacity: [0, 0, 0.3, 0, 0, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 6, times: [0, 0.68, 0.72, 0.75, 0.9, 0.93, 1] }}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
      <div className="noise-overlay absolute inset-0" />
    </motion.div>
  );
}
