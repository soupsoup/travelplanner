import { Trip, Destination, Activity, WeatherForecast } from '../types';

export const trips: Trip[] = [
  {
    id: '1',
    destination: 'Paris, France',
    name: 'Romantic Paris Getaway',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    startDate: '2024-06-15',
    endDate: '2024-06-22',
    daysCount: 7,
    travelers: 2,
    budget: {
      total: 3500,
      currency: 'USD',
      categories: {
        accommodation: 1200,
        food: 800,
        activities: 600,
        transportation: 500,
        shopping: 300,
        miscellaneous: 100
      },
      expenses: []
    },
    transportation: {
      mode: 'plane',
      details: []
    },
    notes: 'Anniversary trip to Paris',
    status: 'confirmed',
    activitiesCount: 12,
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-15T14:30:00Z'
  },
  {
    id: '2',
    destination: 'Tokyo, Japan',
    name: 'Tokyo Adventure',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    startDate: '2024-07-01',
    endDate: '2024-07-10',
    daysCount: 9,
    travelers: 1,
    budget: {
      total: 4200,
      currency: 'USD',
      categories: {
        accommodation: 1500,
        food: 900,
        activities: 800,
        transportation: 700,
        shopping: 200,
        miscellaneous: 100
      },
      expenses: []
    },
    transportation: {
      mode: 'plane',
      details: []
    },
    notes: 'Solo trip to explore Japanese culture',
    status: 'planning',
    activitiesCount: 15,
    createdAt: '2024-05-10T09:00:00Z',
    updatedAt: '2024-05-20T16:45:00Z'
  },
  {
    id: '3',
    destination: 'New York, USA',
    name: 'NYC Business & Leisure',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    startDate: '2024-08-05',
    endDate: '2024-08-12',
    daysCount: 7,
    travelers: 3,
    budget: {
      total: 5000,
      currency: 'USD',
      categories: {
        accommodation: 1800,
        food: 1200,
        activities: 800,
        transportation: 600,
        shopping: 400,
        miscellaneous: 200
      },
      expenses: []
    },
    transportation: {
      mode: 'plane',
      details: []
    },
    notes: 'Business trip with family time',
    status: 'confirmed',
    activitiesCount: 10,
    createdAt: '2024-06-01T11:00:00Z',
    updatedAt: '2024-06-10T13:20:00Z'
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
    title: 'Arrival at Charles de Gaulle Airport',
    description: 'Flight arrival and airport procedures',
    location: {
      name: 'Charles de Gaulle Airport',
      address: '95700 Roissy-en-France',
      city: 'Paris',
      country: 'France'
    },
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    category: 'other',
    bookingRequired: false,
    notes: 'Flight landing and customs'
  },
  {
    id: '2',
    title: 'Check-in at Hotel Le Marais',
    description: 'Hotel check-in and room setup',
    location: {
      name: 'Hotel Le Marais',
      address: '12 Rue du Temple',
      city: 'Paris',
      country: 'France'
    },
    startTime: '1:00 PM',
    endTime: '2:00 PM',
    category: 'other',
    bookingRequired: true,
    notes: 'Boutique hotel in historic district'
  },
  {
    id: '3',
    title: 'Stroll around Le Marais district',
    description: 'Explore the historic Jewish quarter',
    location: {
      name: 'Le Marais District',
      address: 'Le Marais',
      city: 'Paris',
      country: 'France'
    },
    startTime: '3:00 PM',
    endTime: '5:00 PM',
    category: 'activity',
    bookingRequired: false,
    notes: 'Historic neighborhood exploration'
  },
  {
    id: '4',
    title: 'Dinner at Chez Julien',
    description: 'Traditional French cuisine',
    location: {
      name: 'Chez Julien',
      address: '1 Rue du Pont Louis-Philippe',
      city: 'Paris',
      country: 'France'
    },
    startTime: '7:00 PM',
    endTime: '9:00 PM',
    category: 'restaurant',
    bookingRequired: true,
    cost: 80,
    notes: 'Authentic French bistro'
  },
  {
    id: '5',
    title: 'Visit the Louvre Museum',
    description: 'World-famous art museum',
    location: {
      name: 'Louvre Museum',
      address: 'Rue de Rivoli',
      city: 'Paris',
      country: 'France'
    },
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    category: 'attraction',
    bookingRequired: true,
    cost: 25,
    rating: 4.8,
    notes: 'Pre-booked tickets required'
  },
  {
    id: '6',
    title: 'Lunch at Angelina',
    description: 'Famous hot chocolate and pastries',
    location: {
      name: 'Angelina',
      address: '226 Rue de Rivoli',
      city: 'Paris',
      country: 'France'
    },
    startTime: '1:00 PM',
    endTime: '2:30 PM',
    category: 'restaurant',
    bookingRequired: false,
    cost: 35,
    notes: 'Historic tea room since 1903'
  },
  {
    id: '7',
    title: 'Eiffel Tower Visit',
    description: 'Iconic Paris landmark',
    location: {
      name: 'Eiffel Tower',
      address: 'Champ de Mars',
      city: 'Paris',
      country: 'France'
    },
    startTime: '3:00 PM',
    endTime: '5:00 PM',
    category: 'attraction',
    bookingRequired: true,
    cost: 30,
    rating: 4.9,
    notes: 'Summit access tickets'
  },
  {
    id: '8',
    title: 'Seine River Dinner Cruise',
    description: 'Romantic dinner cruise on the Seine',
    location: {
      name: 'Port de la Bourdonnais',
      address: 'Port de la Bourdonnais',
      city: 'Paris',
      country: 'France'
    },
    startTime: '7:30 PM',
    endTime: '10:00 PM',
    category: 'restaurant',
    bookingRequired: true,
    cost: 120,
    rating: 4.7,
    notes: 'Evening cruise with dinner'
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