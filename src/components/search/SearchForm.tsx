

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { useAirportSearch } from '../../hooks/useFlights';
import type { SearchParams, AirportSearchResult } from '../../types/flight';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  // Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  
  // Selected airport codes
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  
  // Autocomplete state
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);

  // Refs for click outside detection
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Airport search with debouncing handled by React Query
  const { airports: originAirports, isLoading: isLoadingOrigin } = useAirportSearch(
    origin,
    activeField === 'origin'
  );
  
  const { airports: destinationAirports, isLoading: isLoadingDestination } = useAirportSearch(
    destination,
    activeField === 'destination'
  );

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle airport selection
  const selectAirport = (airport: AirportSearchResult, field: 'origin' | 'destination') => {
    if (field === 'origin') {
      setOrigin(`${airport.name} (${airport.iataCode})`);
      setSelectedOrigin(airport.iataCode);
      setShowOriginSuggestions(false);
    } else {
      setDestination(`${airport.name} (${airport.iataCode})`);
      setSelectedDestination(airport.iataCode);
      setShowDestinationSuggestions(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedOrigin || !selectedDestination) {
      alert('Please select both origin and destination airports');
      return;
    }

    if (!departureDate) {
      alert('Please select a departure date');
      return;
    }

    if (tripType === 'roundtrip' && !returnDate) {
      alert('Please select a return date for round-trip');
      return;
    }

    // Build search parameters
    const searchParams: SearchParams = {
      origin: selectedOrigin,
      destination: selectedDestination,
      departureDate,
      returnDate: tripType === 'roundtrip' ? returnDate : undefined,
      adults,
      maxResults: 50,
    };

    onSearch(searchParams);
  };

  // Passenger count options
  const passengerOptions = Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} Adult${i > 0 ? 's' : ''}`,
  }));

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trip type selector */}
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="tripType"
              value="roundtrip"
              checked={tripType === 'roundtrip'}
              onChange={(e) => setTripType(e.target.value as 'roundtrip')}
              className="mr-2"
            />
            <span className="text-sm font-medium">Round-trip</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tripType"
              value="oneway"
              checked={tripType === 'oneway'}
              onChange={(e) => setTripType(e.target.value as 'oneway')}
              className="mr-2"
            />
            <span className="text-sm font-medium">One-way</span>
          </label>
        </div>

        {/* Origin and Destination - Responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin Airport */}
          <div ref={originRef} className="relative">
            <Input
              label="From"
              value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                setSelectedOrigin('');
                setShowOriginSuggestions(true);
                setActiveField('origin');
              }}
              onFocus={() => {
                setShowOriginSuggestions(true);
                setActiveField('origin');
              }}
              placeholder="City or airport"
              required
              fullWidth
            />
            
            {/* Autocomplete dropdown */}
            {showOriginSuggestions && origin.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoadingOrigin ? (
                  <div className="p-3 text-sm text-gray-500">Searching...</div>
                ) : originAirports.length > 0 ? (
                  originAirports.map((airport) => (
                    <button
                      key={airport.id}
                      type="button"
                      onClick={() => selectAirport(airport, 'origin')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-sm">
                        {airport.name} ({airport.iataCode})
                      </div>
                      <div className="text-xs text-gray-600">
                        {airport.address.cityName}, {airport.address.countryName}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500">No airports found</div>
                )}
              </div>
            )}
          </div>

          {/* Destination Airport */}
          <div ref={destinationRef} className="relative">
            <Input
              label="To"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setSelectedDestination('');
                setShowDestinationSuggestions(true);
                setActiveField('destination');
              }}
              onFocus={() => {
                setShowDestinationSuggestions(true);
                setActiveField('destination');
              }}
              placeholder="City or airport"
              required
              fullWidth
            />
            
            {/* Autocomplete dropdown */}
            {showDestinationSuggestions && destination.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoadingDestination ? (
                  <div className="p-3 text-sm text-gray-500">Searching...</div>
                ) : destinationAirports.length > 0 ? (
                  destinationAirports.map((airport) => (
                    <button
                      key={airport.id}
                      type="button"
                      onClick={() => selectAirport(airport, 'destination')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-sm">
                        {airport.name} ({airport.iataCode})
                      </div>
                      <div className="text-xs text-gray-600">
                        {airport.address.cityName}, {airport.address.countryName}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500">No airports found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dates and Passengers - Responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Departure"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={today}
            required
            fullWidth
          />
          
          {tripType === 'roundtrip' && (
            <Input
              label="Return"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departureDate || today}
              required
              fullWidth
            />
          )}
          
          <Select
            label="Passengers"
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            options={passengerOptions}
            fullWidth
          />
        </div>

        {/* Search button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search Flights'}
        </Button>
      </form>
    </Card>
  );
};