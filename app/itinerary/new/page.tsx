"use client";
import React, { useState } from 'react';
import { Plus, X, Calendar, Activity, Hotel, Save, Link } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { extractTimeAndDistance, isValidGoogleMapLink } from '../../../lib/mapUtils';

interface ActivityForm {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  category: string;
  cost: number;
  notes: string;
  googleMapLink?: string;
  extractedDistance?: string;
  extractedTime?: string;
}

interface AccommodationForm {
  id: string;
  name: string;
  type: string;
  location: string;
  cost: number;
  notes: string;
}

interface DayForm {
  dayNumber: number;
  date: string;
  activities: ActivityForm[];
  accommodations: AccommodationForm[];
  notes: string;
}

const NewItinerary: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: {
      accommodation: 0,
      food: 0,
      activities: 0,
      transportation: 0,
      shopping: 0,
      miscellaneous: 0,
    },
    notes: '',
  });

  const [days, setDays] = useState<DayForm[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const generateDays = () => {
    if (!formData.startDate || !formData.endDate) return;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const newDays: DayForm[] = [];
    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      newDays.push({
        dayNumber: i + 1,
        date: currentDate.toISOString().split('T')[0],
        activities: [],
        accommodations: [],
        notes: '',
      });
    }
    
    setDays(newDays);
    setActiveDay(0);
  };

  const addActivity = (dayIndex: number) => {
    const newActivity: ActivityForm = {
      id: Date.now().toString(),
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      category: 'activity',
      cost: 0,
      notes: '',
    };

    const updatedDays = [...days];
    updatedDays[dayIndex].activities.push(newActivity);
    setDays(updatedDays);
  };

  const removeActivity = (dayIndex: number, activityId: string) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter(
      activity => activity.id !== activityId
    );
    setDays(updatedDays);
  };

  const updateActivity = (dayIndex: number, activityId: string, field: string, value: any) => {
    const updatedDays = [...days];
    const activityIndex = updatedDays[dayIndex].activities.findIndex(
      activity => activity.id === activityId
    );
    
    if (activityIndex !== -1) {
      updatedDays[dayIndex].activities[activityIndex] = {
        ...updatedDays[dayIndex].activities[activityIndex],
        [field]: value,
      };
      setDays(updatedDays);
    }
  };

  const updateActivityGoogleMapLink = (dayIndex: number, activityId: string, value: string) => {
    const updatedDays = [...days];
    const activityIndex = updatedDays[dayIndex].activities.findIndex(
      activity => activity.id === activityId
    );
    
    if (activityIndex !== -1) {
      updatedDays[dayIndex].activities[activityIndex] = {
        ...updatedDays[dayIndex].activities[activityIndex],
        googleMapLink: value,
      };
      
      // Extract time and distance if it's a valid Google Maps link
      if (value && isValidGoogleMapLink(value)) {
        const { distance, time } = extractTimeAndDistance(value);
        updatedDays[dayIndex].activities[activityIndex] = {
          ...updatedDays[dayIndex].activities[activityIndex],
          extractedDistance: distance,
          extractedTime: time,
        };
      } else {
        updatedDays[dayIndex].activities[activityIndex] = {
          ...updatedDays[dayIndex].activities[activityIndex],
          extractedDistance: '',
          extractedTime: '',
        };
      }
      
      setDays(updatedDays);
    }
  };

  const addAccommodation = (dayIndex: number) => {
    const newAccommodation: AccommodationForm = {
      id: Date.now().toString(),
      name: '',
      type: 'hotel',
      location: '',
      cost: 0,
      notes: '',
    };

    const updatedDays = [...days];
    updatedDays[dayIndex].accommodations.push(newAccommodation);
    setDays(updatedDays);
  };

  const removeAccommodation = (dayIndex: number, accommodationId: string) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].accommodations = updatedDays[dayIndex].accommodations.filter(
      accommodation => accommodation.id !== accommodationId
    );
    setDays(updatedDays);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('Saving itinerary:', { formData, days });
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving itinerary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalBudget = () => {
    return Object.values(formData.budget).reduce((total, amount) => total + amount, 0);
  };

  return (
    <div className="min-h-screen bg-gray-soft">
      {/* Header */}
      <div className="bg-white-crisp border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-luxury-primary">Create New Itinerary</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white-crisp mr-2"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Save Itinerary
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Trip Details */}
          <div className="lg:col-span-1">
            <div className="card-luxury p-6 space-y-6">
              <h2 className="text-lg font-semibold text-luxury-primary">Trip Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-dark mb-2">Trip Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-luxury w-full"
                  placeholder="My Amazing Trip"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-dark mb-2">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="input-luxury w-full"
                  placeholder="Paris, France"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-dark mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="input-luxury w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-dark mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="input-luxury w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-dark mb-2">Travelers</label>
                <input
                  type="number"
                  min="1"
                  value={formData.travelers}
                  onChange={(e) => setFormData({...formData, travelers: parseInt(e.target.value)})}
                  className="input-luxury w-full"
                />
              </div>

              <button
                onClick={generateDays}
                className="btn-secondary w-full"
                disabled={!formData.startDate || !formData.endDate}
              >
                Generate Days
              </button>

              {/* Budget Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-md font-semibold text-luxury-primary mb-4">Budget Planning</h3>
                
                <div className="space-y-3">
                  {Object.entries(formData.budget).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-dark capitalize">{category}</span>
                      <input
                        type="number"
                        min="0"
                        value={amount}
                        onChange={(e) => setFormData({
                          ...formData,
                          budget: {
                            ...formData.budget,
                            [category]: parseInt(e.target.value) || 0
                          }
                        })}
                        className="input-luxury w-20 text-sm"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-luxury-primary">Total Budget</span>
                    <span className="font-bold text-luxury-primary text-lg">
                      ${getTotalBudget().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Days */}
          <div className="lg:col-span-3">
            {days.length === 0 ? (
              <div className="card-luxury p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-medium mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-dark mb-2">No days generated yet</h3>
                <p className="text-gray-medium">
                  Set your travel dates and click "Generate Days" to start building your itinerary
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Day Navigation */}
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {days.map((day, index) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveDay(index)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeDay === index
                          ? 'bg-navy-deep text-white-crisp'
                          : 'bg-white-crisp text-gray-dark hover:bg-gray-100'
                      }`}
                    >
                      Day {day.dayNumber}
                      <span className="block text-xs opacity-75">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Day Content */}
                {days[activeDay] && (
                  <div className="card-luxury p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-luxury-primary">
                        Day {days[activeDay].dayNumber} - {new Date(days[activeDay].date).toLocaleDateString()}
                      </h2>
                    </div>

                    {/* Activities Section */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-luxury-primary flex items-center">
                          <Activity className="h-5 w-5 mr-2" />
                          Activities
                        </h3>
                        <button
                          onClick={() => addActivity(activeDay)}
                          className="btn-secondary text-sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Activity
                        </button>
                      </div>

                      <div className="space-y-4">
                        {days[activeDay].activities.map((activity) => (
                          <div key={activity.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input
                                    type="text"
                                    placeholder="Activity title"
                                    value={activity.title}
                                    onChange={(e) => updateActivity(activeDay, activity.id, 'title', e.target.value)}
                                    className="input-luxury"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Location"
                                    value={activity.location}
                                    onChange={(e) => updateActivity(activeDay, activity.id, 'location', e.target.value)}
                                    className="input-luxury"
                                  />
                                  <input
                                    type="time"
                                    value={activity.startTime}
                                    onChange={(e) => updateActivity(activeDay, activity.id, 'startTime', e.target.value)}
                                    className="input-luxury"
                                  />
                                  <input
                                    type="time"
                                    value={activity.endTime}
                                    onChange={(e) => updateActivity(activeDay, activity.id, 'endTime', e.target.value)}
                                    className="input-luxury"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <select
                                    value={activity.category}
                                    onChange={(e) => updateActivity(activeDay, activity.id, 'category', e.target.value)}
                                    className="input-luxury"
                                  >
                                    <option value="activity">Activity</option>
                                    <option value="restaurant">Restaurant</option>
                                    <option value="attraction">Attraction</option>
                                    <option value="shopping">Shopping</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="other">Transport</option>
                                  </select>
                                  <input
                                    type="number"
                                    placeholder="Cost ($)"
                                    value={activity.cost}
                                    onChange={(e) => updateActivity(activeDay, activity.id, 'cost', parseInt(e.target.value) || 0)}
                                    className="input-luxury"
                                    min="0"
                                  />
                                  <div></div>
                                </div>
                                
                                <textarea
                                  placeholder="Description"
                                  value={activity.description}
                                  onChange={(e) => updateActivity(activeDay, activity.id, 'description', e.target.value)}
                                  className="input-luxury"
                                  rows={2}
                                />
                                
                                <textarea
                                  placeholder="Notes"
                                  value={activity.notes}
                                  onChange={(e) => updateActivity(activeDay, activity.id, 'notes', e.target.value)}
                                  className="input-luxury"
                                  rows={2}
                                />
                                
                                {/* Google Map Link field for transport activities */}
                                {activity.category === 'other' && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      <Link className="inline w-4 h-4 mr-1" />
                                      Google Map Link
                                    </label>
                                    <input
                                      type="url"
                                      placeholder="Paste Google Maps link here to extract time and distance"
                                      value={activity.googleMapLink || ''}
                                      onChange={(e) => updateActivityGoogleMapLink(activeDay, activity.id, e.target.value)}
                                      className="input-luxury"
                                    />
                                    {activity.googleMapLink && (
                                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                        {activity.extractedDistance && activity.extractedDistance !== 'Not available' && (
                                          <div className="mb-1">
                                            <strong>Distance:</strong> {activity.extractedDistance}
                                          </div>
                                        )}
                                        {activity.extractedTime && activity.extractedTime !== 'Not available' && (
                                          <div>
                                            <strong>Time:</strong> {activity.extractedTime}
                                          </div>
                                        )}
                                        {(!activity.extractedDistance || activity.extractedDistance === 'Not available') && 
                                         (!activity.extractedTime || activity.extractedTime === 'Not available') && (
                                          <div className="text-gray-600">
                                            Unable to extract time and distance from this link
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => removeActivity(activeDay, activity.id)}
                                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Accommodations Section */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-luxury-primary flex items-center">
                          <Hotel className="h-5 w-5 mr-2" />
                          Accommodations
                        </h3>
                        <button
                          onClick={() => addAccommodation(activeDay)}
                          className="btn-secondary text-sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Accommodation
                        </button>
                      </div>

                      <div className="space-y-4">
                        {days[activeDay].accommodations.map((accommodation) => (
                          <div key={accommodation.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  placeholder="Accommodation name"
                                  value={accommodation.name}
                                  className="input-luxury"
                                />
                                <select
                                  value={accommodation.type}
                                  className="input-luxury"
                                >
                                  <option value="hotel">Hotel</option>
                                  <option value="airbnb">Airbnb</option>
                                  <option value="hostel">Hostel</option>
                                  <option value="resort">Resort</option>
                                </select>
                              </div>
                              <button
                                onClick={() => removeAccommodation(activeDay, accommodation.id)}
                                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
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