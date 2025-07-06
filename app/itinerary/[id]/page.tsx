"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar, MapPin, DollarSign, Clock, Users, Plus, Trash2, Edit, X, Menu, Car, Utensils, Camera, Plane, Building, ShoppingBag, Trees, Star, Navigation, Link, ExternalLink, FileText, Import, Save, Hotel, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
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
    transportMode: 'driving',
    websiteUrl: '',
    photos: []
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; tripId: string; tripName: string }>({
    show: false,
    tripId: '',
    tripName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !tripId) return;
    
    const loadTrip = async () => {
      try {
        const response = await fetch(`/api/trips/${tripId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.error('Trip not found:', tripId);
            router.push('/dashboard');
            return;
          }
          throw new Error('Failed to fetch trip');
        }
        
        const result = await response.json();
        
        if (result.success) {
          const tripData = result.data;
          const trip = tripData.trip;
          const activities = tripData.activities || [];
          
          // Transform the trip data to match the expected format
          const transformedTrip = {
            id: trip.id,
            name: trip.name,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            daysCount: trip.daysCount,
            travelers: trip.travelers,
            status: trip.status,
            image: trip.image || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=300&fit=crop`,
            overview: trip.overview || '',
            createdAt: trip.createdAt,
            updatedAt: trip.updatedAt,
            tripDetails: {
              destination: trip.destination,
              days: trip.daysCount,
              people: trip.travelers,
              startDate: trip.startDate,
              endDate: trip.endDate
            },
            activities: activities,
            budget: {
              total: activities.reduce((sum: number, activity: any) => sum + (parseFloat(activity.cost) || 0), 0),
              currency: 'USD'
            },
            activitiesCount: activities.length,
            completedActivities: 0
          };
          
          setTrip(transformedTrip);
          setActivities(activities);
          setTripOverview(trip.overview || '');
          setTotalDays(trip.daysCount || 7);
          setTripName(trip.name || '');
          setTripImage(trip.image || '');
        } else {
          console.error('Failed to load trip:', result.error);
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error loading trip:', error);
        router.push('/dashboard');
        return;
      }
      
      setLoading(false);
    };
    
    loadTrip();
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

  const saveTrip = async () => {
    if (!trip || !mounted || isSaving) return;
    
    setIsSaving(true);
    try {
      console.log('Starting trip save...', { tripId: trip.id, activitiesCount: activities.length });
      
      // Update trip in database
      const tripUpdate = {
        name: tripName,
        overview: tripOverview,
        daysCount: totalDays,
        image: tripImage
      };
      
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripUpdate)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Trip update failed:', response.status, errorText);
        throw new Error(`Failed to update trip (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Trip update API error:', result.error);
        throw new Error(result.error || 'Failed to update trip');
      }
      
      console.log('Trip updated successfully');
      
      // Update activities in database
      const failedActivities = [];
      let savedActivitiesCount = 0;
      
      for (const activity of activities) {
        try {
          // Consider an activity new if it has no id, id is not a number, or id <= 0
          const isExistingDatabaseActivity = typeof activity.id === 'number' && activity.id > 0;
          
          if (isExistingDatabaseActivity) {
            // Update existing database activity
            console.log('Updating existing database activity:', activity.id, activity.title);
            const activityResponse = await fetch(`/api/activities/${activity.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(activity)
            });
            
            if (!activityResponse.ok) {
              const errorText = await activityResponse.text();
              console.error('Activity update failed:', activity.id, activityResponse.status, errorText);
              failedActivities.push(`${activity.title} (update failed: ${activityResponse.status})`);
              continue;
            }
            
            const activityResult = await activityResponse.json();
            if (!activityResult.success) {
              console.error('Activity update API error:', activity.id, activityResult.error);
              failedActivities.push(`${activity.title} (${activityResult.error})`);
              continue;
            }
            
            savedActivitiesCount++;
          } else {
            // Create new activity (no id or id <= 0)
            console.log('Creating new activity:', activity.title);
            const activityResponse = await fetch('/api/activities', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...activity,
                tripId: trip.id
              })
            });
            
            if (!activityResponse.ok) {
              const errorText = await activityResponse.text();
              console.error('Activity creation failed:', activity.title, activityResponse.status, errorText);
              failedActivities.push(`${activity.title} (creation failed: ${activityResponse.status})`);
              continue;
            }
            
            const activityResult = await activityResponse.json();
            if (!activityResult.success) {
              console.error('Activity creation API error:', activity.title, activityResult.error);
              failedActivities.push(`${activity.title} (${activityResult.error})`);
              continue;
            }
            
            // Update the activity with the new ID from database
            const newId = activityResult.data.id;
            setActivities(prev => prev.map(a => 
              a.title === activity.title && a.day === activity.day && a.id === activity.id
                ? { ...a, id: newId }
                : a
            ));
            
            savedActivitiesCount++;
          }
        } catch (error) {
          console.error('Activity save error:', activity.title, error);
          failedActivities.push(`${activity.title} (${error.message})`);
        }
      }
      
      // Update trip info (name, overview, days) in local state
      setTripName(tripName);
      setTripOverview(tripOverview);
      setTotalDays(totalDays);
      setTripImage(tripImage);
      
      // Provide user feedback
      if (failedActivities.length === 0) {
        console.log(`Trip and all ${savedActivitiesCount} activities saved successfully`);
        
        // Reload trip data to ensure consistency
        try {
          const reloadResponse = await fetch(`/api/trips/${trip.id}`);
          if (reloadResponse.ok) {
            const reloadResult = await reloadResponse.json();
            if (reloadResult.success) {
              const tripData = reloadResult.data;
              const freshActivities = tripData.activities || [];
              
              // Update local state with fresh data from database
              setActivities(freshActivities);
              
              // Update trip object
              setTrip(prev => ({
                ...prev,
                activities: freshActivities,
                activitiesCount: freshActivities.length,
                budget: {
                  ...prev.budget,
                  total: freshActivities.reduce((sum: number, activity: any) => sum + (parseFloat(activity.cost) || 0), 0)
                },
                updatedAt: new Date().toISOString()
              }));
              
              console.log('Trip data reloaded successfully');
            }
          }
        } catch (reloadError) {
          console.warn('Failed to reload trip data after save:', reloadError);
        }
        
        alert(`Trip saved successfully! ${savedActivitiesCount} activities updated.`);
        setHasUnsavedChanges(false); // Reset unsaved changes after successful save
      } else {
        console.warn(`Partial save: ${savedActivitiesCount} activities saved, ${failedActivities.length} failed`);
        alert(
          `Trip saved with some issues:\n` +
          `✓ ${savedActivitiesCount} activities saved successfully\n` +
          `✗ ${failedActivities.length} activities failed:\n` +
          failedActivities.slice(0, 3).join('\n') +
          (failedActivities.length > 3 ? `\n... and ${failedActivities.length - 3} more` : '') +
          `\n\nPlease try editing and saving the failed activities again.`
        );
        // Don't reset hasUnsavedChanges if there were failures
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          alert(`Network error: Unable to connect to server. Please check your internet connection and try again.`);
        } else if (error.message.includes('400')) {
          alert(`Invalid data: ${error.message}. Please check your inputs and try again.`);
        } else if (error.message.includes('401') || error.message.includes('403')) {
          alert(`Authentication error: Please refresh the page and try again.`);
        } else if (error.message.includes('500')) {
          alert(`Server error: ${error.message}. Please try again in a moment.`);
        } else {
          alert(`Save failed: ${error.message}. Please try again.`);
        }
      } else {
        alert('Failed to save trip changes. Please try again.');
      }
    } finally {
      setIsSaving(false);
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
    setHasUnsavedChanges(true);
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
      transportMode: 'driving',
      websiteUrl: '',
      photos: []
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
      transportMode: 'driving',
      websiteUrl: '',
      photos: []
    });
    
    setHasUnsavedChanges(true);
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
      transportMode: 'driving',
      websiteUrl: '',
      photos: []
    });
  };

  const handleDeleteActivity = (activityId: number) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
    setShowDeleteConfirm(null);
    setHasUnsavedChanges(true);
  };

  const handleMoveActivity = (activityId: number, direction: 'left' | 'right') => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const newDay = direction === 'left' ? activity.day - 1 : activity.day + 1;
    
    if (newDay < 1 || newDay > totalDays) return;

    setActivities(prev => prev.map(a => 
      a.id === activityId ? { ...a, day: newDay } : a
    ));
    
    setHasUnsavedChanges(true);
  };

  const handleAddDay = () => {
    const newDayCount = totalDays + 1;
    setTotalDays(newDayCount);
    setHasUnsavedChanges(true);
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
    
    setHasUnsavedChanges(true);
  };

  const handleEditOverview = () => {
    setEditingOverview(true);
    setTempOverview(tripOverview);
  };

  const handleSaveOverview = () => {
    setTripOverview(tempOverview);
    setEditingOverview(false);
    setHasUnsavedChanges(true);
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          setNewActivity(prev => ({
            ...prev,
            photos: [...prev.photos, {
              url: result as string,
              name: file.name,
              size: file.size
            }]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoRemove = (index: number) => {
    setNewActivity(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleActivityPhotoUpload = (activityId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          setActivities(prev => prev.map(activity => 
            activity.id === activityId 
              ? {
                  ...activity,
                  photos: [...(activity.photos || []), {
                    url: result as string,
                    name: file.name,
                    size: file.size
                  }]
                }
              : activity
          ));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleActivityPhotoRemove = (activityId: number, photoIndex: number) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? {
            ...activity,
            photos: (activity.photos || []).filter((_, i) => i !== photoIndex)
          }
        : activity
    ));
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
        // Navigate back to dashboard after successful deletion
        router.push('/dashboard');
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

  const showDeleteConfirmation = () => {
    if (trip) {
      setDeleteConfirmation({
        show: true,
        tripId: trip.id,
        tripName: trip.name
      });
    }
  };

  const hideDeleteConfirmation = () => {
    setDeleteConfirmation({
      show: false,
      tripId: '',
      tripName: ''
    });
  };

  const cleanupDuplicates = async () => {
    if (!trip || isCleaningDuplicates) return;
    
    setIsCleaningDuplicates(true);
    try {
      const response = await fetch(`/api/trips/${trip.id}/cleanup-duplicates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Cleanup complete!\n\n${result.message}\n\nThe page will reload to show the updated activities.`);
        
        // Reload the page to show fresh data
        window.location.reload();
      } else {
        alert(`❌ Cleanup failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      alert('❌ Failed to clean up duplicates. Please try again.');
    } finally {
      setIsCleaningDuplicates(false);
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
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg lg:hidden"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 lg:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Trip Details</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={showDeleteConfirmation}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete trip"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Manual Save Button */}
          <div className="p-6 border-b">
            <button
              onClick={saveTrip}
              disabled={isSaving || !hasUnsavedChanges}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors mb-3 ${
                isSaving 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : hasUnsavedChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {hasUnsavedChanges ? 'Save Changes' : 'All Changes Saved'}
                </>
              )}
            </button>
            
            {/* Cleanup Duplicates Button */}
            <button
              onClick={cleanupDuplicates}
              disabled={isCleaningDuplicates}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                isCleaningDuplicates 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isCleaningDuplicates ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-2" />
                  Remove Duplicates
                </>
              )}
            </button>
            
            {isSaving && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Saving your trip and activities to database...
              </p>
            )}
            
            {isCleaningDuplicates && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Detecting and removing duplicate activities...
              </p>
            )}
            
            {hasUnsavedChanges && !isSaving && (
              <p className="text-xs text-orange-600 mt-2 text-center font-medium">
                ⚠️ You have unsaved changes
              </p>
            )}
          </div>

          {/* Trip Info */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{trip?.name}</h2>
            <p className="text-gray-600 mb-3">{trip?.destination}</p>
            <div className="text-sm text-gray-500 space-y-1">
              <div>Duration: {totalDays} days</div>
              <div>Travelers: {trip?.travelers}</div>
              <div>Status: {trip?.status}</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 border-b">
            <div className="space-y-2">
              <button
                onClick={() => setViewMode('structured')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'structured'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">Daily Timeline</span>
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'original'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">Trip Overview</span>
              </button>
            </div>
          </div>

          {/* Day Navigation */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Days</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTotalDays(Math.max(1, totalDays - 1))}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTotalDays(totalDays + 1)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Day {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

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
                        
                        {/* Website URL field */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Link className="inline w-4 h-4 mr-1" />
                            Website URL
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={activity.websiteUrl || ''}
                              onChange={(e) => handleActivityEdit(activity.id, 'websiteUrl', e.target.value)}
                              placeholder="https://example.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            activity.websiteUrl && (
                              <a
                                href={activity.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-all"
                              >
                                {activity.websiteUrl}
                              </a>
                            )
                          )}
                        </div>
                        
                        {/* Photos field */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Camera className="inline w-4 h-4 mr-1" />
                            Photos
                          </label>
                          {isEditing ? (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleActivityPhotoUpload(activity.id, e)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                              />
                              {activity.photos && activity.photos.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {activity.photos.map((photo, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={photo.url}
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                      />
                                      <button
                                        onClick={() => handleActivityPhotoRemove(activity.id, index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            activity.photos && activity.photos.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {activity.photos.map((photo, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={photo.url}
                                      alt={`Photo ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                                      onClick={() => window.open(photo.url, '_blank')}
                                    />
                                  </div>
                                ))}
                              </div>
                            )
                          )}
                        </div>
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
                    
                    {/* URL Link Field */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Link className="inline w-4 h-4 mr-1" />
                        Website URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={newActivity.websiteUrl}
                        onChange={(e) => handleNewActivityChange('websiteUrl', e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Add a website link for more information about this activity.
                      </p>
                    </div>
                    
                    {/* Photo Upload Field */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Camera className="inline w-4 h-4 mr-1" />
                        Photos (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload photos related to this activity. Multiple files supported.
                      </p>
                      {newActivity.photos.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {newActivity.photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photo.url}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                onClick={() => handlePhotoRemove(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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

      {/* Activity Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-4">Delete Activity</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this activity? 
              This action cannot be undone and will permanently remove the activity from your itinerary.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm) {
                    handleDeleteActivity(showDeleteConfirm);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetailPage; 