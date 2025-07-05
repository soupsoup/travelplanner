"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, DollarSign, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BudgetCategory {
  accommodation: number;
  transportation: number;
  food: number;
  activities: number;
  shopping: number;
  miscellaneous: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  cost: number;
  type: string;
  tips: string;
}

interface DayItinerary {
  date: string;
  activities: Activity[];
}

const NewItinerary: React.FC = () => {
  const router = useRouter();
  const [tripDetails, setTripDetails] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: {
      total: 0,
      categories: {
        accommodation: 0,
        transportation: 0,
        food: 0,
        activities: 0,
        shopping: 0,
        miscellaneous: 0,
      } as BudgetCategory,
    },
  });

  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    generateDays();
  }, [tripDetails.startDate, tripDetails.endDate]);

  const generateDays = () => {
    if (!tripDetails.startDate || !tripDetails.endDate) return;

    const start = new Date(tripDetails.startDate);
    const end = new Date(tripDetails.endDate);
    const days: DayItinerary[] = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      days.push({
        date: date.toISOString().split('T')[0],
        activities: []
      });
    }

    setItinerary(days);
  };

  const handleInputChange = (field: string, value: any) => {
    setTripDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBudgetChange = (category: keyof BudgetCategory, value: number) => {
    setTripDetails(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        categories: {
          ...prev.budget.categories,
          [category]: value
        },
        total: Object.values({
          ...prev.budget.categories,
          [category]: value
        }).reduce((sum, val) => sum + val, 0)
      }
    }));
  };

  const addActivity = (dayIndex: number) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      title: 'New Activity',
      description: '',
      location: '',
      time: '10:00 AM',
      cost: 0,
      type: 'activity',
      tips: ''
    };

    setItinerary(prev => {
      const updated = [...prev];
      updated[dayIndex].activities.push(newActivity);
      return updated;
    });
  };

  const updateActivity = (dayIndex: number, activityIndex: number, field: string, value: any) => {
    setItinerary(prev => {
      const updated = [...prev];
      updated[dayIndex].activities[activityIndex] = {
        ...updated[dayIndex].activities[activityIndex],
        [field]: value
      };
      return updated;
    });
  };

  const deleteActivity = (dayIndex: number, activityIndex: number) => {
    setItinerary(prev => {
      const updated = [...prev];
      updated[dayIndex].activities.splice(activityIndex, 1);
      return updated;
    });
  };

  const saveItinerary = () => {
    // Flatten the itinerary structure to match the expected activities format
    const flatActivities: any[] = [];
    itinerary.forEach((day, dayIndex) => {
      day.activities.forEach((activity, activityIndex) => {
        flatActivities.push({
          id: flatActivities.length + 1,
          day: dayIndex + 1,
          title: (activity as any).title || `Activity ${activityIndex + 1}`,
          type: (activity as any).type || 'activity',
          time: (activity as any).time || '10:00 AM - 12:00 PM',
          location: (activity as any).location || tripDetails.destination,
          cost: (activity as any).cost || 0,
          description: (activity as any).description || (activity as any).title || `Activity ${activityIndex + 1}`,
          priority: 'medium',
          tips: (activity as any).tips || ''
        });
      });
    });

    const savedItinerary = {
      id: Date.now().toString(),
      name: tripDetails.name,
      destination: tripDetails.destination,
      startDate: tripDetails.startDate,
      endDate: tripDetails.endDate,
      travelers: tripDetails.travelers,
      budget: tripDetails.budget,
      status: 'planning',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      activitiesCount: flatActivities.length,
      completedActivities: 0,
      tripDetails: tripDetails,
      activities: flatActivities, // Use flattened activities structure
      overview: `A ${itinerary.length}-day trip to ${tripDetails.destination}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      daysCount: itinerary.length
    };

    // Save to localStorage
    const existingTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    existingTrips.push(savedItinerary);
    localStorage.setItem('savedTrips', JSON.stringify(existingTrips));

    // Redirect to dashboard
    router.push('/dashboard');
  };

  const currentDay = itinerary[currentDayIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-800 hover:text-blue-900 mr-4">
                <ChevronLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-xl font-bold text-blue-800">Create New Itinerary</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveItinerary}
                className="btn-primary"
                disabled={!tripDetails.name || !tripDetails.destination || !tripDetails.startDate || !tripDetails.endDate}
              >
                Save Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Details */}
          <div className="lg:col-span-1">
            <div className="card-luxury p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-800">Trip Details</h2>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
                  <input
                    type="text"
                    placeholder="My Amazing Trip"
                    value={tripDetails.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input-luxury w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <input
                    type="text"
                    placeholder="Paris, France"
                    value={tripDetails.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    className="input-luxury w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={tripDetails.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="input-luxury w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={tripDetails.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="input-luxury w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travelers</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tripDetails.travelers}
                    onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                    className="input-luxury w-full"
                  />
                </div>
              </div>
            </div>

            {/* Budget Planning */}
            <div className="card-luxury p-6">
              <h3 className="text-md font-semibold text-blue-800 mb-4">Budget Planning</h3>
              <div className="space-y-3">
                {Object.entries(tripDetails.budget.categories).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        value={amount}
                        onChange={(e) => handleBudgetChange(category as keyof BudgetCategory, parseInt(e.target.value) || 0)}
                        className="w-20 text-right text-sm border border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-800">Total Budget</span>
                  <span className="font-bold text-blue-800 text-lg">
                    ${tripDetails.budget.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Itinerary */}
          <div className="lg:col-span-2">
            {itinerary.length === 0 ? (
              <div className="card-luxury p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No days generated yet</h3>
                <p className="text-gray-600">
                  Please select your start and end dates to generate your itinerary days.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Day Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
                    disabled={currentDayIndex === 0}
                    className={`p-2 rounded-lg transition-colors ${
                      currentDayIndex === 0 
                        ? 'bg-blue-800 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex-1 mx-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {itinerary.map((day, index) => (
                        <button
                          key={day.date}
                          onClick={() => setCurrentDayIndex(index)}
                          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            currentDayIndex === index
                              ? 'bg-blue-800 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Day {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentDayIndex(Math.min(itinerary.length - 1, currentDayIndex + 1))}
                    disabled={currentDayIndex === itinerary.length - 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentDayIndex === itinerary.length - 1
                        ? 'bg-blue-800 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Current Day Content */}
                {currentDay && (
                  <div className="card-luxury p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-blue-800">
                        Day {currentDayIndex + 1} - {new Date(currentDay.date).toLocaleDateString()}
                      </h2>
                      <button
                        onClick={() => addActivity(currentDayIndex)}
                        className="btn-primary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </button>
                    </div>

                    <div className="space-y-4">
                      {currentDay.activities.map((activity, activityIndex) => (
                        <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                              <MapPin className="h-5 w-5 mr-2 text-gray-600" />
                              <input
                                type="text"
                                value={activity.title}
                                onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'title', e.target.value)}
                                className="bg-transparent border-none outline-none text-blue-800 font-semibold"
                                placeholder="Activity Title"
                              />
                            </h3>
                            <button
                              onClick={() => deleteActivity(currentDayIndex, activityIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                value={activity.description}
                                onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'description', e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded px-3 py-2 resize-none"
                                rows={3}
                                placeholder="What will you do here?"
                              />
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                  type="text"
                                  value={activity.location}
                                  onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'location', e.target.value)}
                                  className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                  placeholder="Address or landmark"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                  <input
                                    type="time"
                                    value={activity.time}
                                    onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'time', e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={activity.cost}
                                    onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'cost', parseInt(e.target.value) || 0)}
                                    className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {currentDay.activities.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-600">No activities planned for this day yet.</p>
                          <button
                            onClick={() => addActivity(currentDayIndex)}
                            className="btn-primary mt-4"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Activity
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewItinerary; 