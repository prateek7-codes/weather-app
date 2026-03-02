export type WeatherKind = 'Clear' | 'Clouds' | 'Rain' | 'Thunderstorm' | 'Snow' | 'Night' | 'Other';

export interface ForecastDay {
  date: string;
  temp: number;
  icon: string;
  condition: string;
  tempMin?: number;
  tempMax?: number;
  precipitationChance?: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  icon: string;
}

export interface WeatherPayload {
  location: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    tempMin: number;
    tempMax: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDeg: number;
    visibility: number;
    uvIndex: number;
    aqi: number;
    sunrise: number;
    sunset: number;
    condition: string;
    icon: string;
    weatherKind: WeatherKind;
    isNight: boolean;
  };
  hourly: HourlyForecast[];
  forecast: ForecastDay[];
  updatedAt: string;
}

export const resolveKind = (main: string, isNight: boolean): WeatherKind => {
  if (isNight) return 'Night';
  if (main === 'Clear' || main === 'Clouds' || main === 'Rain' || main === 'Thunderstorm' || main === 'Snow') {
    return main;
  }
  return 'Other';
};
