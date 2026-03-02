'use client';

import { motion } from 'framer-motion';
import { WeatherKind } from '@/lib/weather';

const particles = Array.from({ length: 24 }, (_, i) => i);

export function WeatherBackground({ kind, darkMode = true }: { kind: WeatherKind; darkMode?: boolean }) {
  const themeMap: Record<WeatherKind, string> = darkMode
    ? {
        Clear: 'from-[#060d1c] via-[#132845] to-[#1f3661]',
        Clouds: 'from-[#060d1c] via-[#1a2e47] to-[#22364f]',
        Rain: 'from-[#050c18] via-[#10263c] to-[#17324a]',
        Thunderstorm: 'from-[#03050d] via-[#0d172d] to-[#131b2c]',
        Snow: 'from-[#091327] via-[#1a2f49] to-[#27405e]',
        Night: 'from-[#030711] via-[#111a31] to-[#1a2742]',
        Other: 'from-[#060d1c] via-[#132845] to-[#223754]'
      }
    : {
        Clear: 'from-[#e3eeff] via-[#edf4ff] to-[#f5f9ff]',
        Clouds: 'from-[#e8f0ff] via-[#eef4ff] to-[#f6f9ff]',
        Rain: 'from-[#dde9ff] via-[#e7f0ff] to-[#f0f5ff]',
        Thunderstorm: 'from-[#e4edff] via-[#ecf2ff] to-[#f4f8ff]',
        Snow: 'from-[#eaf2ff] via-[#f0f5ff] to-[#f7faff]',
        Night: 'from-[#e0ebff] via-[#e8f1ff] to-[#f1f6ff]',
        Other: 'from-[#e6efff] via-[#edf4ff] to-[#f4f8ff]'
      };

  return (
    <motion.div
      key={`${kind}-${darkMode ? 'dark' : 'light'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br ${themeMap[kind]}`}
    >
      <motion.div
        className={`absolute -left-24 -top-28 h-80 w-80 rounded-full ${darkMode ? 'bg-cyan-400/16' : 'bg-sky-300/30'} blur-3xl`}
        animate={{ x: [0, 24, 0], y: [0, -12, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute -bottom-28 -right-24 h-80 w-80 rounded-full ${darkMode ? 'bg-indigo-400/18' : 'bg-indigo-300/30'} blur-3xl`}
        animate={{ x: [0, -22, 0], y: [0, 8, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {kind === 'Rain' &&
        particles.map((p) => (
          <motion.span
            key={`rain-${p}`}
            className={`absolute h-8 w-[1.5px] ${darkMode ? 'bg-cyan-200/50' : 'bg-blue-300/50'}`}
            style={{ left: `${(p * 4) % 100}%`, top: '-6%' }}
            animate={{ y: ['0vh', '110vh'] }}
            transition={{ duration: 1.1 + (p % 3) * 0.2, repeat: Infinity, ease: 'linear', delay: p * 0.08 }}
          />
        ))}

      {(kind === 'Clouds' || kind === 'Snow') &&
        particles.slice(0, 8).map((p) => (
          <motion.div
            key={`cloud-${p}`}
            className={`absolute h-14 w-28 rounded-full ${darkMode ? 'bg-white/10' : 'bg-white/35'} blur-sm`}
            style={{ top: `${10 + p * 10}%`, left: `${(p * 12) % 100}%` }}
            animate={{ x: [0, 16, 0], y: [0, -4, 0] }}
            transition={{ duration: 12 + p, repeat: Infinity }}
          />
        ))}

      <div className={`absolute inset-0 ${darkMode ? 'bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,7,17,0.5)_100%)]' : 'bg-[radial-gradient(circle_at_center,transparent_42%,rgba(148,163,184,0.2)_100%)]'}`} />
    </motion.div>
  );
}
