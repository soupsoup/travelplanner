"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navigation/Navbar';
import Button from '@/app/components/ui/Button';

const ItineraryPage = () => {
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Read from localStorage (set by dashboard page)
    const itineraryData = localStorage.getItem('itinerary');
    const tripData = localStorage.getItem('tripDetails');
    setItinerary(itineraryData);
    setTripDetails(tripData ? JSON.parse(tripData) : null);
  }, []);

  const handleSave = () => {
    // Save to 'myTrips' in localStorage (mock persistent store)
    const myTrips = JSON.parse(localStorage.getItem('myTrips') || '[]');
    myTrips.push({ ...tripDetails, itinerary });
    localStorage.setItem('myTrips', JSON.stringify(myTrips));
    setSaved(true);
  };

  if (!itinerary || !tripDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Navbar />
        <div className="mt-32 text-center">
          <h2 className="text-2xl font-bold mb-4">No itinerary found</h2>
          <p className="text-gray-600">Please generate an itinerary first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">{tripDetails.destination} Itinerary</h1>
          <div className="flex flex-wrap gap-6 text-lg text-gray-700 mb-4">
            <span><strong>People:</strong> {tripDetails.people}</span>
            <span><strong>Days:</strong> {tripDetails.days}</span>
            <span><strong>Transport:</strong> {tripDetails.transport}</span>
            <span><strong>Budget:</strong> {tripDetails.budget}</span>
            <span><strong>Interests:</strong> {tripDetails.interests}</span>
          </div>
          <Button onClick={handleSave} disabled={saved} className="mt-2">
            {saved ? 'Saved!' : 'Save to My Trips'}
          </Button>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-lg p-8 w-full">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Your AI-Generated Itinerary</h2>
          <pre className="whitespace-pre-wrap text-base leading-relaxed text-gray-900">{itinerary}</pre>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage; 