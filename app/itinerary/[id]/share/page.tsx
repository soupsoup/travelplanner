"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, DollarSign, Clock, Users, Car, Utensils, Camera, Plane, Building, ShoppingBag, Trees, Star, Navigation, ExternalLink } from 'lucide-react';

const SharedItineraryPage = () => {
  const params = useParams();
  const tripId = params?.id as string;
  
  const [trip, setTrip] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    
    const loadSharedTrip = async () => {
      try {
        const response = await fetch(`/api/trips/${tripId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('This shared itinerary could not be found or may have been removed.');
          } else {
            setError('Failed to load the shared itinerary.');
          }
          return;
        }
        
        const result = await response.json();
        
        if (result.success) {
          const tripData = result.data;
          setTrip(tripData.trip);
          setActivities(tripData.activities || []);
        } else {
          setError('Failed to load the shared itinerary.');
        }
      } catch (error) {
        console.error('Error loading shared trip:', error);
        setError('Failed to load the shared itinerary.');
      } finally {
        setLoading(false);
      }
    };

    loadSharedTrip();
  }, [tripId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return Utensils;
      case 'hotel': return Building;
      case 'transport': return Car;
      case 'flight': return Plane;
      case 'activity': return Star;
      case 'sightseeing': return Camera;
      case 'shopping': return ShoppingBag;
      case 'nature': return Trees;
      case 'navigation': return Navigation;
      default: return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'restaurant': return 'bg-orange-100 text-orange-800';
      case 'hotel': return 'bg-blue-100 text-blue-800';
      case 'transport': return 'bg-green-100 text-green-800';
      case 'flight': return 'bg-purple-100 text-purple-800';
      case 'activity': return 'bg-yellow-100 text-yellow-800';
      case 'sightseeing': return 'bg-pink-100 text-pink-800';
      case 'shopping': return 'bg-indigo-100 text-indigo-800';
      case 'nature': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cost);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Itinerary Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            The link may be expired or the itinerary may have been removed by the owner.
          </p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const totalCost = activities.reduce((sum, activity) => sum + (parseFloat(activity.cost) || 0), 0);
  const days = Array.from({ length: trip.daysCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
            <p className="text-xl text-gray-600 mb-4">{trip.destination}</p>
            
            {/* Trip Stats */}
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{trip.daysCount} days</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{trip.travelers} travelers</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>{formatCost(totalCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        {trip.overview && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Overview</h2>
            <p className="text-gray-700 leading-relaxed">{trip.overview}</p>
          </div>
        )}

        {/* Daily Itinerary */}
        <div className="space-y-6">
          {days.map((day) => {
            const dayActivities = activities.filter(activity => activity.day === day);
            
            return (
              <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-900">Day {day}</h3>
                </div>
                
                <div className="p-6">
                  {dayActivities.length > 0 ? (
                    <div className="space-y-4">
                      {dayActivities.map((activity, index) => {
                        const IconComponent = getActivityIcon(activity.type);
                        
                        return (
                          <div key={activity.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                    {activity.title}
                                  </h4>
                                  {activity.description && (
                                    <p className="text-gray-600 mb-2">{activity.description}</p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    {activity.time && (
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{activity.time}</span>
                                      </div>
                                    )}
                                    {activity.location && (
                                      <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{activity.location}</span>
                                      </div>
                                    )}
                                    {activity.cost > 0 && (
                                      <div className="flex items-center space-x-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span>{formatCost(activity.cost)}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {activity.tips && (
                                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                      <p className="text-sm text-yellow-800">
                                        <span className="font-medium">Tip:</span> {activity.tips}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {activity.googleMapLink && (
                                <div className="mt-3">
                                  <a
                                    href={activity.googleMapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>View on Google Maps</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No activities planned for this day</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Created with TravelDash</h3>
            <p className="text-gray-600 mb-4">
              This itinerary was created using TravelDash, a travel planning app that helps create personalized trip itineraries.
            </p>
            <a
              href="https://traveldash.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Plan Your Own Trip</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedItineraryPage; 