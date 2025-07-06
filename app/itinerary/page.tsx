"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, DollarSign, Clock, Star, Users, Bookmark, Hotel, Utensils, Camera, Car, Plane, Link, Trash2, ArrowRight, ArrowLeft, MessageSquare, Sparkles, Image, Save, Navigation, Plus, FileText, Download, Menu, X } from 'lucide-react';
import { extractTimeAndDistance, isValidGoogleMapLink, extractFromGoogleMapLink } from '../../lib/mapUtils';
import { sortActivitiesByTime, estimateDistanceFromLocations, formatDuration, type LocationDistance } from '../../lib/timeUtils';

const ItineraryPage = () => {
  const [mounted, setMounted] = useState(false);
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [saved, setSaved] = useState(false);
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
  const [totalDays, setTotalDays] = useState(7); // Dynamic days state
  const [showGoogleDocsImport, setShowGoogleDocsImport] = useState(false);
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [importingGoogleDoc, setImportingGoogleDoc] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    time: '',
    location: '',
    startLocation: '',
    endLocation: '',
    cost: 0,
    type: 'activity',
    priority: 'medium',
    tips: '',
    googleMapLink: '',
    extractedDistance: '',
    extractedTime: '',
    calculatedDistance: 0,
    calculatedTime: 0,
    transportMode: 'driving'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // DELAY to prevent hydration issues
    const timer = setTimeout(() => {
      try {
        // Read from localStorage (set by AI builder)
        const itineraryData = localStorage.getItem('itinerary');
        const tripData = localStorage.getItem('tripDetails');
        const parsedTripData = tripData ? JSON.parse(tripData) : null;
        
        setItinerary(itineraryData);
        setTripDetails(parsedTripData);
        
        // Initialize totalDays from tripDetails
        if (parsedTripData && parsedTripData.days) {
          setTotalDays(parsedTripData.days);
        } else {
          // Default to 7 days if no tripDetails
          setTotalDays(7);
        }
        
        if (itineraryData) {
          // TEMPORARILY SIMPLIFIED to prevent hydration issues
          setActivities(createSampleActivities());
          setTripOverview('Welcome to your travel itinerary! Start planning your amazing trip.');
          // const { activities: parsedActivities, overview } = parseItinerary(itineraryData);
          // setActivities(parsedActivities);
          // setTripOverview(overview);
        }
      } catch (error) {
        console.error('Error loading itinerary data:', error);
        // Set default values if localStorage fails
        setActivities(createSampleActivities());
        setTripOverview('Welcome to your travel itinerary! Start planning your amazing trip.');
        setTotalDays(7);
      }
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, [mounted]);

  const safeUpdateLocalStorage = (updatedItinerary: string) => {
    if (mounted) {
      try {
        localStorage.setItem('itinerary', updatedItinerary);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const handleSaveTrip = () => {
    if (!tripName.trim()) {
      alert('Please enter a trip name');
      return;
    }

    if (!mounted) {
      alert('Application not ready. Please try again.');
      return;
    }

    try {
      // Generate deterministic IDs to prevent hydration errors
      const tripId = `trip_${mounted ? Date.now() : 1}`;
      const currentDate = mounted ? new Date().toISOString() : new Date('2024-01-01').toISOString();
      
      const savedTrip = {
        id: tripId,
        name: tripName,
        destination: tripDetails?.destination || 'Unknown',
        startDate: currentDate,
        endDate: currentDate,
        daysCount: tripDetails?.days || 7,
        travelers: tripDetails?.people || 1,
        budget: { 
          total: activities.reduce((sum, activity) => sum + activity.cost, 0), 
          currency: 'USD' 
        },
        status: 'planning' as const,
        image: tripImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        activitiesCount: activities.length,
        completedActivities: 0,
        tripDetails: tripDetails,
        activities: activities,
        overview: tripOverview,
        createdAt: currentDate,
        updatedAt: currentDate
      };

      // Save to localStorage
      const existingTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      existingTrips.push(savedTrip);
      localStorage.setItem('savedTrips', JSON.stringify(existingTrips));

      // Also save current itinerary
      const updatedItinerary = generateItineraryFromActivities(activities);
      setItinerary(updatedItinerary);
      safeUpdateLocalStorage(updatedItinerary);

      setShowSaveModal(false);
      setTripName('');
      setTripImage('');
      alert('Trip saved successfully!');
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip. Please try again.');
    }
  };

  const handleActivityEdit = (activityId: number, field: string, value: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const updatedActivity = { 
          ...activity, 
          [field]: field === 'cost' ? parseInt(value) || 0 : value 
        };
        
        // Auto-calculate distance and time for transport activities when locations change
        if (activity.type === 'transport' && (field === 'startLocation' || field === 'endLocation')) {
          const startLoc = field === 'startLocation' ? value : activity.startLocation;
          const endLoc = field === 'endLocation' ? value : activity.endLocation;
          
          if (startLoc && endLoc) {
            const { distance, time } = calculateTransportDistance(
              startLoc, 
              endLoc, 
              activity.transportMode || 'driving'
            );
            updatedActivity.calculatedDistance = distance;
            updatedActivity.calculatedTime = time;
          }
        }
        
        return updatedActivity;
      }
      return activity;
    }));
  };

  const handleActivityGoogleMapLinkEdit = (activityId: number, value: string) => {
    // Extract time and distance if it's a valid Google Maps link
    if (value && isValidGoogleMapLink(value)) {
      const { distance, time } = extractTimeAndDistance(value);
      const extractedData = extractFromGoogleMapLink(value);
      
      setActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          const updated = { 
            ...activity, 
            googleMapLink: value, 
            extractedDistance: distance, 
            extractedTime: time 
          };
          
          // Auto-fill start and end locations if available and not already set
          if (activity.type === 'transport') {
            if (extractedData.from && !activity.startLocation) {
              updated.startLocation = extractedData.from;
            }
            if (extractedData.to && !activity.endLocation) {
              updated.endLocation = extractedData.to;
            }
            
            // Recalculate distance with new locations
            if (updated.startLocation && updated.endLocation) {
              const calc = calculateTransportDistance(
                updated.startLocation, 
                updated.endLocation, 
                activity.transportMode || 'driving'
              );
              updated.calculatedDistance = calc.distance;
              updated.calculatedTime = calc.time;
            }
          }
          
          return updated;
        }
        return activity;
      }));
    } else {
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { 
              ...activity, 
              googleMapLink: value, 
              extractedDistance: '', 
              extractedTime: '' 
            }
          : activity
      ));
    }
  };

  const handleActivitySave = (activityId: number) => {
    setEditingActivity(null);
    // Update localStorage with edited content
    const updatedItinerary = generateItineraryFromActivities(activities);
    setItinerary(updatedItinerary);
    safeUpdateLocalStorage(updatedItinerary);
  };

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

  const handleAddActivity = (day: number) => {
    setAddingActivity(day);
    setNewActivity({
      title: '',
      description: '',
      time: getDefaultTime('activity'),
      location: 'Destination', // Fixed to prevent hydration mismatch
      startLocation: '',
      endLocation: '',
      cost: 0,
      type: 'activity',
      priority: 'medium',
      tips: '',
      googleMapLink: '',
      extractedDistance: '',
      extractedTime: '',
      calculatedDistance: 0,
      calculatedTime: 0,
      transportMode: 'driving'
    });
  };

  const handleNewActivityChange = (field: string, value: string | number) => {
    setNewActivity(prev => ({
      ...prev,
      [field]: field === 'cost' ? (typeof value === 'string' ? parseInt(value) || 0 : value) : value
    }));
  };

  const handleGoogleMapLinkChange = (value: string) => {
    setNewActivity(prev => ({
      ...prev,
      googleMapLink: value
    }));
    
    // Extract time and distance if it's a valid Google Maps link
    if (value && isValidGoogleMapLink(value)) {
      const { distance, time } = extractTimeAndDistance(value);
      
      // Try to extract start and end locations from the Google Maps link
      const extractedData = extractFromGoogleMapLink(value);
      
      setNewActivity(prev => {
        const updated = { 
          ...prev, 
          extractedDistance: distance, 
          extractedTime: time 
        };
        
        // Auto-fill start and end locations if available and not already set
        if (extractedData.from && !prev.startLocation) {
          updated.startLocation = extractedData.from;
        }
        if (extractedData.to && !prev.endLocation) {
          updated.endLocation = extractedData.to;
        }
        
        // Recalculate distance with new locations
        if (updated.startLocation && updated.endLocation) {
          const calc = calculateTransportDistance(
            updated.startLocation, 
            updated.endLocation, 
            prev.transportMode
          );
          updated.calculatedDistance = calc.distance;
          updated.calculatedTime = calc.time;
        }
        
        return updated;
      });
    } else {
      setNewActivity(prev => ({
        ...prev,
        extractedDistance: '',
        extractedTime: ''
      }));
    }
  };

  const calculateTransportDistance = (startLocation: string, endLocation: string, mode: string = 'driving') => {
    if (!startLocation || !endLocation || startLocation === endLocation) {
      return { distance: 0, time: 0 };
    }
    
    // Use the existing distance estimation function
    const distanceInfo = estimateDistanceFromLocations(startLocation, endLocation);
    
    // Adjust time based on transport mode
    let timeMultiplier = 1;
    switch (mode) {
      case 'walking':
        timeMultiplier = 3; // Walking takes ~3x longer than driving
        break;
      case 'transit':
        timeMultiplier = 1.5; // Public transit takes ~1.5x longer
        break;
      case 'cycling':
        timeMultiplier = 2; // Cycling takes ~2x longer
        break;
      default: // driving
        timeMultiplier = 1;
    }
    
    return {
      distance: Math.round(distanceInfo.distance * 10) / 10, // Round to 1 decimal
      time: Math.round(distanceInfo.duration * timeMultiplier)
    };
  };

  const handleStartLocationChange = (value: string) => {
    setNewActivity(prev => ({ ...prev, startLocation: value }));
    
    // Auto-calculate distance and time for transport activities
    if (newActivity.type === 'transport' && value && newActivity.endLocation) {
      const { distance, time } = calculateTransportDistance(value, newActivity.endLocation, newActivity.transportMode);
      setNewActivity(prev => ({ 
        ...prev, 
        calculatedDistance: distance, 
        calculatedTime: time 
      }));
    }
  };

  const handleEndLocationChange = (value: string) => {
    setNewActivity(prev => ({ ...prev, endLocation: value }));
    
    // Auto-calculate distance and time for transport activities
    if (newActivity.type === 'transport' && newActivity.startLocation && value) {
      const { distance, time } = calculateTransportDistance(newActivity.startLocation, value, newActivity.transportMode);
      setNewActivity(prev => ({ 
        ...prev, 
        calculatedDistance: distance, 
        calculatedTime: time 
      }));
    }
  };

  const handleTransportModeChange = (mode: string) => {
    setNewActivity(prev => ({ ...prev, transportMode: mode }));
    
    // Recalculate distance and time with new mode
    if (newActivity.type === 'transport' && newActivity.startLocation && newActivity.endLocation) {
      const { distance, time } = calculateTransportDistance(newActivity.startLocation, newActivity.endLocation, mode);
      setNewActivity(prev => ({ 
        ...prev, 
        calculatedDistance: distance, 
        calculatedTime: time 
      }));
    }
  };

  const handleSaveNewActivity = () => {
    if (!mounted || !newActivity.title.trim()) return;
    
    // Generate deterministic ID to prevent hydration errors
    const nextId = activities.length > 0 ? Math.max(...activities.map(a => a.id), 0) + 1 : 1000;
    const activityToAdd = {
      ...newActivity,
      id: nextId,
      day: addingActivity,
      cost: newActivity.cost || generateEstimatedCost(newActivity.type, nextId)
    };
    
    setActivities(prev => [...prev, activityToAdd]);
    
    // Update localStorage
    const updatedActivities = [...activities, activityToAdd];
    const updatedItinerary = generateItineraryFromActivities(updatedActivities);
    setItinerary(updatedItinerary);
    safeUpdateLocalStorage(updatedItinerary);
    
    // Reset form
    setAddingActivity(null);
    setNewActivity({
      title: '',
      description: '',
      time: '',
      location: '',
      startLocation: '',
      endLocation: '',
      cost: 0,
      type: 'activity',
      priority: 'medium',
      tips: '',
      googleMapLink: '',
      extractedDistance: '',
      extractedTime: '',
      calculatedDistance: 0,
      calculatedTime: 0,
      transportMode: 'driving'
    });
  };

  const handleCancelNewActivity = () => {
    setAddingActivity(null);
    setNewActivity({
      title: '',
      description: '',
      time: '',
      location: '',
      startLocation: '',
      endLocation: '',
      cost: 0,
      type: 'activity',
      priority: 'medium',
      tips: '',
      googleMapLink: '',
      extractedDistance: '',
      extractedTime: '',
      calculatedDistance: 0,
      calculatedTime: 0,
      transportMode: 'driving'
    });
  };

  const handleDeleteActivity = (activityId: number) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
    setShowDeleteConfirm(null);
    
    // Update localStorage
    const updatedActivities = activities.filter(activity => activity.id !== activityId);
    const updatedItinerary = generateItineraryFromActivities(updatedActivities);
    setItinerary(updatedItinerary);
    safeUpdateLocalStorage(updatedItinerary);
  };

  const handleMoveActivity = (activityId: number, direction: 'left' | 'right') => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const newDay = direction === 'left' ? activity.day - 1 : activity.day + 1;
    
    if (newDay < 1 || newDay > totalDays) return;

    setActivities(prev => prev.map(a => 
      a.id === activityId ? { ...a, day: newDay } : a
    ));

    // Update localStorage
    const updatedActivities = activities.map(a => 
      a.id === activityId ? { ...a, day: newDay } : a
    );
    const updatedItinerary = generateItineraryFromActivities(updatedActivities);
    setItinerary(updatedItinerary);
    safeUpdateLocalStorage(updatedItinerary);
  };

  const handleAddDay = () => {
    const newDayCount = totalDays + 1;
    setTotalDays(newDayCount);
    
    // Update tripDetails to reflect the new day count
    if (tripDetails) {
      const updatedTripDetails = {
        ...tripDetails,
        days: newDayCount
      };
      setTripDetails(updatedTripDetails);
      
      // Update localStorage
      try {
        localStorage.setItem('tripDetails', JSON.stringify(updatedTripDetails));
      } catch (error) {
        console.error('Error updating tripDetails in localStorage:', error);
      }
    }
  };

  const handleRemoveDay = () => {
    if (totalDays <= 1) return; // Don't allow removing the last day
    
    const newDayCount = totalDays - 1;
    
    // Move activities from the last day to the previous day
    const activitiesOnLastDay = activities.filter(a => a.day === totalDays);
    const updatedActivities = activities.map(a => {
      if (a.day === totalDays) {
        return { ...a, day: newDayCount };
      }
      return a;
    });
    
    setActivities(updatedActivities);
    setTotalDays(newDayCount);
    
    // If selected day is the removed day, select the previous day
    if (selectedDay === totalDays) {
      setSelectedDay(newDayCount);
    }
    
    // Update tripDetails
    if (tripDetails) {
      const updatedTripDetails = {
        ...tripDetails,
        days: newDayCount
      };
      setTripDetails(updatedTripDetails);
      
      // Update localStorage
      try {
        localStorage.setItem('tripDetails', JSON.stringify(updatedTripDetails));
        const updatedItinerary = generateItineraryFromActivities(updatedActivities);
        setItinerary(updatedItinerary);
        safeUpdateLocalStorage(updatedItinerary);
      } catch (error) {
        console.error('Error updating data in localStorage:', error);
      }
    }
  };

  const handleGoogleDocsImport = () => {
    setShowGoogleDocsImport(true);
    setGoogleDocsUrl('');
  };

  const handleGoogleAuth = async () => {
    try {
      // Since we now use public export method, no authentication needed
      setGoogleAccessToken('public_access');
      return true;
    } catch (error) {
      console.error('Google setup failed:', error);
      alert('Failed to set up Google Docs access. Please try again.');
      return false;
    }
  };

  const extractDocumentId = (url: string): string | null => {
    // Handle demo case
    if (url.toLowerCase().trim() === 'demo') {
      return 'demo_document_id';
    }
    
    // Extract document ID from various Google Docs URL formats
    const patterns = [
      /\/document\/d\/([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const handleImportGoogleDoc = async () => {
    if (!googleDocsUrl.trim()) {
      alert('Please enter a Google Docs URL');
      return;
    }

    const documentId = extractDocumentId(googleDocsUrl);
    if (!documentId) {
      alert('Invalid Google Docs URL. Please make sure you copied the full URL.');
      return;
    }

    try {
      setImportingGoogleDoc(true);
      
      // Check if it's a demo request or real Google Docs URL
      const isDemo = googleDocsUrl.toLowerCase().trim() === 'demo' || documentId === 'demo_document_id';
      
      let response;
      if (isDemo) {
        // Use demo endpoint for demo requests
        response = await fetch('/api/google-docs-demo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId
          }),
        });
      } else {
        // Use real Google Docs API for actual URLs
        // First, get access token if not available
        if (!googleAccessToken) {
          const authSuccess = await handleGoogleAuth();
          if (!authSuccess) {
            setImportingGoogleDoc(false);
            return;
          }
        }

        response = await fetch('/api/google-docs-import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId,
            accessToken: googleAccessToken
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import document');
      }

      const result = await response.json();
      
      if (result.success && result.itinerary) {
        // Update the itinerary with imported data
        const importedActivities = result.itinerary.activities || [];
        const importedOverview = result.itinerary.overview || '';
        
        if (importedActivities.length > 0) {
          // Update activity IDs to prevent conflicts
          const maxExistingId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) : 0;
          const updatedImportedActivities = importedActivities.map((activity, index) => ({
            ...activity,
            id: maxExistingId + index + 1
          }));
          
          // Merge with existing activities or replace
          const shouldReplace = confirm(
            `Found ${importedActivities.length} activities in the Google Doc. ` +
            `Do you want to replace your current itinerary or add these activities to it?`
          );
          
          if (shouldReplace) {
            setActivities(updatedImportedActivities);
            setTripOverview(importedOverview);
            
            // Update totalDays based on imported activities
            const maxDay = Math.max(...updatedImportedActivities.map(a => a.day));
            setTotalDays(Math.max(maxDay, 1));
            
            // Update localStorage
            const updatedItinerary = generateItineraryFromActivities(updatedImportedActivities);
            setItinerary(updatedItinerary);
            safeUpdateLocalStorage(updatedItinerary);
          } else {
            // Add to existing activities
            const allActivities = [...activities, ...updatedImportedActivities];
            setActivities(allActivities);
            
            // Update totalDays if needed
            const maxDay = Math.max(...allActivities.map(a => a.day));
            setTotalDays(Math.max(maxDay, totalDays));
            
            // Update localStorage
            const updatedItinerary = generateItineraryFromActivities(allActivities);
            setItinerary(updatedItinerary);
            safeUpdateLocalStorage(updatedItinerary);
          }
          
          setShowGoogleDocsImport(false);
          setGoogleDocsUrl('');
          alert(`Successfully imported ${importedActivities.length} activities from Google Doc!`);
        } else {
          alert('No activities found in the Google Doc. Please check the document format.');
        }
      } else {
        throw new Error('Failed to parse the Google Doc');
      }
    } catch (error) {
      console.error('Error importing Google Doc:', error);
      alert(`Failed to import Google Doc: ${error.message}`);
    } finally {
      setImportingGoogleDoc(false);
    }
  };

  const handleCancelGoogleDocsImport = () => {
    setShowGoogleDocsImport(false);
    setGoogleDocsUrl('');
    setGoogleAccessToken(null);
  };

  const handleEditOverview = () => {
    setTempOverview(tripOverview);
    setEditingOverview(true);
  };

  const handleSaveOverview = () => {
    setTripOverview(tempOverview);
    setEditingOverview(false);
    
    // Update localStorage
    const updatedItinerary = generateItineraryFromActivities(activities);
    setItinerary(updatedItinerary);
    safeUpdateLocalStorage(updatedItinerary);
  };

  const handleCancelOverviewEdit = () => {
    setTempOverview('');
    setEditingOverview(false);
  };

  const handleGetAIAdvice = async (activityId: number) => {
    setGettingAIAdvice(activityId);
    
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      const response = await fetch('/api/activity-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity: activity,
          destination: tripDetails?.destination,
          travelStyle: tripDetails?.travelStyle,
          groupType: tripDetails?.groupType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the activity with AI advice
        setActivities(prev => prev.map(a => 
          a.id === activityId 
            ? { ...a, aiAdvice: data.advice, tips: activity.tips ? `${activity.tips}\n\nAI Recommendations:\n${data.advice}` : `AI Recommendations:\n${data.advice}` }
            : a
        ));

        // Update localStorage
        const updatedActivities = activities.map(a => 
          a.id === activityId 
            ? { ...a, aiAdvice: data.advice, tips: activity.tips ? `${activity.tips}\n\nAI Recommendations:\n${data.advice}` : `AI Recommendations:\n${data.advice}` }
            : a
        );
        const updatedItinerary = generateItineraryFromActivities(updatedActivities);
        setItinerary(updatedItinerary);
        safeUpdateLocalStorage(updatedItinerary);
      } else {
        alert('Failed to get AI advice. Please try again.');
      }
    } catch (error) {
      console.error('Error getting AI advice:', error);
      alert('Failed to get AI advice. Please try again.');
    } finally {
      setGettingAIAdvice(null);
    }
  };

  // Parse itinerary into structured data
  const parseItinerary = (text: string) => {
    if (!text) return { activities: [], overview: '' };
    
    const activities = [];
    let activityId = 1;
    let overview = '';
    
    // Extract trip overview first
    const overviewMatch = text.match(/trip overview[:\n](.+?)(?=day \d+|$)/i);
    if (overviewMatch) {
      overview = overviewMatch[1].trim();
    }
    
    // Split by days
    const dayMatches = text.split(/(?=Day \d+|\*\*Day \d+)/i);
    
    dayMatches.forEach((daySection, dayIndex) => {
      if (!daySection.trim()) return;
      
      const dayNumber = dayIndex + 1;
      const lines = daySection.split('\n').filter(line => line.trim());
      
      let currentActivity = null;
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        
        // Skip day headers and trip overview
        if (/^(\*\*)?Day \d+/i.test(trimmedLine) || 
            /trip overview/i.test(trimmedLine)) return;
        
        // Check for time patterns (morning, afternoon, evening, or specific times)
        const timePattern = /(morning|afternoon|evening|\d{1,2}:\d{2}|\d{1,2}\s?(am|pm))/i;
        const timeMatch = trimmedLine.match(timePattern);
        
        // Check for activity patterns
        if (trimmedLine.includes('**') || trimmedLine.includes('*') || timeMatch) {
          // If we have a current activity, save it
          if (currentActivity) {
            activities.push(currentActivity);
            activityId++;
          }
          
          // Start new activity
          const title = trimmedLine.replace(/\*\*/g, '').replace(/^\*\s?/, '').replace(/^-\s?/, '').trim();
          const cleanTitle = title.split(':')[0].split('-')[0].trim();
          
          // Skip if this looks like trip overview
          if (cleanTitle.toLowerCase().includes('trip overview')) return;
          
          const type = determineActivityType(cleanTitle, trimmedLine);
          const estimatedCost = extractCost(trimmedLine) || generateEstimatedCost(type, activityId);
          
          currentActivity = {
            id: activityId,
            day: dayNumber,
            title: cleanTitle,
            type: type,
            time: timeMatch ? formatTime(timeMatch[0]) : getDefaultTime(type),
            location: 'Destination', // Fixed to prevent hydration mismatch
            cost: estimatedCost,
            description: title,
            priority: determinePriority(type, trimmedLine),
            tips: ''
          };
        } else if (currentActivity && trimmedLine.length > 20) {
          // Add to description or tips
          if (trimmedLine.toLowerCase().includes('tip') || trimmedLine.toLowerCase().includes('recommend')) {
            currentActivity.tips = trimmedLine;
          } else {
            currentActivity.description += '. ' + trimmedLine;
          }
        }
      });
      
      // Don't forget the last activity
      if (currentActivity) {
        activities.push(currentActivity);
        activityId++;
      }
    });
    
    // If no activities were parsed, create sample activities
    if (activities.length === 0) {
      return { activities: createSampleActivities(), overview };
    }
    
    return { activities, overview };
  };
  
  const determineActivityType = (title: string, fullLine: string) => {
    const titleLower = title.toLowerCase();
    const fullLineLower = fullLine.toLowerCase();
    
    if (titleLower.includes('hotel') || titleLower.includes('check') || titleLower.includes('accommodation')) {
      return 'accommodation';
    }
    if (titleLower.includes('dinner') || titleLower.includes('lunch') || titleLower.includes('breakfast') || 
        titleLower.includes('restaurant') || titleLower.includes('food') || titleLower.includes('eat')) {
      return 'restaurant';
    }
    if (titleLower.includes('flight') || titleLower.includes('transport') || titleLower.includes('travel') || 
        titleLower.includes('airport') || titleLower.includes('train')) {
      return 'transport';
    }
    return 'activity';
  };
  
  const extractCost = (text: string) => {
    const costMatch = text.match(/\$(\d+)/);
    return costMatch ? parseInt(costMatch[1]) : 0;
  };
  
  const generateEstimatedCost = (type: string, activityId?: number) => {
    // Use deterministic pseudo-random based on activity ID to prevent hydration errors
    const seed = activityId || 1;
    const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
    
    switch (type) {
      case 'accommodation': return 0; // Usually pre-paid
      case 'restaurant': return Math.floor(pseudoRandom * 60) + 20; // $20-80
      case 'activity': return Math.floor(pseudoRandom * 40) + 15; // $15-55
      case 'transport': return Math.floor(pseudoRandom * 30) + 10; // $10-40
      default: return Math.floor(pseudoRandom * 25) + 10; // $10-35
    }
  };
  
  const formatTime = (timeStr: string) => {
    const timeLower = timeStr.toLowerCase();
    if (timeLower === 'morning') return '9:00 AM - 12:00 PM';
    if (timeLower === 'afternoon') return '1:00 PM - 5:00 PM';
    if (timeLower === 'evening') return '6:00 PM - 9:00 PM';
    return timeStr;
  };
  
  const getDefaultTime = (type: string) => {
    switch (type) {
      case 'accommodation': return '3:00 PM - 4:00 PM';
      case 'restaurant': return '7:00 PM - 9:00 PM';
      case 'activity': return '10:00 AM - 12:00 PM';
      case 'transport': return '8:00 AM - 9:00 AM';
      default: return '10:00 AM - 12:00 PM';
    }
  };
  
  const determinePriority = (type: string, text: string) => {
    if (type === 'accommodation' || text.toLowerCase().includes('must') || text.toLowerCase().includes('essential')) {
      return 'high';
    }
    if (text.toLowerCase().includes('optional') || text.toLowerCase().includes('if time')) {
      return 'low';
    }
    return 'medium';
  };
  
  const createSampleActivities = () => [
    {
      id: 1,
      day: 1,
      title: "Arrival and Hotel Check-in",
      type: "accommodation",
      time: "3:00 PM - 4:00 PM",
      location: 'Destination', // Fixed to prevent hydration mismatch
      cost: 0,
      description: "Check into your chosen hotel in the city center. Consider options with convenient access to attractions.",
      priority: "high",
      tips: "Confirm if your hotel offers shuttle services to major attractions to save on transportation costs."
    },
    {
      id: 2,
      day: 1,
      title: "Welcome Dinner",
      type: "restaurant",
      time: "7:00 PM - 9:00 PM",
      location: 'Destination', // Fixed to prevent hydration mismatch
      cost: generateEstimatedCost('restaurant', 2),
      description: "Enjoy a traditional local dining experience to kick off your adventure.",
      priority: "medium",
      tips: "Reservations recommended; check for availability and book in advance."
    }
  ];

  // Prevent all hydration issues by completely disabling SSR for this page
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (!itinerary || !tripDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">No itinerary found</h2>
          <p className="text-gray-600">Please generate an itinerary first.</p>
          <a href="/ai-builder" className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Create New Itinerary
          </a>
        </div>
      </div>
    );
  }

  const days = Array.from({length: totalDays}, (_, i) => i + 1); // Dynamic days based on trip length
  const selectedDayActivities = mounted ? sortActivitiesByTime(
    activities.filter(activity => activity.day === selectedDay)
  ) : [];

  // TEMPORARILY DISABLED: Calculate travel segments between consecutive activities
  // useEffect(() => {
  //   const calculateTravelSegments = async () => {
  //     const newSegments: Record<string, LocationDistance> = {};
      
  //     for (let day = 1; day <= 7; day++) { // Fixed to prevent hydration mismatch
  //       const dayActivities = sortActivitiesByTime(
  //         activities.filter(activity => activity.day === day)
  //       );
        
  //       for (let i = 0; i < dayActivities.length - 1; i++) {
  //         const fromActivity = dayActivities[i];
  //         const toActivity = dayActivities[i + 1];
  //         const segmentKey = `${fromActivity.id}-${toActivity.id}`;
          
  //         // Only calculate if locations are different
  //         if (fromActivity.location !== toActivity.location) {
  //           const distance = estimateDistanceFromLocations(
  //             fromActivity.location,
  //             toActivity.location
  //           );
  //           newSegments[segmentKey] = distance;
  //         }
  //       }
  //     }
      
  //     setTravelSegments(newSegments);
  //   };

  //   if (activities.length > 0) {
  //     calculateTravelSegments();
  //   }
  // }, [activities, mounted]); // Fixed to prevent hydration mismatch

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

  const totalCost = mounted ? activities.reduce((sum, activity) => sum + activity.cost, 0) : 0;

  const renderTravelSegment = (currentActivity: any, nextActivity: any) => {
    const segmentKey = `${currentActivity.id}-${nextActivity.id}`;
    const travelInfo = travelSegments[segmentKey];
    
    if (!travelInfo || currentActivity.location === nextActivity.location) {
      return null;
    }

    return (
      <div key={`travel-${segmentKey}`} className="flex items-center justify-center py-4">
        <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Navigation className="w-4 h-4 text-blue-600" />
          <div className="text-sm">
            <span className="font-medium text-blue-800">
              {travelInfo.distance} mi
            </span>
            <span className="text-blue-600 mx-2">•</span>
            <span className="text-blue-700">
              {formatDuration(travelInfo.duration)}
            </span>
            <span className="text-blue-600 mx-2">•</span>
            <span className="text-blue-600 capitalize">
              {travelInfo.mode}
            </span>
          </div>
          <div className="text-xs text-blue-600">
            to {nextActivity.location}
          </div>
        </div>
      </div>
    );
  };

  const formatAIAdvice = (tips: string) => {
    if (!tips.includes('AI Recommendations:')) {
      return null;
    }

    const sections = tips.split('AI Recommendations:');
    const originalTips = sections[0]?.trim();
    const aiAdvice = sections[1]?.trim();

    if (!aiAdvice) return null;

    // Parse AI advice into structured sections
    const parseAIAdvice = (text: string) => {
      const sections = [];
      
      // Split by numbered points or bullet points
      const lines = text.split(/\n+/).filter(line => line.trim());
      let currentSection = null;
      let currentContent = [];

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Check if this is a section header (contains ** or numbered points)
        if (trimmed.includes('**') || /^\d+\./.test(trimmed) || trimmed.startsWith('•')) {
          // Save previous section if it exists
          if (currentSection) {
            sections.push({
              title: currentSection,
              content: currentContent.join(' ').trim()
            });
          }
          
          // Start new section
          currentSection = trimmed.replace(/\*\*/g, '').replace(/^\d+\.\s*/, '').replace(/^•\s*/, '');
          currentContent = [];
        } else if (currentSection) {
          // Add to current section content
          currentContent.push(trimmed);
        } else {
          // If no section started yet, treat as general advice
          if (!currentSection) {
            currentSection = "General Recommendations";
            currentContent = [trimmed];
          } else {
            currentContent.push(trimmed);
          }
        }
      }

      // Don't forget the last section
      if (currentSection) {
        sections.push({
          title: currentSection,
          content: currentContent.join(' ').trim()
        });
      }

      return sections;
    };

    const aiSections = parseAIAdvice(aiAdvice);

    return {
      originalTips,
      aiSections
    };
  };

  const renderFormattedTips = (activity: any, isEditing: boolean) => {
    const formattedAdvice = formatAIAdvice(activity.tips || '');
    
    if (!formattedAdvice) {
      // Regular tips display
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          {isEditing ? (
            <textarea
              value={activity.tips}
              onChange={(e) => handleActivityEdit(activity.id, 'tips', e.target.value)}
              placeholder="Add tips or recommendations..."
              className="w-full text-sm text-blue-800 bg-transparent border-none resize-none focus:outline-none"
              rows={2}
            />
          ) : (
            <p className="text-sm text-blue-800">{activity.tips}</p>
          )}
        </div>
      );
    }

    // Enhanced AI advice display
    return (
      <div className="space-y-4">
        {/* Original Tips (if any) */}
        {formattedAdvice.originalTips && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Tips</span>
            </div>
            <p className="text-sm text-blue-800">{formattedAdvice.originalTips}</p>
          </div>
        )}

        {/* AI Advice Sections */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">AI Recommendations</span>
          </div>
          
          <div className="space-y-3">
            {formattedAdvice.aiSections.map((section, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-purple-900 mb-1">
                      {section.title}
                    </h4>
                    <p className="text-sm text-purple-800 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Don't render until mounted to prevent SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Duration</span>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{mounted ? `${totalDays} days` : '7 days'}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Activities</span>
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{mounted ? activities.length : 0}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Budget</span>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{mounted && tripDetails ? tripDetails.budget : 'Loading...'}</div>
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
            <div className="text-gray-700 leading-relaxed">
              {editingOverview ? (
                <div className="space-y-4">
                  <textarea
                    value={tempOverview}
                    onChange={(e) => setTempOverview(e.target.value)}
                    placeholder="Describe your trip overview..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical touch-target"
                    rows={4}
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleSaveOverview}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors touch-target"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelOverviewEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors touch-target"
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
                      {mounted && tripDetails ? (
                        <>
                          {tripDetails.people} travelers exploring {tripDetails.destination} for {totalDays} days. 
                          Travel style: {tripDetails.travelStyle}, Group: {tripDetails.groupType}, Activity level: {tripDetails.activityLevel}.
                          Interests: {tripDetails.interests}. Budget: {tripDetails.budget}.
                        </>
                      ) : (
                        'Loading trip details...'
                      )}
                    </p>
                  )}
                  <div className="text-sm text-gray-500 border-t pt-4">
                    <strong>Trip Details:</strong> {mounted && tripDetails ? (
                      `${tripDetails.people} travelers • ${totalDays} days • ${tripDetails.travelStyle} style • ${tripDetails.groupType} group • ${tripDetails.activityLevel} activity level • Budget: ${tripDetails.budget}`
                    ) : (
                      'Loading...'
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Daily Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold text-gray-900">Daily Timeline</h2>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                      <Clock className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700">Sorted chronologically</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('structured')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-target ${
                        viewMode === 'structured'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Structured
                    </button>
                    <button
                      onClick={() => setViewMode('original')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-target ${
                        viewMode === 'original'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Original
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleGoogleDocsImport}
                    className="inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium touch-target"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Import from Google Docs
                  </button>
                </div>
              </div>
              
              {viewMode === 'structured' && (
                <div className="mt-6 space-y-4">
                  {/* Day Navigation - Mobile Optimized */}
                  <div className="overflow-x-auto">
                    <div className="flex space-x-2 pb-2 min-w-max">
                      {days.map(day => (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors touch-target flex-shrink-0 ${
                            selectedDay === day
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Day {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Add/Remove Day Controls */}
                  <div className="flex items-center justify-center space-x-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={handleAddDay}
                      className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors touch-target"
                      title="Add Day"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Add Day</span>
                    </button>
                    {totalDays > 1 && (
                      <button
                        onClick={handleRemoveDay}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors touch-target"
                        title="Remove Last Day"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Remove Day</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Activities */}
            <div className="p-4 sm:p-6">
              {viewMode === 'structured' ? (
                <div className="space-y-4 sm:space-y-6">
                  {selectedDayActivities.length > 0 ? (
                    selectedDayActivities.flatMap((activity, index) => {
                      const IconComponent = getActivityIcon(activity.type);
                      const isEditing = editingActivity === activity.id;
                      const nextActivity = selectedDayActivities[index + 1];
                      
                      const elements = [
                        <div key={activity.id} className="flex flex-col space-y-4 p-4 sm:p-5 bg-gray-50 rounded-lg border border-gray-100">
                          {/* Activity Header */}
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Title */}
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={activity.title}
                                  onChange={(e) => handleActivityEdit(activity.id, 'title', e.target.value)}
                                  className="text-base sm:text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 w-full touch-target"
                                />
                              ) : (
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">{activity.title}</h3>
                              )}
                              
                              {/* Tags - Mobile Optimized */}
                              <div className="flex flex-wrap gap-2 max-w-full">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTypeColor(activity.type)}`}>
                                  {activity.type}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(activity.priority)}`}>
                                  {activity.priority}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {isEditing ? (
                            <textarea
                              value={activity.description}
                              onChange={(e) => handleActivityEdit(activity.id, 'description', e.target.value)}
                              className="w-full text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 min-h-[80px] touch-target"
                              rows={3}
                            />
                          ) : (
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{activity.description}</p>
                          )}
                          
                          {/* Activity Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={activity.time}
                                  onChange={(e) => handleActivityEdit(activity.id, 'time', e.target.value)}
                                  className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm flex-1 touch-target"
                                />
                              ) : (
                                <span>{activity.time}</span>
                              )}
                            </div>
                            
                            {/* Location Display - Different for Transport vs Other Activities */}
                            {activity.type === 'transport' ? (
                              <>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs font-medium">From:</span>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={activity.startLocation || ''}
                                      onChange={(e) => handleActivityEdit(activity.id, 'startLocation', e.target.value)}
                                      className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs flex-1 touch-target"
                                      placeholder="Start location"
                                    />
                                  ) : (
                                    <span className="text-xs truncate">{activity.startLocation || 'Not set'}</span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Navigation className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs font-medium">To:</span>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={activity.endLocation || ''}
                                      onChange={(e) => handleActivityEdit(activity.id, 'endLocation', e.target.value)}
                                      className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs flex-1 touch-target"
                                      placeholder="End location"
                                    />
                                  ) : (
                                    <span className="text-xs truncate">{activity.endLocation || 'Not set'}</span>
                                  )}
                                </div>
                                {/* Distance and Time for Transport */}
                                {(activity.calculatedDistance > 0 || activity.calculatedTime > 0) && (
                                  <div className="flex items-center space-x-1">
                                    <Car className="w-4 h-4" />
                                    <span className="text-xs">
                                      {activity.calculatedDistance > 0 && `${activity.calculatedDistance} mi`}
                                      {activity.calculatedDistance > 0 && activity.calculatedTime > 0 && ' • '}
                                      {activity.calculatedTime > 0 && formatDuration(activity.calculatedTime)}
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={activity.location}
                                    onChange={(e) => handleActivityEdit(activity.id, 'location', e.target.value)}
                                    className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs w-32"
                                  />
                                ) : (
                                  <span>{activity.location}</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={activity.cost}
                                  onChange={(e) => handleActivityEdit(activity.id, 'cost', e.target.value)}
                                  className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs w-20"
                                  min="0"
                                />
                              ) : (
                                <span>${activity.cost}</span>
                              )}
                            </div>
                          </div>
                          
                          {(activity.tips || isEditing) && (
                            renderFormattedTips(activity, isEditing)
                          )}
                          
                          {/* Google Map Link field for transport activities */}
                          {activity.type === 'transport' && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Link className="inline w-4 h-4 mr-1" />
                                Google Map Link
                              </label>
                              {isEditing ? (
                                <div>
                                  <input
                                    type="url"
                                    value={activity.googleMapLink || ''}
                                    onChange={(e) => handleActivityGoogleMapLinkEdit(activity.id, e.target.value)}
                                    placeholder="Paste Google Maps link here to extract time and distance"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              ) : (
                                <div>
                                  {activity.googleMapLink ? (
                                    <div>
                                      <a
                                        href={activity.googleMapLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                                      >
                                        {activity.googleMapLink}
                                      </a>
                                      {(activity.extractedDistance || activity.extractedTime) && (
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
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 text-sm">No Google Map link added</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                            {isEditing ? (
                              <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <button
                                  onClick={() => handleActivitySave(activity.id)}
                                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors touch-target font-medium"
                                >
                                  Save Changes
                                </button>
                                <button
                                  onClick={() => setEditingActivity(null)}
                                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors touch-target font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2 w-full">
                                {/* Move buttons */}
                                {activity.day > 1 && (
                                  <button
                                    onClick={() => handleMoveActivity(activity.id, 'left')}
                                    className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-target text-sm"
                                    title={`Move to Day ${activity.day - 1}`}
                                  >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Day {activity.day - 1}</span>
                                    <span className="sm:hidden">←</span>
                                  </button>
                                )}
                                {activity.day < totalDays && (
                                  <button
                                    onClick={() => handleMoveActivity(activity.id, 'right')}
                                    className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-target text-sm"
                                    title={`Move to Day ${activity.day + 1}`}
                                  >
                                    <span className="hidden sm:inline">Day {activity.day + 1}</span>
                                    <span className="sm:hidden">→</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                )}
                                
                                {/* AI Advice button */}
                                <button
                                  onClick={() => handleGetAIAdvice(activity.id)}
                                  disabled={gettingAIAdvice === activity.id}
                                  className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 touch-target text-sm"
                                  title="Get AI advice for this activity"
                                >
                                  {gettingAIAdvice === activity.id ? (
                                    <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                                  ) : (
                                    <Sparkles className="w-4 h-4" />
                                  )}
                                  <span className="hidden sm:inline">AI Tips</span>
                                  <span className="sm:hidden">AI</span>
                                </button>
                                
                                {/* Edit button */}
                                <button
                                  onClick={() => setEditingActivity(activity.id)}
                                  className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors touch-target text-sm"
                                >
                                  <span>Edit</span>
                                </button>
                                
                                {/* Delete button */}
                                <button
                                  onClick={() => setShowDeleteConfirm(activity.id)}
                                  className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                                  title="Delete activity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-sm">Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ];

                      // Add travel segment if there's a next activity
                      if (nextActivity) {
                        const travelSegment = renderTravelSegment(activity, nextActivity);
                        if (travelSegment) {
                          elements.push(travelSegment);
                        }
                      }

                      return elements;
                    })
                                    ) : (
                   <div className="text-center py-8">
                     <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                       <Calendar className="w-8 h-8 text-gray-400" />
                     </div>
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No activities for Day {selectedDay}</h3>
                     <p className="text-gray-500 mb-4">Add your first activity to get started!</p>
                     <button
                       onClick={() => handleAddActivity(selectedDay)}
                       className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-target font-medium"
                     >
                       Add Activity
                     </button>
                   </div>
                 )}
                 
                 {/* Add Activity Section */}
                 {/* Daily Travel Summary */}
                 {selectedDayActivities.length > 1 && (
                   <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                     <h4 className="text-sm font-semibold text-gray-900 mb-2">Day {selectedDay} Travel Summary</h4>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                       {(() => {
                         let totalDistance = 0;
                         let totalDuration = 0;
                         let segmentCount = 0;

                         for (let i = 0; i < selectedDayActivities.length - 1; i++) {
                           const fromActivity = selectedDayActivities[i];
                           const toActivity = selectedDayActivities[i + 1];
                           const segmentKey = `${fromActivity.id}-${toActivity.id}`;
                           const travelInfo = travelSegments[segmentKey];
                           
                           if (travelInfo && fromActivity.location !== toActivity.location) {
                             totalDistance += travelInfo.distance;
                             totalDuration += travelInfo.duration;
                             segmentCount++;
                           }
                         }

                         if (segmentCount === 0) {
                           return <span className="text-gray-500">All activities at same location</span>;
                         }

                         return (
                           <>
                             <div className="flex items-center space-x-1">
                               <MapPin className="w-4 h-4 text-gray-600" />
                               <span className="font-medium text-gray-700">
                                 {totalDistance.toFixed(1)} mi total
                               </span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <Clock className="w-4 h-4 text-gray-600" />
                               <span className="text-gray-700">
                                 {formatDuration(totalDuration)} travel time
                               </span>
                             </div>
                             <div className="text-gray-500">
                               {segmentCount} transfer{segmentCount !== 1 ? 's' : ''}
                             </div>
                           </>
                         );
                       })()}
                     </div>
                   </div>
                 )}
                 
                 {/* Add Activity Section */}
                 {addingActivity === selectedDay ? (
                   <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                     <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Activity to Day {selectedDay}</h4>
                     <div className="space-y-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Activity Title *</label>
                           <input
                             type="text"
                             value={newActivity.title}
                             onChange={(e) => handleNewActivityChange('title', e.target.value)}
                             placeholder="e.g., Visit Local Museum"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                           <input
                             type="text"
                             value={newActivity.time}
                             onChange={(e) => handleNewActivityChange('time', e.target.value)}
                             placeholder="e.g., 10:00 AM - 12:00 PM"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                           />
                         </div>
                       </div>
                       
                       <div className="space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                           <select
                             value={newActivity.type}
                             onChange={(e) => {
                               handleNewActivityChange('type', e.target.value);
                               // Auto-update time based on type
                               handleNewActivityChange('time', getDefaultTime(e.target.value));
                             }}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                           >
                             <option value="activity">Activity</option>
                             <option value="restaurant">Restaurant</option>
                             <option value="accommodation">Accommodation</option>
                             <option value="transport">Transport</option>
                           </select>
                         </div>
                         
                         {/* Conditional Location Fields based on activity type */}
                         {newActivity.type === 'transport' ? (
                           <div className="space-y-3">
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Start Location</label>
                               <input
                                 type="text"
                                 value={newActivity.startLocation}
                                 onChange={(e) => handleStartLocationChange(e.target.value)}
                                 placeholder="Starting location"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                               />
                             </div>
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">End Location</label>
                               <input
                                 type="text"
                                 value={newActivity.endLocation}
                                 onChange={(e) => handleEndLocationChange(e.target.value)}
                                 placeholder="Destination location"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                               />
                             </div>
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Transport Mode</label>
                               <select
                                 value={newActivity.transportMode}
                                 onChange={(e) => handleTransportModeChange(e.target.value)}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                               >
                                 <option value="driving">Driving</option>
                                 <option value="walking">Walking</option>
                                 <option value="transit">Public Transit</option>
                                 <option value="cycling">Cycling</option>
                               </select>
                             </div>
                           </div>
                         ) : (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                             <input
                               type="text"
                               value={newActivity.location}
                               onChange={(e) => handleNewActivityChange('location', e.target.value)}
                               placeholder="Location"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                             />
                           </div>
                         )}
                         
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                           <input
                             type="number"
                             value={newActivity.cost}
                             onChange={(e) => handleNewActivityChange('cost', e.target.value)}
                             min="0"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                           />
                         </div>
                       </div>
                       
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                         <textarea
                           value={newActivity.description}
                           onChange={(e) => handleNewActivityChange('description', e.target.value)}
                           placeholder="Describe this activity..."
                           rows={3}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                         />
                       </div>
                       
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Tips & Recommendations</label>
                         <textarea
                           value={newActivity.tips}
                           onChange={(e) => handleNewActivityChange('tips', e.target.value)}
                           placeholder="Any tips or recommendations..."
                           rows={2}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                         />
                       </div>
                       
                       {/* Transport Information Display */}
                       {newActivity.type === 'transport' && (
                         <>
                           {/* Calculated Distance and Time */}
                           {(newActivity.calculatedDistance > 0 || newActivity.calculatedTime > 0) && (
                             <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                               <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                                 <Car className="w-4 h-4 mr-1" />
                                 Calculated Route Information
                               </h4>
                               <div className="grid grid-cols-2 gap-4 text-sm">
                                 <div>
                                   <span className="text-blue-700 font-medium">Distance:</span>
                                   <div className="text-blue-900">{newActivity.calculatedDistance} miles</div>
                                 </div>
                                 <div>
                                   <span className="text-blue-700 font-medium">Est. Time:</span>
                                   <div className="text-blue-900">{formatDuration(newActivity.calculatedTime)}</div>
                                 </div>
                               </div>
                               <div className="mt-2 text-xs text-blue-600">
                                 Mode: {newActivity.transportMode.charAt(0).toUpperCase() + newActivity.transportMode.slice(1)}
                               </div>
                             </div>
                           )}

                           {/* Google Map Link field */}
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">
                               <Link className="inline w-4 h-4 mr-1" />
                               Google Map Link (Optional)
                             </label>
                             <input
                               type="url"
                               value={newActivity.googleMapLink}
                               onChange={(e) => handleGoogleMapLinkChange(e.target.value)}
                               placeholder="Paste Google Maps link for more accurate time and distance"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                             />
                             {newActivity.googleMapLink && (
                               <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                 <div className="text-gray-700 font-medium mb-1">Google Maps Data:</div>
                                 {newActivity.extractedDistance && newActivity.extractedDistance !== 'Not available' && (
                                   <div className="mb-1">
                                     <strong>Distance:</strong> {newActivity.extractedDistance}
                                   </div>
                                 )}
                                 {newActivity.extractedTime && newActivity.extractedTime !== 'Not available' && (
                                   <div>
                                     <strong>Time:</strong> {newActivity.extractedTime}
                                   </div>
                                 )}
                                 {(!newActivity.extractedDistance || newActivity.extractedDistance === 'Not available') && 
                                  (!newActivity.extractedTime || newActivity.extractedTime === 'Not available') && (
                                   <div className="text-gray-600">
                                     Unable to extract time and distance from this link
                                   </div>
                                 )}
                               </div>
                             )}
                           </div>
                         </>
                       )}
                       
                       <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end pt-4 border-t border-blue-200">
                         <button
                           onClick={handleCancelNewActivity}
                           className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-target font-medium"
                         >
                           Cancel
                         </button>
                         <button
                           onClick={handleSaveNewActivity}
                           disabled={!newActivity.title.trim()}
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target font-medium"
                         >
                           Add Activity
                         </button>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="mt-6 text-center">
                     <button
                       onClick={() => handleAddActivity(selectedDay)}
                       className="inline-flex items-center px-6 py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors touch-target font-medium"
                     >
                       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                       Add Activity to Day {selectedDay}
                     </button>
                   </div>
                 )}
                 </div>
               ) : (
                 <div className="bg-gray-50 rounded-lg p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Itinerary</h3>
                   <div className="prose prose-gray max-w-none">
                     <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-sans">
                       {itinerary}
                     </pre>
                   </div>
                 </div>
               )}
             </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-6 py-3 rounded-lg font-medium transition-colors touch-target ${
                saved
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saved ? 'Saved to Home Page!' : 'Save Trip to Home Page'}
            </button>
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

      {/* Save Trip Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Trip</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="Enter a name for your trip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Image URL (Optional)</label>
                <input
                  type="url"
                  value={tripImage}
                  onChange={(e) => setTripImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a URL for your trip image, or leave blank for default
                </p>
              </div>
              
              {tripImage && (
                <div className="mt-2">
                  <img 
                    src={tripImage} 
                    alt="Trip preview" 
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    onError={() => setTripImage('')}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTrip}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Docs Import Modal */}
      {showGoogleDocsImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Import from Google Docs</h3>
              <button
                onClick={handleCancelGoogleDocsImport}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Docs URL
                </label>
                <input
                  type="url"
                  value={googleDocsUrl}
                  onChange={(e) => setGoogleDocsUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/... (or type 'demo' for sample)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <div className="mt-2 text-xs text-gray-600 space-y-2">
                  <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="font-medium text-blue-800">📝 Required: Make your document public</p>
                    <ol className="list-decimal ml-4 space-y-1 mt-1 text-blue-700">
                      <li>Open your Google Doc with the travel itinerary</li>
                      <li>Click "Share" button (top right corner)</li>
                      <li>Click "Change to anyone with the link"</li>
                      <li>Set permission to "Viewer"</li>
                      <li>Copy the link and paste it above</li>
                    </ol>
                  </div>
                  <p className="text-center font-medium">
                    <strong>Or type "demo"</strong> to try with sample data
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-2">📋 Document Format Tips:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Structure activities by day (e.g., "Day 1", "Day 2")</li>
                  <li>• Include times, locations, and costs when available</li>
                  <li>• Use clear activity names and descriptions</li>
                  <li>• Add a "Trip Overview" section at the top</li>
                </ul>
                <details className="mt-2">
                  <summary className="text-xs text-blue-700 cursor-pointer hover:text-blue-800">
                    📄 Example Document Format
                  </summary>
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border font-mono">
                    <pre className="whitespace-pre-wrap">
Trip Overview:
Exploring the beautiful city with cultural sites and local cuisine.

Day 1
- 9:00 AM: Arrival at Airport - Transport to hotel
- 2:00 PM: Hotel Check-in at Grand Hotel
- 7:00 PM: Dinner at Local Restaurant ($45)

Day 2  
- 9:00 AM: City Walking Tour ($25)
- 1:00 PM: Lunch at Café Plaza ($20)
- 3:00 PM: Museum Visit ($15)
- 7:00 PM: Sunset Dinner Cruise ($85)
                    </pre>
                  </div>
                </details>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-green-700">
                    <p className="font-medium mb-1">Quick Demo:</p>
                    <p className="text-xs">Type "demo" in the URL field above to try importing a sample 3-day itinerary with various activities, hotels, and restaurants.</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Document Format Tips:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Organize content by days (e.g., "Day 1", "Day 2")</li>
                      <li>• Include activity titles and times (e.g., "9:00 AM - 12:00 PM")</li>
                      <li>• Add costs using $ format (e.g., $25, $150)</li>
                      <li>• Specify locations for each activity</li>
                      <li>• Use bullet points or dashes for activities</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelGoogleDocsImport}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportGoogleDoc}
                  disabled={importingGoogleDoc || !googleDocsUrl.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importingGoogleDoc ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </div>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2 inline" />
                      Import Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ItineraryPage; 