"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Plus, 
  Minus, 
  DollarSign, 
  Clock, 
  Users, 
  Save,
  Link as LinkIcon,
  Upload,
  X,
  Image as ImageIcon,
  Car,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Navigation
} from 'lucide-react';

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
  websiteUrl?: string;
  photos?: { url: string; name: string; size: number }[];
  // Transport-specific fields
  startLocation?: string;
  endLocation?: string;
  transportMode?: string;
  manualDistance?: number;
  manualTime?: number;
  googleMapLink?: string;
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
      title: '',
      description: '',
      location: '',
      time: '',
      cost: 0,
      type: 'activity',
      tips: '',
      websiteUrl: '',
      photos: [],
      startLocation: '',
      endLocation: '',
      transportMode: 'driving',
      manualDistance: 0,
      manualTime: 0,
      googleMapLink: ''
    };
    
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.push(newActivity);
    setItinerary(newItinerary);
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
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.splice(activityIndex, 1);
    setItinerary(newItinerary);
  };

  const handlePhotoUpload = (dayIndex: number, activityIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          const newItinerary = [...itinerary];
          if (!newItinerary[dayIndex].activities[activityIndex].photos) {
            newItinerary[dayIndex].activities[activityIndex].photos = [];
          }
          newItinerary[dayIndex].activities[activityIndex].photos!.push({
            url: result as string,
            name: file.name,
            size: file.size
          });
          setItinerary(newItinerary);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoRemove = (dayIndex: number, activityIndex: number, photoIndex: number) => {
    const newItinerary = [...itinerary];
    if (newItinerary[dayIndex].activities[activityIndex].photos) {
      newItinerary[dayIndex].activities[activityIndex].photos!.splice(photoIndex, 1);
      setItinerary(newItinerary);
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-blue-800 hover:text-blue-900 mr-4"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Home</span>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                                <select
                                  value={activity.type}
                                  onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'type', e.target.value)}
                                  className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                >
                                  <option value="activity">Activity</option>
                                  <option value="accommodation">Accommodation</option>
                                  <option value="food">Food & Dining</option>
                                  <option value="transport">Transport</option>
                                  <option value="shopping">Shopping</option>
                                  <option value="cultural">Cultural</option>
                                  <option value="nature">Nature</option>
                                  <option value="entertainment">Entertainment</option>
                                </select>
                              </div>
                              {activity.type === 'transport' ? (
                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Location</label>
                                    <input
                                      type="text"
                                      value={activity.startLocation || ''}
                                      onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'startLocation', e.target.value)}
                                      className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                      placeholder="Departure location"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Location</label>
                                    <input
                                      type="text"
                                      value={activity.endLocation || ''}
                                      onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'endLocation', e.target.value)}
                                      className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                      placeholder="Arrival location"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transport Mode</label>
                                    <select
                                      value={activity.transportMode || 'driving'}
                                      onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'transportMode', e.target.value)}
                                      className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                    >
                                      <option value="driving">Driving</option>
                                      <option value="walking">Walking</option>
                                      <option value="transit">Public Transit</option>
                                      <option value="cycling">Cycling</option>
                                      <option value="flight">Flight</option>
                                      <option value="train">Train</option>
                                    </select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Distance (miles)</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={activity.manualDistance || ''}
                                        onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'manualDistance', parseFloat(e.target.value) || 0)}
                                        className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                        placeholder="0.0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Time (minutes)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={activity.manualTime || ''}
                                        onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'manualTime', parseInt(e.target.value) || 0)}
                                        className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
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
                              )}
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
                          
                          {/* Enhanced Fields */}
                          <div className="mt-4 space-y-3">
                            {/* Website URL */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                <LinkIcon className="inline w-4 h-4 mr-1" />
                                Website URL
                              </label>
                              <input
                                type="url"
                                value={activity.websiteUrl || ''}
                                onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'websiteUrl', e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                placeholder="https://example.com"
                              />
                            </div>
                            
                            {/* Google Maps Link for Transport */}
                            {activity.type === 'transport' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <Navigation className="inline w-4 h-4 mr-1" />
                                  Google Maps Link (Optional)
                                </label>
                                <input
                                  type="url"
                                  value={activity.googleMapLink || ''}
                                  onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'googleMapLink', e.target.value)}
                                  className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                                  placeholder="https://maps.google.com/..."
                                />
                              </div>
                            )}
                            
                            {/* Tips */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tips & Notes</label>
                              <textarea
                                value={activity.tips}
                                onChange={(e) => updateActivity(currentDayIndex, activityIndex, 'tips', e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded px-3 py-2 resize-none"
                                rows={2}
                                placeholder="Any tips or notes for this activity..."
                              />
                            </div>
                            
                            {/* Photos */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Camera className="inline w-4 h-4 mr-1" />
                                Photos
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => handlePhotoUpload(currentDayIndex, activityIndex, e)}
                                  className="hidden"
                                  id={`photo-upload-${activity.id}`}
                                />
                                <label
                                  htmlFor={`photo-upload-${activity.id}`}
                                  className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Photos
                                </label>
                                {activity.photos && activity.photos.length > 0 && (
                                  <span className="text-sm text-gray-600">
                                    {activity.photos.length} photo{activity.photos.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              {activity.photos && activity.photos.length > 0 && (
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {activity.photos.map((photo, photoIndex) => (
                                    <div key={photoIndex} className="relative">
                                      <img
                                        src={photo.url}
                                        alt={photo.name}
                                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                      />
                                      <button
                                        onClick={() => handlePhotoRemove(currentDayIndex, activityIndex, photoIndex)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
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