"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Star, Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

interface SavedTrip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  travelers: number;
  budget: { total: number; currency: string };
  status: 'planning' | 'confirmed' | 'completed';
  image: string;
  activitiesCount: number;
  completedActivities: number;
  tripDetails: any;
  activities: any[];
  overview: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSavedTrips();
  }, []);

  const migrateTripActivities = (trip: any) => {
    // Check if activities is in old format (array of day objects)
    if (trip.activities && trip.activities.length > 0) {
      const firstActivity = trip.activities[0];
      // If first element has 'activities' property, it's the old format
      if (firstActivity && firstActivity.activities && Array.isArray(firstActivity.activities)) {
        console.log('Migrating trip from old format:', trip.name);
        
        // Flatten the old structure to new format
        const flatActivities: any[] = [];
        trip.activities.forEach((day: any, dayIndex: number) => {
          if (day.activities && Array.isArray(day.activities)) {
            day.activities.forEach((activity: any, activityIndex: number) => {
              flatActivities.push({
                id: flatActivities.length + 1,
                day: dayIndex + 1,
                title: activity.title || `Activity ${activityIndex + 1}`,
                type: activity.type || 'activity',
                time: activity.time || '10:00 AM - 12:00 PM',
                location: activity.location || trip.destination,
                cost: activity.cost || 0,
                description: activity.description || activity.title || `Activity ${activityIndex + 1}`,
                priority: 'medium',
                tips: activity.tips || ''
              });
            });
          }
        });
        
        // Update the trip with new structure
        return {
          ...trip,
          activities: flatActivities,
          activitiesCount: flatActivities.length,
          updatedAt: new Date().toISOString()
        };
      }
    }
    
    // Return unchanged if already in correct format
    return trip;
  };

  const loadSavedTrips = () => {
    const saved = localStorage.getItem('savedTrips');
    if (saved) {
      try {
        const trips = JSON.parse(saved);
        
        // Migrate any trips with old data structure
        const migratedTrips = trips.map(migrateTripActivities);
        
        // Check if any trips were migrated
        const wasMigrated = migratedTrips.some((trip: any, index: number) => 
          JSON.stringify(trip) !== JSON.stringify(trips[index])
        );
        
        if (wasMigrated) {
          console.log('Some trips were migrated to new format');
          // Save the migrated trips back to localStorage
          localStorage.setItem('savedTrips', JSON.stringify(migratedTrips));
        }
        
        setSavedTrips(migratedTrips);
      } catch (error) {
        console.error('Error loading saved trips:', error);
        setSavedTrips([]);
      }
    }
  };

  const filteredItineraries = savedTrips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || trip.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const uniqueCountries = new Set(savedTrips.map(trip => trip.destination.split(',').pop()?.trim())).size;
  const totalBudget = savedTrips.reduce((sum, trip) => sum + trip.budget.total, 0);
  const avgRating = savedTrips.length > 0 ? Math.round((savedTrips.reduce((sum, trip) => sum + trip.completedActivities, 0) / savedTrips.length) * 10) / 10 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-800">Luxe Travel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/ai-builder" className="btn-secondary">
                <Plus className="h-4 w-4 mr-2" />
                AI Builder
              </Link>
              <Link href="/itinerary/new" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Itinerary
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Journey <span className="text-yellow-300">Awaits</span>
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Craft extraordinary travel experiences with our sophisticated itinerary management platform
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search itineraries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-luxury pl-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-luxury"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-luxury p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-800 bg-opacity-10 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Itineraries</p>
                <p className="text-2xl font-bold text-blue-800">{savedTrips.length}</p>
              </div>
            </div>
          </div>
          <div className="card-luxury p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-600 bg-opacity-10 rounded-xl">
                <MapPin className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Countries Visited</p>
                <p className="text-2xl font-bold text-blue-800">{uniqueCountries}</p>
              </div>
            </div>
          </div>
          <div className="card-luxury p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 bg-opacity-10 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-blue-800">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card-luxury p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 bg-opacity-10 rounded-xl">
                <Star className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-800">{avgRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Itineraries Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-800">Your Itineraries</h2>
            <div className="text-sm text-gray-600">
              {filteredItineraries.length} of {savedTrips.length} itineraries
            </div>
          </div>

          {filteredItineraries.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-sm mx-auto">
                <div className="mb-4">
                  <Calendar className="h-12 w-12 text-gray-600 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No itineraries found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? "Try adjusting your search or filter criteria" 
                    : "Start planning your first adventure"}
                </p>
                <Link href="/ai-builder" className="btn-primary">
                  Create Your First Itinerary
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItineraries.map((itinerary) => (
                <Link key={itinerary.id} href={`/itinerary/${itinerary.id}`}>
                  <div className="card-luxury overflow-hidden hover:shadow-luxury-hover transition-all duration-300 cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={itinerary.image} 
                        alt={itinerary.destination}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(itinerary.status)}`}>
                          {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-blue-800 mb-2">{itinerary.name}</h3>
                      <p className="text-gray-600 mb-4">{itinerary.destination}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                          <span>{itinerary.daysCount} days</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-600 mr-2" />
                          <span>{itinerary.travelers} travelers</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-600 mr-2" />
                          <span>${itinerary.budget.total.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-gray-600 mr-2" />
                          <span>{itinerary.completedActivities}/{itinerary.activitiesCount} done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 