/**
 * Custom React hooks for flight search functionality
 * Uses React Query for efficient data fetching and caching
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { amadeusService } from '../service/amadeus';
import type {
  SearchParams,
  FilterState,
  ProcessedFlight,
  PriceTrend,
  AirportSearchResult,
} from '../types/flight';
import {
  processFlightOffer,
  applyFilters,
  generatePriceData,
  calculatePriceStats,
  getUniqueAirlines,
  getPriceRange,
  getDurationRange,
} from '../utils/Helper';

// ============================================
// Flight Search Hook
// ============================================

/**
 * Main hook for searching flights
 * Handles data fetching, processing, and caching with React Query
 */
export const useFlightSearch = (searchParams: SearchParams | null) => {
  const {
    data: rawData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['flights', searchParams],
    queryFn: () => {
      if (!searchParams) throw new Error('Search parameters required');
      return amadeusService.searchFlights(searchParams);
    },
    enabled: !!searchParams, // Only run when we have search params
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Retry failed requests once
  });

  // Process raw flight data into enriched format
  const processedFlights = useMemo<ProcessedFlight[]>(() => {
    if (!rawData?.data) return [];
    return rawData.data.map(processFlightOffer);
  }, [rawData]);

  // Extract dictionaries for airline names, etc.
  const dictionaries = rawData?.dictionaries;

  return {
    flights: processedFlights,
    dictionaries,
    isLoading,
    error: error as Error | null,
    refetch,
    meta: rawData?.meta,
  };
};

// ============================================
// Airport Search Hook
// ============================================

/**
 * Hook for searching airports (autocomplete functionality)
 * Implements debouncing to reduce API calls
 */
export const useAirportSearch = (keyword: string, enabled: boolean = true) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['airports', keyword],
    queryFn: () => amadeusService.searchAirports(keyword),
    enabled: enabled && keyword.length >= 2, // Only search with 2+ characters
    staleTime: 30 * 60 * 1000, // Airport data is static, cache for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });

  return {
    airports: (data as AirportSearchResult[]) || [],
    isLoading,
    error: error as Error | null,
  };
};

// ============================================
// Flight Filtering Hook
// ============================================

/**
 * Hook for managing flight filters and applying them in real-time
 * Handles complex multi-filter scenarios with instant updates
 */
export const useFlightFilters = (flights: ProcessedFlight[]) => {
  // Get initial filter bounds from available flights
  const initialPriceRange = useMemo(() => getPriceRange(flights), [flights]);
  const initialDurationRange = useMemo(() => getDurationRange(flights), [flights]);

  // Initialize filter state with sensible defaults
   const [filters, setFilters] = useState<FilterState>({
    priceRange: initialPriceRange,
    stops: [],
    airlines: [],
    departureTimeRange: [0, 23],
    arrivalTimeRange: [0, 23],
    duration: initialDurationRange,
  });

  // Apply filters to get filtered flight list
  const filteredFlights = useMemo(() => {
    return applyFilters(flights, filters);
  }, [flights, filters]);

  // Update individual filter values
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    setFilters({
      priceRange: initialPriceRange,
      stops: [],
      airlines: [],
      departureTimeRange: [0, 23],
      arrivalTimeRange: [0, 23],
      duration: initialDurationRange,
    });
  }, [initialPriceRange, initialDurationRange]);

  // Get available filter options from current flight data
  const filterOptions = useMemo(() => ({
    airlines: getUniqueAirlines(flights),
    priceRange: initialPriceRange,
    durationRange: initialDurationRange,
  }), [flights, initialPriceRange, initialDurationRange]);

  return {
    filters,
    filteredFlights,
    updateFilter,
    resetFilters,
    filterOptions,
    hasActiveFilters: 
      filters.stops.length > 0 ||
      filters.airlines.length > 0 ||
      filters.priceRange[0] !== initialPriceRange[0] ||
      filters.priceRange[1] !== initialPriceRange[1] ||
      filters.departureTimeRange[0] !== 0 ||
      filters.departureTimeRange[1] !== 23 ||
      filters.arrivalTimeRange[0] !== 0 ||
      filters.arrivalTimeRange[1] !== 23 ||
      filters.duration[0] !== initialDurationRange[0] ||
      filters.duration[1] !== initialDurationRange[1],
  };
};

// ============================================
// Price Trend Hook
// ============================================

/**
 * Hook for generating price trend data for visualization
 * Compares all flights vs filtered flights in real-time
 */
export const usePriceTrend = (
  allFlights: ProcessedFlight[],
  filteredFlights: ProcessedFlight[]
): PriceTrend => {
  return useMemo(() => {
    // Generate data points for both datasets
    const allData = generatePriceData(allFlights);
    const filteredData = generatePriceData(filteredFlights);

    // Calculate statistics for filtered set
    const stats = calculatePriceStats(filteredFlights);

    return {
      current: allData,
      filtered: filteredData,
      lowest: stats.lowest,
      highest: stats.highest,
      average: stats.average,
    };
  }, [allFlights, filteredFlights]);
};

// ============================================
// Sort Hook
// ============================================

/**
 * Hook for sorting flight results
 * Supports multiple sort fields and directions
 */
export const useFlightSort = (flights: ProcessedFlight[]) => {
  const [sortField, setSortField] = useState<'price' | 'duration' | 'departure'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedFlights = useMemo(() => {
    const sorted = [...flights];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'price':
          comparison = a.priceNumeric - b.priceNumeric;
          break;
        case 'duration':
          comparison = a.totalDuration - b.totalDuration;
          break;
        case 'departure':
          comparison = a.departureTime.getTime() - b.departureTime.getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [flights, sortField, sortDirection]);

  const toggleSort = useCallback((field: typeof sortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  return {
    sortedFlights,
    sortField,
    sortDirection,
    toggleSort,
  };
};