# Minimal Animated Weather App

A premium, minimal weather app built with **Next.js 14 App Router**, **Tailwind CSS**, **Framer Motion**, and **OpenWeather API**.

## Features
- Browser geolocation with graceful city search fallback
- Current weather: temperature, condition, high/low, humidity, and wind
- 5-day forecast in horizontal scroll cards
- Dynamic animated backgrounds based on weather state
- Smooth transitions, loading skeleton, and clean error states
- Vercel-ready deployment setup

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local env file:
   ```bash
   cp .env.example .env.local
   ```
3. Add your API key in `.env.local`:
   ```env
   OPENWEATHER_API_KEY=...
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## Deploy to Vercel
- Import this repo into Vercel.
- Add `OPENWEATHER_API_KEY` to your Vercel project environment variables.
- Deploy.
