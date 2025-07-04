import React, { useState } from 'react';
import { ArrowLeft, Camera, Download, Share } from 'lucide-react';
import Navbar from '../components/Navigation/Navbar';
import Button from '../components/ui/Button';
import TripSummary from '../components/Trip/TripSummary';
import ItineraryDay from '../components/Trip/ItineraryDay';
import WeatherWidget from '../components/WeatherWidget';
import { trips, itineraryActivities, weatherForecast } from '../data/mockData';

const TripDetails: React.FC = () => {
  const trip = trips[0]; // We're using the first trip for the example
  const [activeTab, setActiveTab] = useState('itinerary');
  
  // Group activities by day
  const activitiesByDay = itineraryActivities.reduce((acc, activity) => {
    if (!acc[activity.day]) {
      acc[activity.day] = [];
    }
    acc[activity.day].push(activity);
    return acc;
  }, {} as Record<number, typeof itineraryActivities>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Trip header with background image */}
      <div 
        className="pt-16 bg-cover bg-center h-64 md:h-80 relative"
        style={{ backgroundImage: `url(${trip.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-6">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white">{trip.destination}</h1>
          <div className="flex items-center text-white/80 text-sm mt-2">
            <span>{trip.startDate} - {trip.endDate}</span>
            <span className="mx-2">•</span>
            <span>{trip.daysCount} days</span>
          </div>
          
          <div className="flex mt-4 space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              icon={<Camera className="h-4 w-4" />}
            >
              Photos
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              icon={<Share className="h-4 w-4" />}
            >
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              icon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'itinerary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('itinerary')}
            >
              Itinerary
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'accommodations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('accommodations')}
            >
              Accommodations
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transportation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('transportation')}
            >
              Transportation
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('activities')}
            >
              Activities
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <TripSummary 
              destination={trip.destination}
              startDate={trip.startDate}
              endDate={trip.endDate}
              budget={trip.budget}
              travelers={trip.travelers}
              weather={trip.weather}
              flightStatus={trip.flightStatus}
            />
            
            <WeatherWidget 
              location={weatherForecast.location}
              currentTemp={weatherForecast.currentTemp}
              currentCondition={weatherForecast.currentCondition}
              forecast={weatherForecast.forecast}
            />
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-2">
            {activeTab === 'itinerary' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Trip Itinerary</h2>
                  <Button variant="outline" size="sm">
                    Edit Itinerary
                  </Button>
                </div>
                
                {Object.entries(activitiesByDay).map(([day, activities]) => (
                  <ItineraryDay 
                    key={day}
                    day={parseInt(day)}
                    date={day === '1' ? 'August 12, 2025' : 'August 13, 2025'}
                    activities={activities}
                    onAddActivity={() => console.log(`Add activity to day ${day}`)}
                  />
                ))}
              </div>
            )}
            
            {activeTab !== 'itinerary' && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-500">
                  This section is currently under development. Check back later for updates!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;