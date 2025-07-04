"use client";
import React, { useState } from 'react';
import { Plus, Calendar, MapPin, DollarSign, Users, Search, Filter, Star } from 'lucide-react';
import Link from 'next/link';

// Mock data for the new structure
const sampleItineraries = [
  {
    id: '1',
    name: 'European Adventure',
    destination: 'Paris, France',
    startDate: '2024-06-15',
    endDate: '2024-06-22',
    daysCount: 7,
    travelers: 2,
    budget: { total: 3500, currency: 'USD' },
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    activitiesCount: 18,
    completedActivities: 0,
  },
  {
    id: '2',
    name: 'Tokyo Discovery',
    destination: 'Tokyo, Japan',
    startDate: '2024-07-01',
    endDate: '2024-07-10',
    daysCount: 9,
    travelers: 1,
    budget: { total: 4200, currency: 'USD' },
    status: 'planning',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    activitiesCount: 24,
    completedActivities: 0,
  },
  {
    id: '3',
    name: 'Bali Retreat',
    destination: 'Bali, Indonesia',
    startDate: '2024-04-10',
    endDate: '2024-04-20',
    daysCount: 10,
    travelers: 2,
    budget: { total: 2800, currency: 'USD' },
    status: 'completed',
    image: 'https://images.unsplash.com/photo-2537953773345-d172ccf13cf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    activitiesCount: 15,
    completedActivities: 15,
  },
];

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredItineraries = sampleItineraries.filter(itinerary => {
    const matchesSearch = itinerary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         itinerary.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || itinerary.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-soft">
      {/* Header */}
      <div className="bg-white-crisp border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-luxury-primary">Luxe Travel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/ai-builder" className="btn-secondary">
                <Plus className="h-4 w-4 mr-2" />
                AI Builder
              </Link>
              <Link href="/itinerary/new" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Itinerary
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-gradient text-white-crisp">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Journey <span className="text-gold-warm">Awaits</span>
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Craft extraordinary travel experiences with our sophisticated itinerary management platform
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-medium" />
              <input
                type="text"
                placeholder="Search itineraries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-luxury pl-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-medium" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-luxury"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-luxury p-6">
            <div className="flex items-center">
              <div className="p-3 bg-navy-deep bg-opacity-10 rounded-xl">
                <Calendar className="h-6 w-6 text-navy-deep" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-medium">Total Itineraries</p>
                <p className="text-2xl font-bold text-luxury-primary">{sampleItineraries.length}</p>
              </div>
            </div>
          </div>
          <div className="card-luxury p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gold-warm bg-opacity-10 rounded-xl">
                <MapPin className="h-6 w-6 text-gold-warm" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-medium">Countries Visited</p>
                <p className="text-2xl font-bold text-luxury-primary">12</p>
              </div>
            </div>
          </div>
          <div className="card-luxury p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 bg-opacity-10 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-medium">Total Budget</p>
                <p className="text-2xl font-bold text-luxury-primary">$25,800</p>
              </div>
            </div>
          </div>
          <div className="card-luxury p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 bg-opacity-10 rounded-xl">
                <Star className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-luxury-primary">4.8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Itineraries Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-luxury-primary">Your Itineraries</h2>
            <div className="text-sm text-gray-medium">
              {filteredItineraries.length} of {sampleItineraries.length} itineraries
            </div>
          </div>

          {filteredItineraries.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-sm mx-auto">
                <div className="mb-4">
                  <Calendar className="h-12 w-12 text-gray-medium mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-dark mb-2">No itineraries found</h3>
                <p className="text-gray-medium mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? "Try adjusting your search or filter criteria" 
                    : "Start planning your first adventure"}
                </p>
                <Link href="/ai-builder" className="btn-primary">
                  Create Your First Itinerary
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItineraries.map((itinerary) => (
                <Link key={itinerary.id} href={`/itinerary/${itinerary.id}`}>
                  <div className="card-luxury overflow-hidden hover:shadow-luxury-hover transition-all duration-300 cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={itinerary.image} 
                        alt={itinerary.destination}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(itinerary.status)}`}>
                          {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-luxury-primary mb-2">{itinerary.name}</h3>
                      <p className="text-gray-medium mb-4">{itinerary.destination}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-medium mr-2" />
                          <span>{itinerary.daysCount} days</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-medium mr-2" />
                          <span>{itinerary.travelers} travelers</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-medium mr-2" />
                          <span>${itinerary.budget.total.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-gray-medium mr-2" />
                          <span>{itinerary.completedActivities}/{itinerary.activitiesCount} done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 