"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Star, Search, Filter, Plus, Trash2 } from 'lucide-react';
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
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; tripId: string; tripName: string }>({
    show: false,
    tripId: '',
    tripName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

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

  const loadSavedTrips = async () => {
    try {
      const response = await fetch('/api/trips');
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Transform database trips to match the expected format
        const transformedTrips = result.data.map((trip: any) => ({
          id: trip.id,
          name: trip.name,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          daysCount: trip.daysCount,
          travelers: trip.travelers,
          budget: { total: 0, currency: 'USD' }, // Default values since we don't have budget in DB yet
          status: trip.status,
          image: trip.image || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=300&fit=crop`,
          activitiesCount: 0, // Will be populated by activities
          completedActivities: 0, // Will be calculated
          tripDetails: {
            destination: trip.destination,
            days: trip.daysCount,
            people: trip.travelers,
            startDate: trip.startDate,
            endDate: trip.endDate
          },
          activities: [], // Will be populated by activities
          overview: trip.overview || '',
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt
        }));
        
        setSavedTrips(transformedTrips);
      } else {
        console.error('Failed to load trips:', result.error);
        setSavedTrips([]);
      }
    } catch (error) {
      console.error('Error loading saved trips:', error);
      setSavedTrips([]);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove the deleted trip from the state
        setSavedTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
        setDeleteConfirmation({ show: false, tripId: '', tripName: '' });
      } else {
        throw new Error(result.error || 'Failed to delete trip');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const showDeleteConfirmation = (trip: SavedTrip) => {
    setDeleteConfirmation({
      show: true,
      tripId: trip.id,
      tripName: trip.name
    });
  };

  const hideDeleteConfirmation = () => {
    setDeleteConfirmation({
      show: false,
      tripId: '',
      tripName: ''
    });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-green-500 to-teal-500 rounded-full blur-3xl opacity-25 animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 backdrop-blur-sm bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              Your Journey <span className="text-yellow-300 drop-shadow-lg">Awaits</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
              Craft extraordinary travel experiences with our sophisticated itinerary management platform
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Action Buttons */}
        <div className="flex justify-center mb-12">
          <Link href="/ai-builder" className="group">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white px-8 py-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl shadow-lg">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold drop-shadow-md">Create New Itinerary</div>
                  <div className="text-sm text-white/80 drop-shadow-sm">AI-powered or manual planning</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
              <input
                type="text"
                placeholder="Search itineraries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-4 py-4">
                <Filter className="h-5 w-5 text-white/70" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="text-gray-900">All Status</option>
                  <option value="planning" className="text-gray-900">Planning</option>
                  <option value="confirmed" className="text-gray-900">Confirmed</option>
                  <option value="completed" className="text-gray-900">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-white/80 drop-shadow-sm">Total Itineraries</p>
                <p className="text-3xl font-bold text-white drop-shadow-md">{savedTrips.length}</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-white/80 drop-shadow-sm">Countries Visited</p>
                <p className="text-3xl font-bold text-white drop-shadow-md">{uniqueCountries}</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-white/80 drop-shadow-sm">Total Budget</p>
                <p className="text-3xl font-bold text-white drop-shadow-md">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-white/80 drop-shadow-sm">Completion Rate</p>
                <p className="text-3xl font-bold text-white drop-shadow-md">{avgRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Itineraries Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">Your Itineraries</h2>
            <div className="text-sm text-white/80 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-4 py-2">
              {filteredItineraries.length} of {savedTrips.length} itineraries
            </div>
          </div>

          {filteredItineraries.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-sm mx-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl shadow-lg w-fit mx-auto">
                    <Calendar className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 drop-shadow-md">No itineraries found</h3>
                <p className="text-white/80 mb-6 drop-shadow-sm">
                  {searchTerm || filterStatus !== 'all' 
                    ? "Try adjusting your search or filter criteria" 
                    : "Start planning your first adventure"}
                </p>
                <Link href="/ai-builder" className="inline-block backdrop-blur-xl bg-white/20 border border-white/30 hover:bg-white/30 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium">
                  Create Your First Itinerary
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItineraries.map((itinerary) => (
                <div key={itinerary.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group hover:scale-105 hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={itinerary.image} 
                      alt={itinerary.destination}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${getStatusColor(itinerary.status)} border border-white/30`}>
                        {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                      </span>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteConfirmation(itinerary);
                      }}
                      className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-6" onClick={() => window.location.href = `/itinerary/${itinerary.id}`}>
                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">{itinerary.name}</h3>
                    <p className="text-white/80 mb-4 drop-shadow-sm">{itinerary.destination}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-white/80">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{itinerary.daysCount} days</span>
                      </div>
                      <div className="flex items-center text-white/80">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{itinerary.travelers} travelers</span>
                      </div>
                      <div className="flex items-center text-white/80">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>${itinerary.budget.total.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-white/80">
                        <Star className="h-4 w-4 mr-2" />
                        <span>{itinerary.completedActivities}/{itinerary.activitiesCount} done</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-4">Delete Trip</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "<span className="font-medium">{deleteConfirmation.tripName}</span>"? 
              This action cannot be undone and will permanently remove all activities and data associated with this trip.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={hideDeleteConfirmation}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTrip(deleteConfirmation.tripId)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 