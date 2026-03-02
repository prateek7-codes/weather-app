'use client';

import { motion } from 'framer-motion';
import { WeatherKind } from '@/lib/weather';

const particles = Array.from({ length: 24 }, (_, i) => i);

export function WeatherBackground({ kind, darkMode = true }: { kind: WeatherKind; darkMode?: boolean }) {
  const themeMap: Record<WeatherKind, string> = darkMode
    ? {
        Clear: 'from-[#0b1224] via-[#1b2f52] to-[#2f3f6f]',
        Clouds: 'from-[#0b1224] via-[#24364e] to-[#2c3e57]',
        Rain: 'from-[#091424] via-[#11283f] to-[#1a2b44]',
        Thunderstorm: 'from-[#04060f] via-[#121b33] to-[#151a2a]',
        Snow: 'from-[#0d172b] via-[#1c2f48] to-[#2c405d]',
        Night: 'from-[#050914] via-[#131d35] to-[#1b2745]',
        Other: 'from-[#0b1224] via-[#1b2f52] to-[#243b5a]'
      }
    : {
        Clear: 'from-[#dfeeff] via-[#eaf4ff] to-[#f3f8ff]',
        Clouds: 'from-[#e4eefb] via-[#edf4ff] to-[#f4f8ff]',
        Rain: 'from-[#d8e8ff] via-[#e2edff] to-[#eef3ff]',
        Thunderstorm: 'from-[#dfe8fa] via-[#e8efff] to-[#f0f5ff]',
        Snow: 'from-[#e8f1ff] via-[#eef5ff] to-[#f5f9ff]',
        Night: 'from-[#dbe7ff] via-[#e3eeff] to-[#eef4ff]',
        Other: 'from-[#e4edff] via-[#ebf3ff] to-[#f3f8ff]'
      };

  return (
    <motion.div
      key={`${kind}-${darkMode ? 'dark' : 'light'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className={`absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br ${themeMap[kind]}`}
    >
      <motion.div
        className={`absolute -left-16 -top-24 h-72 w-72 rounded-full ${darkMode ? 'bg-sky-400/15' : 'bg-sky-300/30'} blur-3xl`}
        animate={{ x: [0, 24, 0], y: [0, -12, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute -bottom-20 -right-16 h-72 w-72 rounded-full ${darkMode ? 'bg-indigo-400/15' : 'bg-indigo-300/25'} blur-3xl`}
        animate={{ x: [0, -22, 0], y: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {kind === 'Rain' &&
        particles.map((p) => (
          <motion.span
            key={`rain-${p}`}
            className={`absolute h-8 w-[1.5px] ${darkMode ? 'bg-cyan-200/55' : 'bg-blue-300/55'}`}
            style={{ left: `${(p * 4) % 100}%`, top: '-6%' }}
            animate={{ y: ['0vh', '110vh'] }}
            transition={{ duration: 1.1 + (p % 3) * 0.2, repeat: Infinity, ease: 'linear', delay: p * 0.08 }}
          />
        ))}

      {(kind === 'Clouds' || kind === 'Snow') &&
        particles.slice(0, 8).map((p) => (
          <motion.div
            key={`cloud-${p}`}
            className={`absolute h-14 w-28 rounded-full ${darkMode ? 'bg-white/12' : 'bg-white/40'} blur-sm`}
            style={{ top: `${10 + p * 10}%`, left: `${(p * 12) % 100}%` }}
            animate={{ x: [0, 16, 0], y: [0, -4, 0] }}
            transition={{ duration: 12 + p, repeat: Infinity }}
          />
        ))}
    </motion.div>
  );
}
