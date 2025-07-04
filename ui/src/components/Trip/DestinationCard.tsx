import React from 'react';
import { MapPin, Star } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';

interface DestinationCardProps {
  name: string;
  image: string;
  country: string;
  rating: number;
  description: string;
  onClick?: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  name,
  image,
  country,
  rating,
  description,
  onClick
}) => {
  return (
    <Card className="h-full transform transition-transform duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
      </div>
      <CardBody>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{name}</h3>
          <div className="flex items-center bg-yellow-100 px-2 py-1 rounded text-yellow-700">
            <Star className="h-3.5 w-3.5 fill-current text-yellow-500 mr-1" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-500 mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="text-sm">{country}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <Button 
          variant="outline" 
          className="w-full justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          onClick={onClick}
        >
          Explore Destination
        </Button>
      </CardBody>
    </Card>
  );
};

export default DestinationCard;