"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, DollarSign, Clock, Star, Users, Bookmark, Hotel, Utensils, Camera, Car, Plane, Link } from 'lucide-react';
import { extractTimeAndDistance, isValidGoogleMapLink } from '../../lib/mapUtils';

const ItineraryPage = () => {
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [viewMode, setViewMode] = useState<'structured' | 'original'>('structured');
  const [editingActivity, setEditingActivity] = useState<number | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [tripOverview, setTripOverview] = useState<string>('');
  const [addingActivity, setAddingActivity] = useState<number | null>(null);
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
    // Read from localStorage (set by AI builder)
    const itineraryData = localStorage.getItem('itinerary');
    const tripData = localStorage.getItem('tripDetails');
    setItinerary(itineraryData);
    setTripDetails(tripData ? JSON.parse(tripData) : null);
    
    if (itineraryData) {
      const { activities: parsedActivities, overview } = parseItinerary(itineraryData);
      setActivities(parsedActivities);
      setTripOverview(overview);
    }
  }, []);

  const handleSave = () => {
    // Save to 'myTrips' in localStorage (mock persistent store)
    const myTrips = JSON.parse(localStorage.getItem('myTrips') || '[]');
    myTrips.push({ ...tripDetails, itinerary, activities, tripOverview });
    localStorage.setItem('myTrips', JSON.stringify(myTrips));
    setSaved(true);
  };

  const handleActivityEdit = (activityId: number, field: string, value: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, [field]: field === 'cost' ? parseInt(value) || 0 : value }
        : activity
    ));
  };

  const handleActivityGoogleMapLinkEdit = (activityId: number, value: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, googleMapLink: value }
        : activity
    ));
    
    // Extract time and distance if it's a valid Google Maps link
    if (value && isValidGoogleMapLink(value)) {
      const { distance, time } = extractTimeAndDistance(value);
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, extractedDistance: distance, extractedTime: time }
          : activity
      ));
    } else {
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, extractedDistance: '', extractedTime: '' }
          : activity
      ));
    }
  };

  const handleActivitySave = (activityId: number) => {
    setEditingActivity(null);
    // Update localStorage with edited content
    const updatedItinerary = generateItineraryFromActivities(activities);
    setItinerary(updatedItinerary);
    localStorage.setItem('itinerary', updatedItinerary);
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
      location: tripDetails?.destination || 'Destination',
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

  const handleGoogleMapLinkChange = (value: string) => {
    setNewActivity(prev => ({
      ...prev,
      googleMapLink: value
    }));
    
    // Extract time and distance if it's a valid Google Maps link
    if (value && isValidGoogleMapLink(value)) {
      const { distance, time } = extractTimeAndDistance(value);
      setNewActivity(prev => ({
        ...prev,
        extractedDistance: distance,
        extractedTime: time
      }));
    } else {
      setNewActivity(prev => ({
        ...prev,
        extractedDistance: '',
        extractedTime: ''
      }));
    }
  };

  const handleSaveNewActivity = () => {
    if (!newActivity.title.trim()) return;
    
    const nextId = Math.max(...activities.map(a => a.id), 0) + 1;
    const activityToAdd = {
      ...newActivity,
      id: nextId,
      day: addingActivity
    };
    
    setActivities(prev => [...prev, activityToAdd]);
    
    // Update localStorage
    const updatedActivities = [...activities, activityToAdd];
    const updatedItinerary = generateItineraryFromActivities(updatedActivities);
    setItinerary(updatedItinerary);
    localStorage.setItem('itinerary', updatedItinerary);
    
    // Reset form
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
          const estimatedCost = extractCost(trimmedLine) || generateEstimatedCost(type);
          
          currentActivity = {
            id: activityId,
            day: dayNumber,
            title: cleanTitle,
            type: type,
            time: timeMatch ? formatTime(timeMatch[0]) : getDefaultTime(type),
            location: tripDetails?.destination || 'Destination',
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
  
  const generateEstimatedCost = (type: string) => {
    switch (type) {
      case 'accommodation': return 0; // Usually pre-paid
      case 'restaurant': return Math.floor(Math.random() * 60) + 20; // $20-80
      case 'activity': return Math.floor(Math.random() * 40) + 15; // $15-55
      case 'transport': return Math.floor(Math.random() * 30) + 10; // $10-40
      default: return Math.floor(Math.random() * 25) + 10; // $10-35
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
      location: tripDetails?.destination || 'Destination',
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
      location: tripDetails?.destination || 'Destination',
      cost: 80,
      description: "Enjoy a traditional local dining experience to kick off your adventure.",
      priority: "medium",
      tips: "Reservations recommended; check for availability and book in advance."
    }
  ];

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

  const days = Array.from({length: tripDetails.days || 7}, (_, i) => i + 1);
  const selectedDayActivities = activities.filter(activity => activity.day === selectedDay);

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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Duration</span>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{tripDetails.days} days</div>
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
                <span className="text-sm text-gray-500">Budget</span>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{tripDetails.budget}</div>
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
             <h2 className="text-lg font-semibold text-gray-900 mb-4">About This Trip</h2>
             <div className="text-gray-700 leading-relaxed">
               {tripOverview ? (
                 <p className="mb-4">{tripOverview}</p>
               ) : (
                 <p className="mb-4">
                   {tripDetails.people} travelers exploring {tripDetails.destination} for {tripDetails.days} days. 
                   Travel style: {tripDetails.travelStyle}, Group: {tripDetails.groupType}, Activity level: {tripDetails.activityLevel}.
                   Interests: {tripDetails.interests}. Budget: {tripDetails.budget}.
                 </p>
               )}
               <div className="text-sm text-gray-500 border-t pt-4">
                 <strong>Trip Details:</strong> {tripDetails.people} travelers • {tripDetails.days} days • {tripDetails.travelStyle} style • {tripDetails.groupType} group • {tripDetails.activityLevel} activity level • Budget: {tripDetails.budget}
               </div>
             </div>
           </div>

                     {/* Daily Timeline */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200">
             <div className="p-6 border-b border-gray-200">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-gray-900">Daily Timeline</h2>
                 <div className="flex items-center space-x-2">
                   <button
                     onClick={() => setViewMode('structured')}
                     className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                       viewMode === 'structured'
                         ? 'bg-blue-100 text-blue-700'
                         : 'text-gray-500 hover:text-gray-700'
                     }`}
                   >
                     Structured
                   </button>
                   <button
                     onClick={() => setViewMode('original')}
                     className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                       viewMode === 'original'
                         ? 'bg-blue-100 text-blue-700'
                         : 'text-gray-500 hover:text-gray-700'
                     }`}
                   >
                     Original
                   </button>
                 </div>
               </div>
               {viewMode === 'structured' && (
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
               )}
             </div>

                         {/* Activities */}
             <div className="p-6">
               {viewMode === 'structured' ? (
                 <div className="space-y-6">
                   {selectedDayActivities.length > 0 ? (
                     selectedDayActivities.map((activity) => {
                       const IconComponent = getActivityIcon(activity.type);
                       const isEditing = editingActivity === activity.id;
                       
                       return (
                         <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                           <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                             <IconComponent className="w-6 h-6 text-gray-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-2">
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
                                   <button
                                     onClick={() => setEditingActivity(activity.id)}
                                     className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                                   >
                                     Edit
                                   </button>
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
                             
                             {(activity.tips || isEditing) && (
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
                   <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                     <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Activity to Day {selectedDay}</h4>
                     <div className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Activity Title *</label>
                           <input
                             type="text"
                             value={newActivity.title}
                             onChange={(e) => handleNewActivityChange('title', e.target.value)}
                             placeholder="e.g., Visit Local Museum"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                           <input
                             type="text"
                             value={newActivity.time}
                             onChange={(e) => handleNewActivityChange('time', e.target.value)}
                             placeholder="e.g., 10:00 AM - 12:00 PM"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                           <select
                             value={newActivity.type}
                             onChange={(e) => {
                               handleNewActivityChange('type', e.target.value);
                               // Auto-update time based on type
                               handleNewActivityChange('time', getDefaultTime(e.target.value));
                             }}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           >
                             <option value="activity">Activity</option>
                             <option value="restaurant">Restaurant</option>
                             <option value="accommodation">Accommodation</option>
                             <option value="transport">Transport</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                           <input
                             type="text"
                             value={newActivity.location}
                             onChange={(e) => handleNewActivityChange('location', e.target.value)}
                             placeholder="Location"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                           <input
                             type="number"
                             value={newActivity.cost}
                             onChange={(e) => handleNewActivityChange('cost', e.target.value)}
                             min="0"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         />
                       </div>
                       
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Tips & Recommendations</label>
                         <textarea
                           value={newActivity.tips}
                           onChange={(e) => handleNewActivityChange('tips', e.target.value)}
                           placeholder="Any tips or recommendations..."
                           rows={2}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         />
                       </div>
                       
                       {/* Google Map Link field for transport activities */}
                       {newActivity.type === 'transport' && (
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             <Link className="inline w-4 h-4 mr-1" />
                             Google Map Link
                           </label>
                           <input
                             type="url"
                             value={newActivity.googleMapLink}
                             onChange={(e) => handleGoogleMapLinkChange(e.target.value)}
                             placeholder="Paste Google Maps link here to extract time and distance"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                           {newActivity.googleMapLink && (
                             <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
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
                       )}
                       
                       <div className="flex items-center justify-end space-x-3 pt-4 border-t border-blue-200">
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
                   </div>
                 ) : (
                   <div className="mt-6 text-center">
                     <button
                       onClick={() => handleAddActivity(selectedDay)}
                       className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
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
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                saved
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saved ? 'Saved to My Trips!' : 'Save to My Trips'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage; 