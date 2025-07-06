"use client";
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, MapPin, Calendar, Users, DollarSign, Plane, Heart, Activity, Utensils, ShoppingBag, Mountain, Camera, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ErrorBoundary from './ErrorBoundary';

const steps = [
  { id: 'destination', title: 'Trip Vision', description: 'Tell us about your dream trip' },
  { id: 'travel-details', title: 'Travel Details', description: 'When and with whom?' },
  { id: 'preferences', title: 'Preferences', description: 'What do you enjoy?' },
  { id: 'style', title: 'Travel Style', description: 'How do you like to travel?' },
  { id: 'review', title: 'Review', description: 'Confirm your preferences' },
];

const interests = [
  { id: 'culture', label: 'Culture & Museums', icon: Camera },
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'adventure', label: 'Adventure & Outdoor', icon: Mountain },
  { id: 'nightlife', label: 'Nightlife & Entertainment', icon: Activity },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'relaxation', label: 'Relaxation & Wellness', icon: Heart },
];

const travelStyles = [
  { id: 'budget', label: 'Budget Explorer', description: 'Smart spending, great experiences', price: '$' },
  { id: 'mid-range', label: 'Comfort Traveler', description: 'Balance of comfort and value', price: '$$' },
  { id: 'luxury', label: 'Luxury Seeker', description: 'Premium experiences and comfort', price: '$$$' },
];

const groupTypes = [
  { id: 'solo', label: 'Solo Travel', icon: '🧳' },
  { id: 'couple', label: 'Couple', icon: '💑' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'friends', label: 'Friends', icon: '👥' },
  { id: 'business', label: 'Business', icon: '💼' },
];

const activityLevels = [
  { id: 'relaxed', label: 'Relaxed', description: 'Take it easy, enjoy the moment' },
  { id: 'moderate', label: 'Moderate', description: 'Mix of activities and downtime' },
  { id: 'active', label: 'Active', description: 'Packed schedule, see everything' },
  { id: 'adventurous', label: 'Adventurous', description: 'Thrill-seeking and exploration' },
];

const AIBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    destination: '',
    narrative: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    interests: [],
    travelStyle: '',
    groupType: '',
    activityLevel: '',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
    accommodationPreference: '',
    notes: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Prevent SSR issues
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGenerateItinerary = async () => {
    if (!mounted) {
      alert('Application not ready. Please try again.');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Validate form data before sending
      if (!formData.destination || !formData.narrative || !formData.startDate || !formData.endDate || !formData.travelers || isNaN(formData.travelers)) {
        alert('Please fill in all required fields with valid values.');
        setIsGenerating(false);
        return;
      }

      console.log('Starting itinerary generation with data:', {
        destination: formData.destination,
        narrative: formData.narrative?.substring(0, 100) + '...',
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelers: formData.travelers,
        budget: formData.budget,
        interests: formData.interests,
        travelStyle: formData.travelStyle,
        groupType: formData.groupType,
        activityLevel: formData.activityLevel,
      });

      // Call the AI API to generate a real itinerary
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: formData.destination,
          narrative: formData.narrative,
          startDate: formData.startDate,
          endDate: formData.endDate,
          travelers: formData.travelers,
          budget: formData.budget,
          interests: formData.interests,
          travelStyle: formData.travelStyle,
          groupType: formData.groupType,
          activityLevel: formData.activityLevel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        try {
          // Save the AI-generated itinerary to database
          const tripId = `trip_${Date.now()}`;
          
          // Create trip data
          const tripData = {
            id: tripId,
            name: `${data.tripDetails.destination} Trip`,
            destination: data.tripDetails.destination,
            startDate: data.tripDetails.startDate,
            endDate: data.tripDetails.endDate,
            daysCount: data.tripDetails.days,
            travelers: data.tripDetails.people,
            status: 'planning',
            overview: data.itinerary
          };

          // Parse activities from the itinerary if they exist
          let activities = [];
          if (data.activities && Array.isArray(data.activities)) {
            activities = data.activities;
          }

          // Save to database
          const saveResponse = await fetch('/api/trips', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trip: tripData,
              activities: activities
            })
          });

          if (!saveResponse.ok) {
            throw new Error('Failed to save trip to database');
          }

          const saveResult = await saveResponse.json();
          
          if (!saveResult.success) {
            throw new Error(saveResult.error || 'Failed to save trip');
          }
          
          // Redirect to the specific trip page
          router.push(`/itinerary/${tripId}`);
        } catch (saveError) {
          console.error('Error saving to database:', saveError);
          alert('Generated itinerary successfully but failed to save. Please try again.');
        }
      } else {
        console.error('Failed to generate itinerary:', data.error, data.details);
        
        // Show specific error message based on the error type
        let errorMessage = 'Failed to generate itinerary. ';
        if (data.details?.includes('API key not configured')) {
          errorMessage += 'AI service is being configured. Please try again later.';
        } else if (data.details?.includes('Missing required fields')) {
          errorMessage += 'Please fill in all required fields.';
        } else if (data.details?.includes('Authentication failed')) {
          errorMessage += 'Authentication error. Please contact support.';
        } else if (data.details?.includes('Rate limit exceeded')) {
          errorMessage += 'Too many requests. Please wait a moment and try again.';
        } else if (data.details?.includes('Access denied')) {
          errorMessage += 'API access error. Please contact support.';
        } else if (data.details?.includes('Anthropic service error')) {
          errorMessage += 'AI service temporarily unavailable. Please try again later.';
        } else if (data.details?.includes('Network error')) {
          errorMessage += 'Please check your internet connection and try again.';
        } else if (data.details?.includes('Request timeout')) {
          errorMessage += 'Request timed out. Please try again.';
        } else if (data.details?.includes('Anthropic API error')) {
          errorMessage += `AI service error: ${data.details.split(':')[1]?.trim() || 'Unknown error'}`;
        } else {
          errorMessage += 'Please check your internet connection and try again.';
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      let errorMessage = 'An error occurred while generating your itinerary. ';
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage += 'Please check your internet connection and try again.';
        } else if (error.message.includes('JSON')) {
          errorMessage += 'There was a problem processing the response. Please try again.';
        } else if (error.message.includes('HTTP error')) {
          errorMessage += 'Server error occurred. Please try again later.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again later.';
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSkipAIGeneration = async () => {
    if (!mounted) {
      alert('Application not ready. Please try again.');
      return;
    }

    // Validate minimum required fields for manual creation
    if (!formData.destination.trim()) {
      alert('Please enter a destination before continuing.');
      return;
    }

    try {
      // Calculate trip duration
      const start = new Date(formData.startDate || new Date().toISOString().split('T')[0]);
      const end = new Date(formData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      const tripId = `trip_${Date.now()}`;
      
      // Create trip data for database
      const tripData = {
        id: tripId,
        name: `${formData.destination} Trip`,
        destination: formData.destination,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysCount: daysDiff,
        travelers: formData.travelers || 1,
        status: 'planning',
        overview: `Trip Overview:\nStart planning your ${daysDiff}-day trip to ${formData.destination}. Add activities, accommodations, and experiences to create your perfect itinerary.`
      };

      // Create initial activities for each day
      const activities = Array.from({ length: daysDiff }, (_, i) => ({
        title: `Plan activities for Day ${i + 1}`,
        description: `Add your activities, accommodations, and experiences for day ${i + 1} of your trip.`,
        location: formData.destination,
        time: '09:00',
        cost: 0,
        day: i + 1,
        type: 'activity',
        priority: 'medium',
        tips: '',
        websiteUrl: '',
        googleMapLink: '',
        startLocation: '',
        endLocation: '',
        transportMode: '',
        photos: []
      }));

      // Save to database
      const saveResponse = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip: tripData,
          activities: activities
        })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to create trip in database');
      }

      const saveResult = await saveResponse.json();
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to create trip');
      }

      // Redirect to the specific trip page for manual editing
      router.push(`/itinerary/${tripId}`);
    } catch (error) {
      console.error('Error creating manual itinerary:', error);
      alert('Failed to create manual itinerary. Please try again.');
    }
  };


  const isStepValid = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'destination':
        return formData.destination.trim() !== '' && formData.narrative.trim() !== '';
      case 'travel-details':
        return formData.startDate && formData.endDate && formData.travelers > 0;
      case 'preferences':
        return formData.interests.length > 0;
      case 'style':
        return formData.travelStyle && formData.groupType && formData.activityLevel;
      case 'review':
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'destination':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Tell us about your dream trip</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">The more details you share, the better we can personalize your perfect itinerary</p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Destination Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where would you like to go? *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Paris, France or Tokyo, Japan"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className="input-luxury w-full"
                />
              </div>

              {/* Narrative Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your ideal trip *
                </label>
                <textarea
                  placeholder="Tell us about your dream trip in detail... What kind of experiences are you looking for? Are you celebrating something special? What's your travel style? Any specific activities or places you want to include? The more you share, the better we can tailor your perfect itinerary!"
                  value={formData.narrative}
                  onChange={(e) => handleInputChange('narrative', e.target.value)}
                  className="input-luxury w-full min-h-[120px] resize-vertical"
                  rows={6}
                />
                <p className="text-xs text-gray-600 mt-2">
                  💡 Example: "I'm planning a romantic anniversary trip to Paris with my partner. We love art, fine dining, and exploring historic neighborhoods. We'd like a mix of iconic landmarks and hidden gems. Budget is flexible for special experiences. We prefer boutique hotels and enjoy both cultural activities and relaxing moments."
                </p>
              </div>

              {/* Character count */}
              <div className="text-right">
                <span className="text-xs text-gray-600">
                  {formData.narrative.length} characters
                </span>
              </div>

              {/* Skip AI Generation Option */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Prefer to plan manually?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                    Skip the AI generation and create your itinerary from scratch with our enhanced manual planning tools.
                  </p>
                  <button
                    onClick={handleSkipAIGeneration}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Skip AI Generation & Plan Manually
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'travel-details':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Travel Details</h2>
              <p className="text-lg text-gray-600">When and with whom are you traveling?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="input-luxury w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="input-luxury w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Travelers</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.travelers}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    handleInputChange('travelers', isNaN(value) ? 1 : value);
                  }}
                  className="input-luxury w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (USD)</label>
                <input
                  type="text"
                  placeholder="e.g., $3,000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="input-luxury w-full"
                />
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">What interests you?</h2>
              <p className="text-lg text-gray-600">Select all that apply to personalize your experience</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {interests.map((interest) => {
                const Icon = interest.icon;
                const isSelected = formData.interests.includes(interest.id);
                return (
                  <div
                    key={interest.id}
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-800 bg-blue-800 bg-opacity-5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-6 w-6 mr-3 ${isSelected ? 'text-blue-800' : 'text-gray-600'}`} />
                      <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                        {interest.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'style':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Travel Style</h2>
              <p className="text-lg text-gray-600">Help us customize your perfect trip experience</p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Travel Style */}
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Travel Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {travelStyles.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => handleInputChange('travelStyle', style.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.travelStyle === style.id
                          ? 'border-blue-800 bg-blue-800 bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{style.price}</div>
                        <h4 className="font-medium text-blue-800">{style.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Type */}
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Group Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {groupTypes.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => handleInputChange('groupType', group.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${
                        formData.groupType === group.id
                          ? 'border-blue-800 bg-blue-800 bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{group.icon}</div>
                      <span className="text-sm font-medium text-gray-700">{group.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Activity Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activityLevels.map((level) => (
                    <div
                      key={level.id}
                      onClick={() => handleInputChange('activityLevel', level.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.activityLevel === level.id
                          ? 'border-blue-800 bg-blue-800 bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-blue-800">{level.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to create magic?</h2>
              <p className="text-lg text-gray-600">Review your preferences and let AI craft your perfect itinerary</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="card-luxury p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Destination</span>
                  <span className="font-medium text-blue-800">{formData.destination}</span>
                </div>
                
                {/* Trip Vision/Narrative */}
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-gray-600 text-sm">Your Trip Vision</span>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      "{formData.narrative}"
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dates</span>
                    <span className="font-medium text-blue-800">
                      {formData.startDate} to {formData.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Travelers</span>
                    <span className="font-medium text-blue-800">{formData.travelers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium text-blue-800">{formData.budget}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Travel Style</span>
                    <span className="font-medium text-blue-800">
                      {travelStyles.find(s => s.id === formData.travelStyle)?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Group Type</span>
                    <span className="font-medium text-blue-800">
                      {groupTypes.find(g => g.id === formData.groupType)?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Activity Level</span>
                    <span className="font-medium text-blue-800">
                      {activityLevels.find(a => a.id === formData.activityLevel)?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Interests</span>
                    <span className="font-medium text-blue-800">
                      {formData.interests.length} selected
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleGenerateItinerary}
                disabled={isGenerating}
                className="w-full mt-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Crafting your perfect itinerary...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="h-5 w-5 mr-3" />
                    Generate My Itinerary
                  </span>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Elegant Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Header Content */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <a
                  href="/"
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Home</span>
                </a>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Trip Builder</h1>
                  <p className="text-sm text-gray-600 mt-1">{steps[currentStep].description}</p>
                </div>
              </div>
              
              {/* Step Indicator */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {steps[currentStep].title}
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Mobile Progress Bar */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {steps[currentStep].title}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Step Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:p-12 min-h-[600px] flex flex-col">
          <div className="flex-1">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-100">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const AIBuilderWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary>
      <AIBuilder />
    </ErrorBoundary>
  );
};

export default AIBuilderWithErrorBoundary; 