import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import Card, { CardHeader, CardBody } from './ui/Card';

interface WeatherDay {
  day: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
}

interface WeatherWidgetProps {
  location: string;
  currentTemp: number;
  currentCondition: WeatherDay['condition'];
  forecast: WeatherDay[];
}

const getWeatherIcon = (condition: WeatherDay['condition'], size = 5) => {
  switch (condition) {
    case 'sunny':
      return <Sun className={`h-${size} w-${size} text-yellow-500`} />;
    case 'cloudy':
      return <Cloud className={`h-${size} w-${size} text-gray-400`} />;
    case 'rainy':
      return <CloudRain className={`h-${size} w-${size} text-blue-400`} />;
    case 'snowy':
      return <CloudSnow className={`h-${size} w-${size} text-blue-200`} />;
    case 'stormy':
      return <CloudLightning className={`h-${size} w-${size} text-purple-500`} />;
    default:
      return <Sun className={`h-${size} w-${size} text-yellow-500`} />;
  }
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  location,
  currentTemp,
  currentCondition,
  forecast
}) => {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Weather Forecast</h2>
        <span className="text-sm text-gray-500">{location}</span>
      </CardHeader>
      <CardBody>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {getWeatherIcon(currentCondition, 10)}
            <div className="ml-4">
              <div className="text-3xl font-bold">{currentTemp}°</div>
              <div className="text-gray-500 capitalize">{currentCondition}</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {forecast.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-2">{day.day}</span>
              {getWeatherIcon(day.condition, 6)}
              <span className="mt-2 font-medium">{day.temp}°</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default WeatherWidget;