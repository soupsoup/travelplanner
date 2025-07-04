import React, { useState } from 'react';
import { Menu, X, MapPin, Search, User, Compass, Calendar, Briefcase } from 'lucide-react';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Compass className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Wanderlust</span>
            </div>
            
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <a href="#" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Calendar className="mr-1 h-4 w-4" />
                My Trips
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <MapPin className="mr-1 h-4 w-4" />
                Explore
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Briefcase className="mr-1 h-4 w-4" />
                Packages
              </a>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              icon={<Search className="h-4 w-4" />}
            >
              Search
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              icon={<User className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <a
              href="#"
              className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                My Trips
              </div>
            </a>
            <a
              href="#"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Explore
              </div>
            </a>
            <a
              href="#"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              <div className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Packages
              </div>
            </a>
            <div className="mt-4 flex flex-col space-y-2 px-4">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-center"
                icon={<Search className="h-4 w-4" />}
              >
                Search
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                className="w-full justify-center"
                icon={<User className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;