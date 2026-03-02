import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 12px 40px rgba(15, 23, 42, 0.2)'
      },
      animation: {
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        drift: 'drift 16s ease-in-out infinite'
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' }
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-14px) translateX(8px)' }
        }
      }
    }
  },
  plugins: []
};

export default config;
