'use client';

import { useState } from 'react';
import Card, { CardBody } from './ui/Card';
import Button from './ui/Button';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'annual') => void;
  userEmail: string;
}

export default function SubscriptionModal({ isOpen, onClose, onSubscribe, userEmail }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await onSubscribe(selectedPlan);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unlock Unlimited Itineraries
          </h2>
          <p className="text-gray-600">
            You've used your free itinerary. Subscribe to create unlimited travel plans!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Monthly Plan */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedPlan === 'monthly' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Monthly Plan</h3>
                  <p className="text-gray-600 text-sm">Perfect for occasional travelers</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">$5.99</div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Annual Plan */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedPlan === 'annual' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedPlan('annual')}
          >
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Annual Plan</h3>
                  <p className="text-gray-600 text-sm">Best value for frequent travelers</p>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1 inline-block">
                    Save 30%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">$50</div>
                  <div className="text-sm text-gray-500">per year</div>
                  <div className="text-xs text-gray-400 line-through">$71.88</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Processing...' : `Subscribe to ${selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Plan`}
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Email: {userEmail}</p>
          <p>Cancel anytime. No commitment required.</p>
        </div>
      </div>
    </div>
  );
} 