import { Trip, Destination, Activity, WeatherForecast } from '../types';

export const trips: Trip[] = [
  {
    id: '1',
    destination: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    startDate: '2024-06-15',
    endDate: '2024-06-22',
    daysCount: 7,
    activitiesCount: 12
  },
  {
    id: '2',
    destination: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    startDate: '2024-07-01',
    endDate: '2024-07-10',
    daysCount: 9,
    activitiesCount: 15
  },
  {
    id: '3',
    destination: 'New York, USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    startDate: '2024-08-05',
    endDate: '2024-08-12',
    daysCount: 7,
    activitiesCount: 10
  }
];

export const popularDestinations: Destination[] = [
  {
    id: '1',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    description: 'Tropical paradise with stunning beaches and rich culture'
  },
  {
    id: '2',
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    description: 'Iconic white-washed buildings and breathtaking sunsets'
  },
  {
    id: '3',
    name: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    description: 'Ancient temples and traditional Japanese culture'
  },
  {
    id: '4',
    name: 'Barcelona',
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    description: 'Vibrant city with stunning architecture and beaches'
  }
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