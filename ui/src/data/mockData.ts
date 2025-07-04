import { Trip, Destination, Activity, WeatherForecast } from '../types';

export const trips: Trip[] = [
  {
    id: '1',
    destination: 'Paris, France',
    image: 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    startDate: 'Aug 12, 2025',
    endDate: 'Aug 18, 2025',
    daysCount: 7,
    activitiesCount: 12,
    budget: '$2,500',
    travelers: 2,
    weather: 'Mostly sunny, 25°C',
    flightStatus: 'Confirmed'
  },
  {
    id: '2',
    destination: 'Tokyo, Japan',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    startDate: 'Oct 5, 2025',
    endDate: 'Oct 15, 2025',
    daysCount: 10,
    activitiesCount: 15,
    budget: '$3,800',
    travelers: 1,
    weather: 'Partly cloudy, 22°C'
  },
  {
    id: '3',
    destination: 'Bali, Indonesia',
    image: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    startDate: 'Dec 20, 2025',
    endDate: 'Jan 3, 2026',
    daysCount: 14,
    activitiesCount: 8,
    budget: '$4,200',
    travelers: 2,
    weather: 'Sunny, 30°C'
  },
];

export const popularDestinations: Destination[] = [
  {
    id: '1',
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 4.8,
    description: 'Known for its stunning white buildings, blue domes, and spectacular sunsets over the Aegean Sea.'
  },
  {
    id: '2',
    name: 'Kyoto',
    country: 'Japan',
    image: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 4.7,
    description: 'Experience traditional Japanese culture with ancient temples, beautiful gardens, and geisha districts.'
  },
  {
    id: '3',
    name: 'Barcelona',
    country: 'Spain',
    image: 'https://images.pexels.com/photos/819764/pexels-photo-819764.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 4.6,
    description: 'A vibrant city famous for its unique architecture, Mediterranean beaches, and lively atmosphere.'
  },
  {
    id: '4',
    name: 'New York',
    country: 'USA',
    image: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 4.5,
    description: 'The city that never sleeps offers world-class museums, diverse cuisine, and iconic landmarks.'
  },
];

export const itineraryActivities: Activity[] = [
  {
    id: '1',
    day: 1,
    time: '10:30 AM',
    title: 'Arrival at Charles de Gaulle Airport',
    location: 'Paris, France',
    category: 'flight'
  },
  {
    id: '2',
    day: 1,
    time: '1:00 PM',
    title: 'Check-in at Hotel Le Marais',
    location: '12 Rue du Temple, Paris',
    category: 'accommodation'
  },
  {
    id: '3',
    day: 1,
    time: '3:00 PM',
    title: 'Stroll around Le Marais district',
    location: 'Le Marais, Paris',
    category: 'activity'
  },
  {
    id: '4',
    day: 1,
    time: '7:00 PM',
    title: 'Dinner at Chez Julien',
    location: '1 Rue du Pont Louis-Philippe, Paris',
    category: 'food'
  },
  {
    id: '5',
    day: 2,
    time: '9:00 AM',
    title: 'Visit the Louvre Museum',
    location: 'Rue de Rivoli, Paris',
    category: 'activity'
  },
  {
    id: '6',
    day: 2,
    time: '1:00 PM',
    title: 'Lunch at Angelina',
    location: '226 Rue de Rivoli, Paris',
    category: 'food'
  },
  {
    id: '7',
    day: 2,
    time: '3:00 PM',
    title: 'Eiffel Tower Visit',
    location: 'Champ de Mars, Paris',
    category: 'activity'
  },
  {
    id: '8',
    day: 2,
    time: '7:30 PM',
    title: 'Seine River Dinner Cruise',
    location: 'Port de la Bourdonnais, Paris',
    category: 'food'
  },
];

export const weatherForecast: WeatherForecast = {
  location: 'Paris, France',
  currentTemp: 25,
  currentCondition: 'sunny',
  forecast: [
    {
      day: 'Mon',
      temp: 25,
      condition: 'sunny'
    },
    {
      day: 'Tue',
      temp: 24,
      condition: 'cloudy'
    },
    {
      day: 'Wed',
      temp: 26,
      condition: 'sunny'
    },
    {
      day: 'Thu',
      temp: 23,
      condition: 'rainy'
    },
    {
      day: 'Fri',
      temp: 22,
      condition: 'cloudy'
    }
  ]
};