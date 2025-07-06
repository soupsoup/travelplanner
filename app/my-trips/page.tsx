"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navigation/Navbar';
import Button from '@/app/components/ui/Button';
import { useRouter } from 'next/navigation';

const MyTripsPage = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const router = useRouter();

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

  useEffect(() => {
    const loadTrips = async () => {
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
            budget: { total: 0, currency: 'USD' }, // Default values
            status: trip.status,
            image: trip.image || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=300&fit=crop`,
            activitiesCount: 0, // Will be populated by activities
            completedActivities: 0,
            tripDetails: {
              destination: trip.destination,
              days: trip.daysCount,
              people: trip.travelers,
              startDate: trip.startDate,
              endDate: trip.endDate
            },
            activities: [],
            overview: trip.overview || '',
            createdAt: trip.createdAt,
            updatedAt: trip.updatedAt
          }));
          
          setTrips(transformedTrips);
        } else {
          console.error('Failed to load trips:', result.error);
          setTrips([]);
        }
      } catch (error) {
        console.error('Error loading trips:', error);
        setTrips([]);
      }
    };
    
    loadTrips();
  }, []);

  const handleView = (trip: any) => {
    // Navigate to the specific trip detail page
    router.push(`/itinerary/${trip.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-800">My Trips</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/ai-builder')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create New Trip
            </button>
          </div>
        </div>
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-4">You have no saved trips yet.</div>
            <div className="text-gray-500 mb-6">Generate an itinerary and save it to see your trips here!</div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/ai-builder')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Trip
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trips.map((trip, idx) => (
              <div key={trip.id || idx} className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-blue-700 mb-2">{trip.name}</h2>
                  <p className="text-gray-600 mb-2">{trip.destination}</p>
                  <div className="flex flex-wrap gap-4 text-gray-700 mb-2">
                    <span><strong>Travelers:</strong> {trip.travelers}</span>
                    <span><strong>Days:</strong> {trip.daysCount}</span>
                    <span><strong>Budget:</strong> ${trip.budget.total.toLocaleString()}</span>
                  </div>
                  <div className="text-gray-600 mb-4"><strong>Activities:</strong> {trip.activitiesCount}</div>
                </div>
                <Button onClick={() => handleView(trip)} className="w-full">View Itinerary</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTripsPage; 