export interface Trip {
  id: string;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  activitiesCount: number;
  budget: string;
  travelers: number;
  weather: string;
  flightStatus?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  description: string;
}

export interface Activity {
  id: string;
  day: number;
  time: string;
  title: string;
  location: string;
  category: 'flight' | 'accommodation' | 'activity' | 'food' | 'transport';
}

export interface WeatherForecast {
  location: string;
  currentTemp: number;
  currentCondition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  forecast: {
    day: string;
    temp: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  }[];
}