"use client";
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, MapPin, Calendar, Users, DollarSign, Plane, Heart, Activity, Utensils, ShoppingBag, Mountain, Camera, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 'destination', title: 'Destination', description: 'Where would you like to go?' },
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
  const router = useRouter();

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
    setIsGenerating(true);
    try {
      // Call the AI API to generate a real itinerary
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: formData.destination,
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

      const data = await response.json();

      if (data.success) {
        // Save the AI-generated itinerary to localStorage
        localStorage.setItem('tripDetails', JSON.stringify(data.tripDetails));
        localStorage.setItem('itinerary', data.itinerary);
        
        // Redirect to the itinerary page
        router.push('/itinerary');
      } else {
        console.error('Failed to generate itinerary:', data.error);
        alert('Failed to generate itinerary. Please try again.');
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('An error occurred while generating your itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };



  const isStepValid = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'destination':
        return formData.destination.trim() !== '';
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
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gold-warm mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luxury-primary mb-2">Where to?</h2>
              <p className="text-gray-medium">Choose your dream destination</p>
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="e.g., Paris, France"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className="input-luxury w-full text-center text-lg"
              />
            </div>
          </div>
        );

      case 'travel-details':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gold-warm mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luxury-primary mb-2">Travel Details</h2>
              <p className="text-gray-medium">When and with whom are you traveling?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-dark mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="input-luxury w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-dark mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="input-luxury w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-dark mb-2">Number of Travelers</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.travelers}
                  onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                  className="input-luxury w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-dark mb-2">Budget (USD)</label>
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
            <div className="text-center">
              <Heart className="h-12 w-12 text-gold-warm mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luxury-primary mb-2">What interests you?</h2>
              <p className="text-gray-medium">Select all that apply</p>
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
                        ? 'border-navy-deep bg-navy-deep bg-opacity-5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-6 w-6 mr-3 ${isSelected ? 'text-navy-deep' : 'text-gray-medium'}`} />
                      <span className={`font-medium ${isSelected ? 'text-navy-deep' : 'text-gray-dark'}`}>
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
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-gold-warm mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luxury-primary mb-2">Your Travel Style</h2>
              <p className="text-gray-medium">Help us customize your perfect trip</p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Travel Style */}
              <div>
                <h3 className="text-lg font-semibold text-luxury-primary mb-4">Travel Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {travelStyles.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => handleInputChange('travelStyle', style.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.travelStyle === style.id
                          ? 'border-navy-deep bg-navy-deep bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{style.price}</div>
                        <h4 className="font-medium text-luxury-primary">{style.label}</h4>
                        <p className="text-sm text-gray-medium mt-1">{style.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Type */}
              <div>
                <h3 className="text-lg font-semibold text-luxury-primary mb-4">Group Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {groupTypes.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => handleInputChange('groupType', group.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${
                        formData.groupType === group.id
                          ? 'border-navy-deep bg-navy-deep bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{group.icon}</div>
                      <span className="text-sm font-medium text-gray-dark">{group.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <h3 className="text-lg font-semibold text-luxury-primary mb-4">Activity Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activityLevels.map((level) => (
                    <div
                      key={level.id}
                      onClick={() => handleInputChange('activityLevel', level.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.activityLevel === level.id
                          ? 'border-navy-deep bg-navy-deep bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-luxury-primary">{level.label}</h4>
                      <p className="text-sm text-gray-medium mt-1">{level.description}</p>
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
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-gold-warm mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luxury-primary mb-2">Ready to create magic?</h2>
              <p className="text-gray-medium">Review your preferences and let AI craft your perfect itinerary</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="card-luxury p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Destination</span>
                  <span className="font-medium text-luxury-primary">{formData.destination}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Dates</span>
                  <span className="font-medium text-luxury-primary">
                    {formData.startDate} to {formData.endDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Travelers</span>
                  <span className="font-medium text-luxury-primary">{formData.travelers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Budget</span>
                  <span className="font-medium text-luxury-primary">{formData.budget}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Travel Style</span>
                  <span className="font-medium text-luxury-primary">
                    {travelStyles.find(s => s.id === formData.travelStyle)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Interests</span>
                  <span className="font-medium text-luxury-primary">
                    {formData.interests.length} selected
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleGenerateItinerary}
                disabled={isGenerating}
                className="btn-secondary w-full mt-6 py-4 text-lg"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white-crisp mr-2"></div>
                    Crafting your perfect itinerary...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="h-5 w-5 mr-2" />
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
    <div className="min-h-screen bg-gray-soft">
      {/* Progress Bar */}
      <div className="bg-white-crisp border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-luxury-primary">AI Trip Builder</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-medium">
                {currentStep + 1} of {steps.length}
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gold-warm h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="min-h-96">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AIBuilder; 