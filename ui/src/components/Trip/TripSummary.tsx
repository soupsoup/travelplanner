import React from 'react';
import { Calendar, MapPin, Users, CreditCard, Plane, Sunrise } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';

interface TripSummaryProps {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelers: number;
  weather: string;
  flightStatus?: string;
}

const TripSummary: React.FC<TripSummaryProps> = ({
  destination,
  startDate,
  endDate,
  budget,
  travelers,
  weather,
  flightStatus
}) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-900">Trip Summary</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Destination</h3>
            <p className="text-base text-gray-900">{destination}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Dates</h3>
            <p className="text-base text-gray-900">{startDate} - {endDate}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Travelers</h3>
            <p className="text-base text-gray-900">{travelers} {travelers === 1 ? 'person' : 'people'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Budget</h3>
            <p className="text-base text-gray-900">{budget}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Sunrise className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Weather</h3>
            <p className="text-base text-gray-900">{weather}</p>
          </div>
        </div>
        
        {flightStatus && (
          <div className="flex items-start">
            <Plane className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Flight Status</h3>
              <p className="text-base text-gray-900">{flightStatus}</p>
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <Button variant="outline" className="w-full justify-center">
            Edit Trip Details
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default TripSummary;