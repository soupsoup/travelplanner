import React from 'react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';

interface TripCardProps {
  id: string;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  activitiesCount: number;
  onClick?: () => void;
}

const TripCard: React.FC<TripCardProps> = ({
  destination,
  image,
  startDate,
  endDate,
  daysCount,
  activitiesCount,
  onClick
}) => {
  return (
    <Card className="h-full transform transition-transform duration-300 hover:scale-[1.02] cursor-pointer\" onClick={onClick}>
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={destination} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold">{destination}</h3>
          <div className="flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{destination}</span>
          </div>
        </div>
      </div>
      <CardBody>
        <div className="flex items-center text-gray-500 mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="text-sm">{startDate} - {endDate}</span>
        </div>
        
        <div className="flex justify-between">
          <div>
            <span className="text-sm text-gray-500">Duration</span>
            <p className="font-medium">{daysCount} days</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Activities</span>
            <p className="font-medium">{activitiesCount} planned</p>
          </div>
          <div className="flex items-center text-blue-600">
            <span className="text-sm font-medium">Details</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TripCard;