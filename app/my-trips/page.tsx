"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navigation/Navbar';
import Button from '@/app/components/ui/Button';
import { useRouter } from 'next/navigation';

const MyTripsPage = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const myTrips = JSON.parse(localStorage.getItem('myTrips') || '[]');
    setTrips(myTrips);
  }, []);

  const handleView = (trip: any) => {
    // Save this trip as the current itinerary and redirect to /itinerary
    localStorage.setItem('itinerary', trip.itinerary);
    localStorage.setItem('tripDetails', JSON.stringify(trip));
    router.push('/itinerary');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">My Trips</h1>
        {trips.length === 0 ? (
          <div className="text-gray-600 text-lg">You have no saved trips yet. Go generate an itinerary and save it!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trips.map((trip, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-blue-700 mb-2">{trip.destination}</h2>
                  <div className="flex flex-wrap gap-4 text-gray-700 mb-2">
                    <span><strong>People:</strong> {trip.people}</span>
                    <span><strong>Days:</strong> {trip.days}</span>
                    <span><strong>Transport:</strong> {trip.transport}</span>
                  </div>
                  <div className="text-gray-600 mb-4"><strong>Interests:</strong> {trip.interests}</div>
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