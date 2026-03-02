export type WeatherKind = 'Clear' | 'Clouds' | 'Rain' | 'Thunderstorm' | 'Snow' | 'Night' | 'Other';

export interface ForecastDay {
  date: string;
  temp: number;
  icon: string;
  condition: string;
}

export interface WeatherPayload {
  location: {
    city: string;
    country: string;
  };
  current: {
    temp: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
    weatherKind: WeatherKind;
    isNight: boolean;
  };
  forecast: ForecastDay[];
}

export const resolveKind = (main: string, isNight: boolean): WeatherKind => {
  if (isNight) return 'Night';
  if (main === 'Clear' || main === 'Clouds' || main === 'Rain' || main === 'Thunderstorm' || main === 'Snow') {
    return main;
  }
  return 'Other';
};
