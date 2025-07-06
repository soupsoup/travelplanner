"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, DollarSign, Clock, Star, Users, Bookmark, Hotel, Utensils, Camera, Car, Plane, Link, Trash2, ArrowRight, ArrowLeft, MessageSquare, Sparkles, Image, Save, Navigation, Plus, FileText, Download, ChevronLeft, Menu, X } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    extractedTime: '',
    manualDistance: 0,
    manualTime: 0,
    startLocation: '',
    endLocation: '',
    transportMode: 'driving'
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
        ? { 
            ...activity, 
            [field]: field === 'cost' ? parseInt(value) || 0 : 
                    field === 'manualDistance' ? parseFloat(value) || 0 :
                    field === 'manualTime' ? parseInt(value) || 0 : value 
          }
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
      extractedTime: '',
      manualDistance: 0,
      manualTime: 0,
      startLocation: '',
      endLocation: '',
      transportMode: 'driving'
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
      extractedTime: '',
      manualDistance: 0,
      manualTime: 0,
      startLocation: '',
      endLocation: '',
      transportMode: 'driving'
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
      extractedTime: '',
      manualDistance: 0,
      manualTime: 0,
      startLocation: '',
      endLocation: '',
      transportMode: 'driving'
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Visible on Small Screens Only */}
      <div className="block lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-4 relative z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">TravelCraft</h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors bg-gray-50 border border-gray-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden lg:flex lg:static lg:inset-y-0 lg:left-0 lg:z-auto lg:w-64 lg:bg-white lg:shadow-sm lg:border-r lg:border-gray-200 lg:flex-col">
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
              <a 
                href="/" 
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Plane className="w-4 h-4" />
                <span>Home</span>
              </a>
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors w-full text-left"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <a 
                href="/my-trips" 
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>My Itineraries</span>
              </a>
              <a 
                href="/ai-builder" 
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>Create Itinerary</span>
              </a>
            </div>
          </nav>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">TravelCraft</h1>
                  <p className="text-sm text-gray-500">Premium Itinerary Builder</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h2>
              <a 
                href="/" 
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Plane className="w-4 h-4" />
                <span>Home</span>
              </a>
              <button 
                onClick={() => {
                  setSidebarOpen(false);
                  router.push('/dashboard');
                }}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors w-full text-left"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <a 
                href="/my-trips" 
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>My Itineraries</span>
              </a>
              <a 
                href="/ai-builder" 
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>Create Itinerary</span>
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto w-full">
          <div className="p-3 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{trip.name}</h1>
                <p className="text-gray-600">{trip.destination}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Duration</span>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalDays} days</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Activities</span>
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{activities.length}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Travelers</span>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{trip.travelers}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Estimated Cost</span>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">${totalCost.toLocaleString()}</div>
            </div>
          </div>

          {/* About This Trip */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">About This Trip</h2>
              {!editingOverview && (
                <button
                  onClick={handleEditOverview}
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors touch-target"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] touch-target"
                    placeholder="Describe your trip overview..."
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleSaveOverview}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-target"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelOverviewEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors touch-target"
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
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">Daily Timeline</h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Sorted chronologically</span>
                      </div>
                    </div>
                    <button
                      onClick={saveTrip}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-medium touch-target"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </button>
                  </div>
                </div>
                
                {/* Day Navigation - Mobile Optimized */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Select Day</h3>
                    <div className="overflow-x-auto">
                      <div className="flex space-x-3 pb-2 min-w-max">
                        {days.map(day => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 touch-target flex-shrink-0 ${
                              selectedDay === day
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                            }`}
                          >
                            Day {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Day Management Controls */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Day Management</h4>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={handleAddDay}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg touch-target"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Day</span>
                      </button>
                      {totalDays > 1 && (
                        <button
                          onClick={handleRemoveDay}
                          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg touch-target"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Remove Day</span>
                        </button>
                      )}
                    </div>
                  </div>
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
                          <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-2">
                            {/* Action buttons */}
                            <div className="flex items-center space-x-2 lg:order-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleActivitySave(activity.id)}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 touch-target"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingActivity(null)}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 touch-target"
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
                                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded touch-target"
                                      title={`Move to Day ${activity.day - 1}`}
                                    >
                                      <ArrowLeft className="w-4 h-4" />
                                    </button>
                                  )}
                                  {activity.day < totalDays && (
                                    <button
                                      onClick={() => handleMoveActivity(activity.id, 'right')}
                                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded touch-target"
                                      title={`Move to Day ${activity.day + 1}`}
                                    >
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => setEditingActivity(activity.id)}
                                    className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 touch-target"
                                  >
                                    Edit
                                  </button>
                                  
                                  <button
                                    onClick={() => setShowDeleteConfirm(activity.id)}
                                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded touch-target"
                                    title="Delete activity"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                            
                            {/* Tags - Mobile: Full width, Desktop: Flexible */}
                            <div className="flex flex-wrap gap-2 lg:order-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                                {activity.type}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                                {activity.priority}
                              </span>
                            </div>
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
                        
                        {/* Activity Details - Mobile: Stacked, Desktop: Horizontal */}
                        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-6 text-sm text-gray-500 mb-3">
                          {/* Time */}
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            {isEditing ? (
                              <input
                                type="text"
                                value={activity.time}
                                onChange={(e) => handleActivityEdit(activity.id, 'time', e.target.value)}
                                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs flex-1 sm:w-32 touch-target"
                              />
                            ) : (
                              <span className="font-medium">{activity.time}</span>
                            )}
                          </div>
                          
                          {/* Location - Different for Transport vs Other Activities */}
                          {activity.type === 'transport' ? (
                            <>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs font-medium">From:</span>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={activity.startLocation || ''}
                                    onChange={(e) => handleActivityEdit(activity.id, 'startLocation', e.target.value)}
                                    className="bg-white border border-gray-300 rounded px-2 py-1 text-xs flex-1 sm:w-32 touch-target"
                                    placeholder="Start location"
                                  />
                                ) : (
                                  <span className="text-gray-700">{activity.startLocation || 'Not set'}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Navigation className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs font-medium">To:</span>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={activity.endLocation || ''}
                                    onChange={(e) => handleActivityEdit(activity.id, 'endLocation', e.target.value)}
                                    className="bg-white border border-gray-300 rounded px-2 py-1 text-xs flex-1 sm:w-32 touch-target"
                                    placeholder="End location"
                                  />
                                ) : (
                                  <span className="text-gray-700">{activity.endLocation || 'Not set'}</span>
                                )}
                              </div>
                              {/* Transport Mode */}
                              <div className="flex items-center space-x-1">
                                <Car className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs font-medium">Mode:</span>
                                {isEditing ? (
                                  <select
                                    value={activity.transportMode || 'driving'}
                                    onChange={(e) => handleActivityEdit(activity.id, 'transportMode', e.target.value)}
                                    className="bg-white border border-gray-300 rounded px-2 py-1 text-xs touch-target"
                                  >
                                    <option value="driving">Driving</option>
                                    <option value="walking">Walking</option>
                                    <option value="transit">Transit</option>
                                    <option value="cycling">Cycling</option>
                                  </select>
                                ) : (
                                  <span className="text-gray-700 capitalize">{activity.transportMode || 'driving'}</span>
                                )}
                              </div>
                              {/* Manual Distance and Time Input for Transport */}
                              {isEditing && (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs font-medium">Distance (mi):</span>
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      value={activity.manualDistance || ''}
                                      onChange={(e) => handleActivityEdit(activity.id, 'manualDistance', e.target.value)}
                                      className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-20 touch-target"
                                      placeholder="0.0"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs font-medium">Time (min):</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={activity.manualTime || ''}
                                      onChange={(e) => handleActivityEdit(activity.id, 'manualTime', e.target.value)}
                                      className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-20 touch-target"
                                      placeholder="0"
                                    />
                                  </div>
                                </>
                              )}
                              {/* Display Distance and Time for Transport (when not editing) */}
                              {!isEditing && (activity.manualDistance > 0 || activity.manualTime > 0) && (
                                <div className="flex items-center space-x-1">
                                  <Navigation className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs font-medium">
                                    {activity.manualDistance > 0 && `${activity.manualDistance} mi`}
                                    {activity.manualDistance > 0 && activity.manualTime > 0 && ' • '}
                                    {activity.manualTime > 0 && `${activity.manualTime} min`}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={activity.location}
                                  onChange={(e) => handleActivityEdit(activity.id, 'location', e.target.value)}
                                  className="bg-white border border-gray-300 rounded px-2 py-1 text-xs flex-1 sm:w-32 touch-target"
                                />
                              ) : (
                                <span className="text-gray-700">{activity.location}</span>
                              )}
                            </div>
                          )}
                          
                          {/* Cost */}
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                            {isEditing ? (
                              <input
                                type="number"
                                value={activity.cost}
                                onChange={(e) => handleActivityEdit(activity.id, 'cost', e.target.value)}
                                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-20 touch-target"
                                min="0"
                              />
                            ) : (
                              <span className="font-medium text-green-600">${activity.cost}</span>
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
                      
                      {/* Transport-specific fields */}
                      {newActivity.type === 'transport' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Location</label>
                            <input
                              type="text"
                              value={newActivity.startLocation || ''}
                              onChange={(e) => handleNewActivityChange('startLocation', e.target.value)}
                              placeholder="Starting location"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Location</label>
                            <input
                              type="text"
                              value={newActivity.endLocation || ''}
                              onChange={(e) => handleNewActivityChange('endLocation', e.target.value)}
                              placeholder="Destination location"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transport Mode</label>
                            <select
                              value={newActivity.transportMode || 'driving'}
                              onChange={(e) => handleNewActivityChange('transportMode', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="driving">Driving</option>
                              <option value="walking">Walking</option>
                              <option value="transit">Public Transit</option>
                              <option value="cycling">Cycling</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (miles)</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={newActivity.manualDistance || ''}
                              onChange={(e) => handleNewActivityChange('manualDistance', parseFloat(e.target.value) || 0)}
                              placeholder="0.0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Time (minutes)</label>
                            <input
                              type="number"
                              min="0"
                              value={newActivity.manualTime || ''}
                              onChange={(e) => handleNewActivityChange('manualTime', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </>
                      )}
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
    </div>
  );
};

export default ItineraryDetailPage; 