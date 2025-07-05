"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, DollarSign, Clock, Star, Users, Bookmark, Hotel, Utensils, Camera, Car, Plane } from 'lucide-react';

const ItineraryPage = () => {
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [viewMode, setViewMode] = useState<'structured' | 'original'>('structured');

  useEffect(() => {
    // Read from localStorage (set by AI builder)
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

  // Parse itinerary into structured data
  const parseItinerary = (text: string) => {
    if (!text) return [];
    
    const activities = [];
    let activityId = 1;
    
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
        
        // Skip day headers
        if (/^(\*\*)?Day \d+/i.test(trimmedLine)) return;
        
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
      return createSampleActivities();
    }
    
    return activities;
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

  const activities = parseItinerary(itinerary);
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
            <p className="text-gray-700 leading-relaxed">
              {tripDetails.people} travelers exploring {tripDetails.destination} for {tripDetails.days} days. 
              Travel style: {tripDetails.travelStyle}, Group: {tripDetails.groupType}, Activity level: {tripDetails.activityLevel}.
              Interests: {tripDetails.interests}. Budget: {tripDetails.budget}.
            </p>
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
                       return (
                         <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                           <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                             <IconComponent className="w-6 h-6 text-gray-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-2">
                               <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                               <div className="flex items-center space-x-2">
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                                   {activity.type}
                                 </span>
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                                   {activity.priority}
                                 </span>
                               </div>
                             </div>
                             <p className="text-gray-700 mb-3">{activity.description}</p>
                             <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                               <div className="flex items-center space-x-1">
                                 <Clock className="w-4 h-4" />
                                 <span>{activity.time}</span>
                               </div>
                               <div className="flex items-center space-x-1">
                                 <MapPin className="w-4 h-4" />
                                 <span>{activity.location}</span>
                               </div>
                               {activity.cost > 0 && (
                                 <div className="flex items-center space-x-1">
                                   <DollarSign className="w-4 h-4" />
                                   <span>${activity.cost}</span>
                                 </div>
                               )}
                             </div>
                             {activity.tips && (
                               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                 <p className="text-sm text-blue-800">{activity.tips}</p>
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