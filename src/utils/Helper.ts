/**
 * Utility functions for the Flight Search Engine
 * Includes date formatting, duration parsing, and data transformation helpers
 */

import type { FlightOffer, ProcessedFlight, PriceDataPoint, FilterState } from '../types/flight';

// ============================================
// Date & Time Utilities
// ============================================

/**
 * Formats ISO date string to readable format
 * @example "2024-03-15T10:30:00" -> "Mar 15, 10:30 AM"
 */
export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Formats date for display (no time component)
 * @example "2024-03-15" -> "March 15, 2024"
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Gets time component from ISO datetime string
 * @example "2024-03-15T14:30:00" -> "2:30 PM"
 */
export const getTimeFromISO = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Gets hour (0-23) from ISO datetime string
 * Used for time-based filtering
 */
export const getHourFromISO = (isoString: string): number => {
  return new Date(isoString).getHours();
};

// ============================================
// Duration Utilities
// ============================================

/**
 * Parses ISO 8601 duration to minutes
 * @example "PT2H30M" -> 150 (minutes)
 * @example "PT1H15M" -> 75 (minutes)
 */
export const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return 0;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  return hours * 60 + minutes;
};

/**
 * Formats duration in minutes to human-readable string
 * @example 150 -> "2h 30m"
 * @example 75 -> "1h 15m"
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  
  return `${hours}h ${mins}m`;
};

// ============================================
// Price Formatting
// ============================================

/**
 * Formats price with currency symbol
 * @example (123.45, "USD") -> "$123.45"
 */
export const formatPrice = (price: number | string, currency: string = 'USD'): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

// ============================================
// Flight Data Processing
// ============================================

/**
 * Processes raw flight offer into enriched format with computed fields
 * Makes it easier to filter, sort, and display flight information
 */
export const processFlightOffer = (offer: FlightOffer): ProcessedFlight => {
  const firstItinerary = offer.itineraries[0];
  const firstSegment = firstItinerary.segments[0];
  const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];

  // Calculate total duration across all segments
  const totalDuration = offer.itineraries.reduce((total, itinerary) => {
    return total + parseDuration(itinerary.duration);
  }, 0);

  // Count total stops (segments - 1)
  const totalStops = firstItinerary.segments.length - 1;

  return {
    ...offer,
    totalDuration,
    totalStops,
    mainAirline: firstSegment.carrierCode,
    departureTime: new Date(firstSegment.departure.at),
    arrivalTime: new Date(lastSegment.arrival.at),
    priceNumeric: parseFloat(offer.price.total),
  };
};

/**
 * Applies all active filters to flight list
 * Returns filtered flights that match all criteria
 */
export const applyFilters = (
  flights: ProcessedFlight[],
  filters: FilterState
): ProcessedFlight[] => {
  return flights.filter((flight) => {
    // Price filter
    if (
      flight.priceNumeric < filters.priceRange[0] ||
      flight.priceNumeric > filters.priceRange[1]
    ) {
      return false;
    }

    // Stops filter
    if (filters.stops.length > 0) {
      const stopCategory = 
        flight.totalStops === 0 ? '0' :
        flight.totalStops === 1 ? '1' : '2+';
      
      if (!filters.stops.includes(stopCategory as any)) {
        return false;
      }
    }

    // Airlines filter
    if (filters.airlines.length > 0) {
      if (!filters.airlines.includes(flight.mainAirline)) {
        return false;
      }
    }

    // Departure time filter
    const departureHour = flight.departureTime.getHours();
    if (
      departureHour < filters.departureTimeRange[0] ||
      departureHour > filters.departureTimeRange[1]
    ) {
      return false;
    }

    // Arrival time filter
    const arrivalHour = flight.arrivalTime.getHours();
    if (
      arrivalHour < filters.arrivalTimeRange[0] ||
      arrivalHour > filters.arrivalTimeRange[1]
    ) {
      return false;
    }

    // Duration filter
    if (
      flight.totalDuration < filters.duration[0] ||
      flight.totalDuration > filters.duration[1]
    ) {
      return false;
    }

    return true;
  });
};

/**
 * Converts flight data to price data points for charting
 * Groups by price buckets for better visualization
 */
export const generatePriceData = (flights: ProcessedFlight[]): PriceDataPoint[] => {
  return flights.map((flight) => ({
    price: flight.priceNumeric,
    date: flight.departureTime.toISOString().split('T')[0],
    airline: flight.mainAirline,
    stops: flight.totalStops,
  }));
};

/**
 * Calculates price statistics from flight list
 * Returns min, max, and average prices
 */
export const calculatePriceStats = (flights: ProcessedFlight[]) => {
  if (flights.length === 0) {
    return { lowest: 0, highest: 0, average: 0 };
  }

  const prices = flights.map((f) => f.priceNumeric);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  return { lowest, highest, average };
};

/**
 * Extracts unique airline codes from flight list
 * Used for airline filter options
 */
export const getUniqueAirlines = (flights: ProcessedFlight[]): string[] => {
  const airlines = new Set(flights.map((f) => f.mainAirline));
  return Array.from(airlines).sort();
};

/**
 * Gets price range (min/max) from flight list
 * Used to set initial filter bounds
 */
export const getPriceRange = (flights: ProcessedFlight[]): [number, number] => {
  if (flights.length === 0) return [0, 1000];
  
  const prices = flights.map((f) => f.priceNumeric);
  return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
};

/**
 * Gets duration range (min/max) from flight list
 * Used to set initial duration filter bounds
 */
export const getDurationRange = (flights: ProcessedFlight[]): [number, number] => {
  if (flights.length === 0) return [0, 1440]; // 0 to 24 hours
  
  const durations = flights.map((f) => f.totalDuration);
  return [Math.floor(Math.min(...durations)), Math.ceil(Math.max(...durations))];
};

// ============================================
// Debounce Utility
// ============================================

/**
 * Debounces a function call
 * Useful for search inputs and filter updates
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};