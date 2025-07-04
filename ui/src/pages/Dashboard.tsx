import React from 'react';
import { PlusCircle, Search } from 'lucide-react';
import Navbar from '../components/Navigation/Navbar';
import TripCard from '../components/Trip/TripCard';
import DestinationCard from '../components/Trip/DestinationCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { trips, popularDestinations } from '../data/mockData';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Plan Your Dream Adventure
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Discover amazing destinations, create detailed itineraries, and travel with confidence.
            </p>
            
            <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col md:flex-row">
              <div className="flex-grow mb-2 md:mb-0 md:mr-2">
                <Input
                  placeholder="Where would you like to go?"
                  icon={<Search className="h-5 w-5 text-gray-400" />}
                />
              </div>
              <Button className="w-full md:w-auto">
                Search Destinations
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* My Trips Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
          <Button 
            variant="outline" 
            icon={<PlusCircle className="h-5 w-5" />}
          >
            Create New Trip
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <TripCard
              key={trip.id}
              id={trip.id}
              destination={trip.destination}
              image={trip.image}
              startDate={trip.startDate}
              endDate={trip.endDate}
              daysCount={trip.daysCount}
              activitiesCount={trip.activitiesCount}
              onClick={() => console.log(`View trip ${trip.id}`)}
            />
          ))}
        </div>
      </div>
      
      {/* Popular Destinations Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Destinations</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map(destination => (
              <DestinationCard
                key={destination.id}
                name={destination.name}
                image={destination.image}
                country={destination.country}
                rating={destination.rating}
                description={destination.description}
                onClick={() => console.log(`View destination ${destination.id}`)}
              />
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Button variant="outline">View All Destinations</Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Trip with Ease
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive travel planning tools help you create memorable experiences without the stress.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Itinerary Builder</h3>
            <p className="text-gray-600">
              Create detailed day-by-day plans with activities, reservations, and transport options.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Destination Guides</h3>
            <p className="text-gray-600">
              Access insider tips, must-see attractions, and local recommendations for each destination.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Travel Checklist</h3>
            <p className="text-gray-600">
              Stay organized with customizable packing lists and pre-trip preparation tasks.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Wanderlust</h3>
              <p className="text-gray-400 text-sm">
                Making travel planning simple and enjoyable since 2025.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Destinations</a></li>
                <li><a href="#" className="hover:text-white">Trip Ideas</a></li>
                <li><a href="#" className="hover:text-white">Travel Guides</a></li>
                <li><a href="#" className="hover:text-white">Travel Tips</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400">
            <p>© 2025 Wanderlust. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;