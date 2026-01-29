

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { useDebounce } from '../../hooks/useDebounce';
import { useAirportSearch } from '../../hooks/useFlights';
import type { SearchParams, AirportSearchResult } from '../../types/flight';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  initialValues?: Partial<SearchParams>;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, initialValues }) => {
  // Form state - Initialize from URL params if available
  const [origin, setOrigin] = useState(initialValues?.origin || '');
  const [destination, setDestination] = useState(initialValues?.destination || '');
  const [departureDate, setDepartureDate] = useState(initialValues?.departureDate || '');
  const [returnDate, setReturnDate] = useState(initialValues?.returnDate || '');
  const [adults, setAdults] = useState(initialValues?.adults || 1);
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>(
    initialValues?.returnDate ? 'roundtrip' : 'oneway'
  );
  
  // Selected airport codes - Sync with inputs initially
  const [selectedOrigin, setSelectedOrigin] = useState(initialValues?.origin || '');
  const [selectedDestination, setSelectedDestination] = useState(initialValues?.destination || '');
  
  // Update state when initialValues change (URL sync)
  useEffect(() => {
    if (initialValues) {
      if (initialValues.origin) {
        // If we have the airport name stored, use it; otherwise just show the code
        const originDisplay = originAirportName 
          ? `${originAirportName} (${initialValues.origin})`
          : initialValues.origin;
        setOrigin(originDisplay);
        setSelectedOrigin(initialValues.origin);
      }
      if (initialValues.destination) {
        // If we have the airport name stored, use it; otherwise just show the code
        const destinationDisplay = destinationAirportName 
          ? `${destinationAirportName} (${initialValues.destination})`
          : initialValues.destination;
        setDestination(destinationDisplay);
        setSelectedDestination(initialValues.destination);
      }
      if (initialValues.departureDate) setDepartureDate(initialValues.departureDate);
      if (initialValues.returnDate) {
        setReturnDate(initialValues.returnDate);
        setTripType('roundtrip');
      } else {
        setTripType('oneway');
      }
      if (initialValues.adults) setAdults(initialValues.adults);
    }
  }, [initialValues]);

  // Autocomplete state
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);

  // Debounce search inputs (500ms delay) to prevent rate limiting
  const debouncedOrigin = useDebounce(origin, 500);
  const debouncedDestination = useDebounce(destination, 500);

  // Refs for click outside detection
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Airport search with debouncing handled by custom hook
  // We use the DEBOUNCED value for the API query key
  const { airports: originAirports, isLoading: isLoadingOrigin } = useAirportSearch(
    debouncedOrigin,
    activeField === 'origin'
  );
  
  const { airports: destinationAirports, isLoading: isLoadingDestination } = useAirportSearch(
    debouncedDestination,
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

  // Store airport names for display persistence
  const [originAirportName, setOriginAirportName] = useState('');
  const [destinationAirportName, setDestinationAirportName] = useState('');

  // Update airport name storage in selectAirport
  const selectAirportWithName = (airport: AirportSearchResult, field: 'origin' | 'destination') => {
    if (field === 'origin') {
      setOrigin(`${airport.name} (${airport.iataCode})`);
      setOriginAirportName(airport.name);
      setSelectedOrigin(airport.iataCode);
      setShowOriginSuggestions(false);
    } else {
      setDestination(`${airport.name} (${airport.iataCode})`);
      setDestinationAirportName(airport.name);
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
      maxResults: 50, // Max results to fetch (will be paginated to 10 per page)
    };

    onSearch(searchParams);
  };

  // Passenger count options
  const passengerOptions = Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} Adult${i > 0 ? 's' : ''}`,
  }));

  return (
    <Card className="mb-2">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Trip type selector */}
        <div className="flex gap-4 border-b border-gray-100 pb-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value="roundtrip"
              checked={tripType === 'roundtrip'}
              onChange={(e) => setTripType(e.target.value as 'roundtrip')}
              className="mr-2 w-3 h-3 accent-black cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-900">Round-trip</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value="oneway"
              checked={tripType === 'oneway'}
              onChange={(e) => setTripType(e.target.value as 'oneway')}
              className="mr-2 w-3 h-3 accent-black cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-900">One-way</span>
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
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoadingOrigin ? (
                  <div className="p-3 text-sm text-gray-600 font-normal">Loading airports...</div>
                ) : originAirports.length > 0 ? (
                  originAirports.map((airport) => (
                    <button
                      key={airport.id}
                      type="button"
                      onClick={() => selectAirportWithName(airport, 'origin')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="font-semibold text-sm text-gray-900">
                        {airport.name} ({airport.iataCode})
                      </div>
                      <div className="text-xs text-gray-600 font-normal">
                        {airport.address.cityName}, {airport.address.countryName}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-600 font-normal">No airports found</div>
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
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoadingDestination ? (
                  <div className="p-4 text-sm text-gray-600 font-medium">Searching...</div>
                ) : destinationAirports.length > 0 ? (
                  destinationAirports.map((airport) => (
                    <button
                      key={airport.id}
                      type="button"
                      onClick={() => selectAirportWithName(airport, 'destination')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="font-semibold text-sm text-gray-900">
                        {airport.name} ({airport.iataCode})
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {airport.address.cityName}, {airport.address.countryName}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-600 font-medium">No airports found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dates and Passengers - Responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
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
          size="md"
          fullWidth
          isLoading={isLoading}
          className="mt-3"
        >
          {isLoading ? 'Searching Flights...' : 'Search Flights'}
        </Button>
      </form>
    </Card>
  );
};