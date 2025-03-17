import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, X } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  distance?: number;
  location: Location;
  placeId?: string;
}

interface DoctorSearchProps {
  onSelectDoctor: (doctor: Doctor) => void;
  initialSpecialty?: string;
}

export const DoctorSearch: React.FC<DoctorSearchProps> = ({ onSelectDoctor, initialSpecialty }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [specialty, setSpecialty] = useState(initialSpecialty || '');
  const [radius, setRadius] = useState(10);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch specialties on component mount
  useEffect(() => {
    fetchSpecialties();
    // Try to get user's location
    getUserLocation();
  }, []);

  // Fetch doctors when location or filters change
  useEffect(() => {
    if (location) {
      searchDoctors();
    }
  }, [location, specialty, radius]);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/specialties');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setSpecialties(data);
    } catch (err) {
      console.error('Error fetching specialties:', err);
      setError('Failed to load medical specialties');
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(userLocation);
          // Get address from coordinates using reverse geocoding
          reverseGeocode(userLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter it manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const reverseGeocode = async (location: Location) => {
    try {
      // In a real app, use Google Maps Geocoding API
      // For now, just set a placeholder address
      setLocationInput('Your Current Location');
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    }
  };

  const handleLocationSearch = async () => {
    if (!locationInput.trim()) {
      setError('Please enter a location');
      return;
    }

    try {
      // In a real app, use Google Maps Geocoding API to convert address to coordinates
      // For now, just set some mock coordinates
      const mockLocation = {
        lat: 37.7749,
        lng: -122.4194,
        address: locationInput
      };
      setLocation(mockLocation);
      setError(null);
    } catch (err) {
      console.error('Error geocoding address:', err);
      setError('Unable to find location. Please try a different address.');
    }
  };

  const searchDoctors = async () => {
    if (!location) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        location: `${location.lat},${location.lng}`,
        radius: radius.toString()
      });

      if (specialty) {
        params.append('specialty', specialty);
      }

      const response = await fetch(`http://localhost:8002/api/doctors/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setDoctors(data.doctors);
      
      if (data.doctors.length === 0) {
        setError('No doctors found matching your criteria');
      }
    } catch (err) {
      console.error('Error searching doctors:', err);
      setError('Failed to search for doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecialty(e.target.value);
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRadius(parseInt(e.target.value));
  };

  const clearFilters = () => {
    setSpecialty('');
    setRadius(10);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 mb-2">Find a Doctor</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          Search for doctors near you and book appointments
        </p>
      </div>

      {/* Location Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Your Location
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter your location"
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <motion.button
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLocationSearch}
          >
            <Search className="w-5 h-5 mr-1" />
            Search
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters
          </label>
          <button
            className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialty
                </label>
                <select
                  value={specialty}
                  onChange={handleSpecialtyChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Distance (km): {radius}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={handleRadiusChange}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 dark:text-gray-400 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg"
        >
          <p>{error}</p>
        </motion.div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center mb-6">
          <motion.div
            className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Searching for doctors...</span>
        </div>
      )}

      {/* Doctor List */}
      {!loading && doctors.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {doctors.length} {doctors.length === 1 ? 'Doctor' : 'Doctors'} Found
          </h2>
          {doctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectDoctor(doctor)}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400">{doctor.specialty}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{doctor.address}</p>
                </div>
                <div className="text-right">
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                    {doctor.distance?.toFixed(1)} km
                  </div>
                  <div className="mt-2 text-yellow-500">
                    {'★'.repeat(Math.round(doctor.rating))}
                    {'☆'.repeat(5 - Math.round(doctor.rating))}
                  </div>
                </div>
              </div>
              <button
                className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Profile
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && doctors.length === 0 && location && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">No doctors found matching your criteria</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Try adjusting your filters or search in a different location</p>
        </div>
      )}
    </div>
  );
}; 