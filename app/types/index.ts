export interface Trip {
  id: string;
  destination: string;
  name: string;
  image: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  travelers: number;
  budget: Budget;
  transportation: Transportation;
  notes?: string;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  activitiesCount: number; // Total number of activities in the itinerary
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  total: number;
  currency: string;
  categories: {
    accommodation: number;
    food: number;
    activities: number;
    transportation: number;
    shopping: number;
    miscellaneous: number;
  };
  expenses: Expense[];
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: 'accommodation' | 'food' | 'activities' | 'transportation' | 'shopping' | 'miscellaneous';
  description: string;
  date: string;
  receipt?: string;
}

export interface Transportation {
  mode: 'plane' | 'train' | 'car' | 'bus' | 'boat' | 'other';
  details: TransportationDetail[];
}

export interface TransportationDetail {
  id: string;
  type: 'flight' | 'train' | 'car_rental' | 'bus' | 'taxi' | 'other';
  from: string;
  to: string;
  date: string;
  time: string;
  duration?: string;
  cost?: number;
  bookingReference?: string;
  notes?: string;
}

export interface Itinerary {
  id: string;
  tripId: string;
  days: ItineraryDay[];
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  activities: Activity[];
  accommodations: Accommodation[];
  transportation: TransportationDetail[];
  notes?: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  location: Location;
  startTime: string;
  endTime?: string;
  duration?: string;
  category: 'attraction' | 'restaurant' | 'activity' | 'shopping' | 'entertainment' | 'other';
  cost?: number;
  bookingRequired: boolean;
  reservation?: Reservation;
  rating?: number;
  notes?: string;
  photos?: string[];
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'airbnb' | 'hostel' | 'resort' | 'other';
  location: Location;
  checkIn: string;
  checkOut: string;
  cost?: number;
  bookingReference?: string;
  rating?: number;
  amenities?: string[];
  notes?: string;
  photos?: string[];
}

export interface Location {
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Reservation {
  id: string;
  confirmationNumber: string;
  platform: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  cost?: number;
  cancelPolicy?: string;
  notes?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  description: string;
  bestTimeToVisit?: string;
  averageCost?: number;
  popularAttractions?: string[];
  climate?: string;
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

export interface AIPreferences {
  travelStyle: 'budget' | 'mid-range' | 'luxury';
  interests: string[];
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  groupType: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  accommodationPreference: 'hotel' | 'airbnb' | 'hostel' | 'resort' | 'no-preference';
  activityLevel: 'relaxed' | 'moderate' | 'active' | 'adventurous';
} 