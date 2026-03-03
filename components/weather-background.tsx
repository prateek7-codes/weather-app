'use client';

import { motion } from 'framer-motion';
import { WeatherKind } from '@/lib/weather';

const particles = Array.from({ length: 24 }, (_, i) => i);

export function WeatherBackground({
  kind,
  darkMode = true
}: {
  kind: WeatherKind;
  darkMode?: boolean;
}) {
  const backgroundStyle = darkMode
    ? 'radial-gradient(ellipse at 50% 20%, #1a3f5c 0%, #020c1b 65%)'
    : 'radial-gradient(ellipse at 50% 20%, #dbeeff 0%, #eef4fb 70%)';

  return (
    <motion.div
      key={`${kind}-${darkMode ? 'dark' : 'light'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{ background: backgroundStyle }}
    >
      {/* Ambient Glow Blob 1 */}
      <motion.div
        className={`absolute -left-32 -top-32 h-96 w-96 rounded-full ${
          darkMode ? 'bg-cyan-400/20' : 'bg-sky-300/30'
        } blur-[120px]`}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Ambient Glow Blob 2 */}
      <motion.div
        className={`absolute -bottom-32 -right-32 h-96 w-96 rounded-full ${
          darkMode ? 'bg-indigo-400/25' : 'bg-indigo-300/30'
        } blur-[140px]`}
        animate={{ x: [0, -30, 0], y: [0, 15, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cinematic Grain / Noise */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:3px_3px]" />

      {/* Weather Effects */}
      {kind === 'Rain' &&
        particles.map((p) => (
          <motion.span
            key={`rain-${p}`}
            className={`absolute h-10 w-[1.5px] ${
              darkMode ? 'bg-cyan-200/50' : 'bg-blue-300/50'
            }`}
            style={{ left: `${(p * 4) % 100}%`, top: '-6%' }}
            animate={{ y: ['0vh', '110vh'] }}
            transition={{
              duration: 1.2 + (p % 3) * 0.2,
              repeat: Infinity,
              ease: 'linear',
              delay: p * 0.08
            }}
          />
        ))}

      {(kind === 'Clouds' || kind === 'Snow') &&
        particles.slice(0, 8).map((p) => (
          <motion.div
            key={`cloud-${p}`}
            className={`absolute h-16 w-32 rounded-full ${
              darkMode ? 'bg-white/8' : 'bg-white/30'
            } blur-md`}
            style={{ top: `${10 + p * 10}%`, left: `${(p * 12) % 100}%` }}
            animate={{ x: [0, 20, 0], y: [0, -5, 0] }}
            transition={{ duration: 14 + p, repeat: Infinity }}
          />
        ))}

      {/* Vignette */}
      <div
        className={`absolute inset-0 ${
          darkMode
            ? 'bg-[radial-gradient(circle_at_center,transparent_45%,rgba(3,7,17,0.75)_100%)]'
            : 'bg-[radial-gradient(circle_at_center,transparent_50%,rgba(148,163,184,0.25)_100%)]'
        }`}
      />
    </motion.div>
  );
}
