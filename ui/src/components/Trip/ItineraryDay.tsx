import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, MapPin, Plus } from 'lucide-react';
import Button from '../ui/Button';

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  category: 'flight' | 'accommodation' | 'activity' | 'food' | 'transport';
}

interface ItineraryDayProps {
  day: number;
  date: string;
  activities: Activity[];
  onAddActivity?: () => void;
}

const getCategoryColor = (category: Activity['category']) => {
  switch (category) {
    case 'flight':
      return 'bg-blue-100 text-blue-800';
    case 'accommodation':
      return 'bg-purple-100 text-purple-800';
    case 'activity':
      return 'bg-green-100 text-green-800';
    case 'food':
      return 'bg-yellow-100 text-yellow-800';
    case 'transport':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ItineraryDay: React.FC<ItineraryDayProps> = ({
  day,
  date,
  activities,
  onAddActivity
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            {day}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Day {day}</h3>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">{activities.length} activities</span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-2 pl-14">
          <div className="relative pl-8 border-l-2 border-gray-200">
            {activities.map((activity, index) => (
              <div key={activity.id} className="mb-6 relative">
                <div className="absolute -left-[26px] w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-medium text-gray-900">{activity.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(activity.category)}`}>
                      {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-start">
                    <Clock className="mt-0.5 h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <div className="mt-1 flex items-start">
                    <MapPin className="mt-0.5 h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">{activity.location}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-blue-600"
              icon={<Plus className="h-4 w-4" />}
              onClick={onAddActivity}
            >
              Add Activity
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDay;