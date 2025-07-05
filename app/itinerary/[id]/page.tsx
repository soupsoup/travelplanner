"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, DollarSign, Clock, Star, Users, Bookmark, Hotel, Utensils, Camera, Car, Plane, Link, Trash2, ArrowRight, ArrowLeft, MessageSquare, Sparkles, Image, Save, Navigation, Plus, FileText, Download, ChevronLeft } from 'lucide-react';
import { extractTimeAndDistance, isValidGoogleMapLink } from '../../../lib/mapUtils';
import { sortActivitiesByTime, estimateDistanceFromLocations, formatDuration, type LocationDistance } from '../../../lib/timeUtils';

const ItineraryDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [viewMode, setViewMode] = useState<'structured' | 'original'>('structured');
  const [editingActivity, setEditingActivity] = useState<number | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [tripOverview, setTripOverview] = useState<string>('');
  const [addingActivity, setAddingActivity] = useState<number | null>(null);
  const [editingOverview, setEditingOverview] = useState(false);
  const [tempOverview, setTempOverview] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [gettingAIAdvice, setGettingAIAdvice] = useState<number | null>(null);
  const [tripName, setTripName] = useState<string>('');
  const [tripImage, setTripImage] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [travelSegments, setTravelSegments] = useState<Record<string, LocationDistance>>({});
  const [totalDays, setTotalDays] = useState(7);
  const [showGoogleDocsImport, setShowGoogleDocsImport] = useState(false);
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [importingGoogleDoc, setImportingGoogleDoc] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    time: '',
    location: '',
    cost: 0,
    type: 'activity',
    priority: 'medium',
    tips: '',
    googleMapLink: '',
    extractedDistance: '',
    extractedTime: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !tripId) return;
    
    try {
      // Load the specific trip by ID from savedTrips
      const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      const foundTrip = savedTrips.find((t: any) => t.id === tripId);
      
      if (foundTrip) {
        setTrip(foundTrip);
        setActivities(foundTrip.activities || []);
        setTripOverview(foundTrip.overview || '');
        setTotalDays(foundTrip.daysCount || foundTrip.tripDetails?.days || 7);
        setTripName(foundTrip.name || '');
        setTripImage(foundTrip.image || '');
      } else {
        // Trip not found, redirect to dashboard
        console.error('Trip not found:', tripId);
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error loading trip:', error);
      router.push('/dashboard');
      return;
    }
    
    setLoading(false);
  }, [mounted, tripId, router]);

  const generateItineraryFromActivities = (activitiesList: any[]) => {
    let result = tripOverview ? `Trip Overview:\n${tripOverview}\n\n` : '';
    
    const dayGroups = activitiesList.reduce((groups, activity) => {
      const day = activity.day;
      if (!groups[day]) groups[day] = [];
      groups[day].push(activity);
      return groups;
    }, {} as Record<number, any[]>);

    Object.keys(dayGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(day => {
      result += `**Day ${day}**\n`;
      dayGroups[parseInt(day)].forEach(activity => {
        result += `- **${activity.title}** (${activity.time})\n`;
        result += `  ${activity.description}\n`;
        if (activity.tips) {
          result += `  Tip: ${activity.tips}\n`;
        }
        result += '\n';
      });
    });

    return result;
  };

  const saveTrip = () => {
    if (!trip || !mounted) return;
    
    try {
      // Update the trip in savedTrips
      const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      const updatedTrips = savedTrips.map((t: any) => 
        t.id === trip.id 
          ? {
              ...t,
              activities,
              overview: tripOverview,
              daysCount: totalDays,
              activitiesCount: activities.length,
              budget: {
                ...t.budget,
                total: activities.reduce((sum, activity) => sum + activity.cost, 0)
              },
              updatedAt: new Date().toISOString()
            }
          : t
      );
      
      localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
      
      // Update current trip state
      const updatedTrip = updatedTrips.find((t: any) => t.id === trip.id);
      setTrip(updatedTrip);
      
      alert('Trip updated successfully!');
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip changes.');
    }
  };

  const handleActivityEdit = (activityId: number, field: string, value: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, [field]: field === 'cost' ? parseInt(value) || 0 : value }
        : activity
    ));
  };

  const handleActivitySave = (activityId: number) => {
    setEditingActivity(null);
    saveTrip();
  };

  const handleAddActivity = (day: number) => {
    setAddingActivity(day);
    setNewActivity({
      title: '',
      description: '',
      time: getDefaultTime('activity'),
      location: trip?.destination || 'Destination',
      cost: 0,
      type: 'activity',
      priority: 'medium',
      tips: '',
      googleMapLink: '',
      extractedDistance: '',
      extractedTime: ''
    });
  };

  const handleNewActivityChange = (field: string, value: string | number) => {
    setNewActivity(prev => ({
      ...prev,
      [field]: field === 'cost' ? (typeof value === 'string' ? parseInt(value) || 0 : value) : value
    }));
  };

  const handleSaveNewActivity = () => {
    if (!mounted || !newActivity.title.trim()) return;
    
    const nextId = activities.length > 0 ? Math.max(...activities.map(a => a.id), 0) + 1 : 1000;
    const activityToAdd = {
      ...newActivity,
      id: nextId,
      day: addingActivity,
      cost: newActivity.cost || generateEstimatedCost(newActivity.type, nextId)
    };
    
    setActivities(prev => [...prev, activityToAdd]);
    setAddingActivity(null);
    setNewActivity({
      title: '',
      description: '',
      time: '',
      location: '',
      cost: 0,
      type: 'activity',
      priority: 'medium',
      tips: '',
      googleMapLink: '',
      extractedDistance: '',
      extractedTime: ''
    });
    
    // Auto-save
    setTimeout(() => saveTrip(), 100);
  };

  const handleCancelNewActivity = () => {
    setAddingActivity(null);
    setNewActivity({
      title: '',
      description: '',
      time: '',
      location: '',
      cost: 0,
      type: 'activity',
      priority: 'medium',
      tips: '',
      googleMapLink: '',
      extractedDistance: '',
      extractedTime: ''
    });
  };

  const handleDeleteActivity = (activityId: number) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
    setShowDeleteConfirm(null);
    setTimeout(() => saveTrip(), 100);
  };

  const handleMoveActivity = (activityId: number, direction: 'left' | 'right') => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const newDay = direction === 'left' ? activity.day - 1 : activity.day + 1;
    
    if (newDay < 1 || newDay > totalDays) return;

    setActivities(prev => prev.map(a => 
      a.id === activityId ? { ...a, day: newDay } : a
    ));
    
    setTimeout(() => saveTrip(), 100);
  };

  const handleAddDay = () => {
    const newDayCount = totalDays + 1;
    setTotalDays(newDayCount);
    setTimeout(() => saveTrip(), 100);
  };

  const handleRemoveDay = () => {
    if (totalDays <= 1) return;
    
    const newDayCount = totalDays - 1;
    
    // Move activities from the last day to the previous day
    const updatedActivities = activities.map(a => {
      if (a.day === totalDays) {
        return { ...a, day: newDayCount };
      }
      return a;
    });
    
    setActivities(updatedActivities);
    setTotalDays(newDayCount);
    
    if (selectedDay === totalDays) {
      setSelectedDay(newDayCount);
    }
    
    setTimeout(() => saveTrip(), 100);
  };

  const handleEditOverview = () => {
    setEditingOverview(true);
    setTempOverview(tripOverview);
  };

  const handleSaveOverview = () => {
    setTripOverview(tempOverview);
    setEditingOverview(false);
    setTimeout(() => saveTrip(), 100);
  };

  const handleCancelOverviewEdit = () => {
    setTempOverview('');
    setEditingOverview(false);
  };

  // Utility functions
  const getDefaultTime = (type: string) => {
    switch (type) {
      case 'accommodation': return '3:00 PM - 4:00 PM';
      case 'restaurant': return '7:00 PM - 9:00 PM';
      case 'activity': return '10:00 AM - 12:00 PM';
      case 'transport': return '8:00 AM - 9:00 AM';
      default: return '10:00 AM - 12:00 PM';
    }
  };

  const generateEstimatedCost = (type: string, activityId: number) => {
    const seed = activityId;
    const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
    
    switch (type) {
      case 'accommodation': return 0;
      case 'restaurant': return Math.floor(pseudoRandom * 60) + 20;
      case 'activity': return Math.floor(pseudoRandom * 40) + 15;
      case 'transport': return Math.floor(pseudoRandom * 30) + 10;
      default: return Math.floor(pseudoRandom * 25) + 10;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'accommodation': return Hotel;
      case 'restaurant': return Utensils;
      case 'activity': return Camera;
      case 'transport': return Car;
      default: return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accommodation': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'activity': return 'bg-purple-100 text-purple-800';
      case 'transport': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Don't render until mounted to prevent SSR issues
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Trip not found</h2>
          <p className="text-gray-600">The requested trip could not be found.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const days = Array.from({length: totalDays}, (_, i) => i + 1);
  const selectedDayActivities = mounted ? sortActivitiesByTime(
    activities.filter(activity => activity.day === selectedDay)
  ) : [];
  const totalCost = activities.reduce((sum, activity) => sum + activity.cost, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">TravelCraft</h1>
              <p className="text-sm text-gray-500">Premium Itinerary Builder</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h2>
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors w-full text-left"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <a href="/my-trips" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
              <Bookmark className="w-4 h-4" />
              <span>My Itineraries</span>
            </a>
            <a href="/ai-builder" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
              <Star className="w-4 h-4" />
              <span>Create Itinerary</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
                <p className="text-gray-600">{trip.destination}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Duration</span>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalDays} days</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Activities</span>
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Travelers</span>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{trip.travelers}</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Estimated Cost</span>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">${totalCost.toLocaleString()}</div>
            </div>
          </div>

          {/* About This Trip */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">About This Trip</h2>
              {!editingOverview && (
                <button
                  onClick={handleEditOverview}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                >
                  Edit
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {editingOverview ? (
                <div className="space-y-3">
                  <textarea
                    value={tempOverview}
                    onChange={(e) => setTempOverview(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    placeholder="Describe your trip overview..."
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveOverview}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelOverviewEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {tripOverview ? (
                    <p className="mb-4">{tripOverview}</p>
                  ) : (
                    <p className="mb-4">
                      {trip.travelers} travelers exploring {trip.destination} for {totalDays} days.
                    </p>
                  )}
                  <div className="text-sm text-gray-500 border-t pt-4">
                    <strong>Trip Details:</strong> {trip.travelers} travelers • {totalDays} days • Status: {trip.status} • Budget: ${trip.budget.total.toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Daily Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-semibold text-gray-900">Daily Timeline</h2>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                    <Clock className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Sorted chronologically</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={saveTrip}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  {days.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDay === day
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Day {day}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={handleAddDay}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Add day"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRemoveDay}
                    disabled={totalDays <= 1}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove day"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {selectedDayActivities.length > 0 ? (
                  selectedDayActivities.map((activity, index) => {
                    const isEditing = editingActivity === activity.id;
                    const Icon = getActivityIcon(activity.type);
                    
                    return (
                      <div key={activity.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={activity.title}
                                onChange={(e) => handleActivityEdit(activity.id, 'title', e.target.value)}
                                className="text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 flex-1 mr-2"
                              />
                            ) : (
                              <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleActivitySave(activity.id)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingActivity(null)}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Move buttons */}
                                {activity.day > 1 && (
                                  <button
                                    onClick={() => handleMoveActivity(activity.id, 'left')}
                                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title={`Move to Day ${activity.day - 1}`}
                                  >
                                    <ArrowLeft className="w-4 h-4" />
                                  </button>
                                )}
                                {activity.day < totalDays && (
                                  <button
                                    onClick={() => handleMoveActivity(activity.id, 'right')}
                                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title={`Move to Day ${activity.day + 1}`}
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => setEditingActivity(activity.id)}
                                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                                >
                                  Edit
                                </button>
                                
                                <button
                                  onClick={() => setShowDeleteConfirm(activity.id)}
                                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Delete activity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                              {activity.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                              {activity.priority}
                            </span>
                          </div>
                        </div>
                        
                        {isEditing ? (
                          <textarea
                            value={activity.description}
                            onChange={(e) => handleActivityEdit(activity.id, 'description', e.target.value)}
                            className="w-full text-gray-700 bg-white border border-gray-300 rounded px-3 py-2 mb-3 min-h-[60px]"
                            rows={3}
                          />
                        ) : (
                          <p className="text-gray-700 mb-3">{activity.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            {isEditing ? (
                              <input
                                type="text"
                                value={activity.time}
                                onChange={(e) => handleActivityEdit(activity.id, 'time', e.target.value)}
                                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-32"
                              />
                            ) : (
                              <span>{activity.time}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            {isEditing ? (
                              <input
                                type="text"
                                value={activity.location}
                                onChange={(e) => handleActivityEdit(activity.id, 'location', e.target.value)}
                                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-32"
                              />
                            ) : (
                              <span>{activity.location}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            {isEditing ? (
                              <input
                                type="number"
                                value={activity.cost}
                                onChange={(e) => handleActivityEdit(activity.id, 'cost', e.target.value)}
                                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-20"
                                min="0"
                              />
                            ) : (
                              <span>${activity.cost}</span>
                            )}
                          </div>
                        </div>
                        
                        {activity.tips && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Tips & Recommendations</span>
                            </div>
                            {isEditing ? (
                              <textarea
                                value={activity.tips}
                                onChange={(e) => handleActivityEdit(activity.id, 'tips', e.target.value)}
                                className="w-full text-blue-700 bg-white border border-blue-300 rounded px-3 py-2 text-sm min-h-[60px]"
                                rows={2}
                              />
                            ) : (
                              <p className="text-blue-700 text-sm">{activity.tips}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No activities planned for Day {selectedDay}</p>
                  </div>
                )}
                
                {/* Add Activity Section */}
                {addingActivity === selectedDay ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">Add New Activity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={newActivity.title}
                          onChange={(e) => handleNewActivityChange('title', e.target.value)}
                          placeholder="Activity title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={newActivity.type}
                          onChange={(e) => handleNewActivityChange('type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="activity">Activity</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="accommodation">Accommodation</option>
                          <option value="transport">Transport</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                          type="text"
                          value={newActivity.time}
                          onChange={(e) => handleNewActivityChange('time', e.target.value)}
                          placeholder="e.g., 9:00 AM - 12:00 PM"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                        <input
                          type="number"
                          value={newActivity.cost}
                          onChange={(e) => handleNewActivityChange('cost', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newActivity.description}
                          onChange={(e) => handleNewActivityChange('description', e.target.value)}
                          placeholder="Describe the activity..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={newActivity.location}
                          onChange={(e) => handleNewActivityChange('location', e.target.value)}
                          placeholder="Location name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-blue-200 mt-4">
                      <button
                        onClick={handleCancelNewActivity}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNewActivity}
                        disabled={!newActivity.title.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Activity
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      onClick={() => handleAddActivity(selectedDay)}
                      className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Activity to Day {selectedDay}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Activity</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this activity? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteActivity(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetailPage; 