import { useState, useEffect, useCallback } from 'react';
import type { SearchParams, FilterState } from '../types/flight';

const SEARCH_PARAMS_KEY = 'flight_search_params';
const FILTERS_KEY = 'flight_filters';

/**
 * Hook for persisting search params to localStorage
 */
export const useLocalStorageSearchParams = (initialParams: SearchParams | null) => {
  const [params, setParams] = useState<SearchParams | null>(() => {
    if (typeof window === 'undefined') return initialParams;
    
    const stored = localStorage.getItem(SEARCH_PARAMS_KEY);
    return stored ? JSON.parse(stored) : initialParams;
  });

  useEffect(() => {
    if (params) {
      localStorage.setItem(SEARCH_PARAMS_KEY, JSON.stringify(params));
    }
  }, [params]);

  const clearParams = useCallback(() => {
    setParams(null);
    localStorage.removeItem(SEARCH_PARAMS_KEY);
  }, []);

  return { params, setParams, clearParams };
};

/**
 * Hook for persisting filters to localStorage
 */
export const useLocalStorageFilters = (initialFilters: FilterState) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    if (typeof window === 'undefined') return initialFilters;
    
    const stored = localStorage.getItem(FILTERS_KEY);
    return stored ? JSON.parse(stored) : initialFilters;
  });

  useEffect(() => {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    localStorage.removeItem(FILTERS_KEY);
  }, [initialFilters]);

  return { filters, setFilters, clearFilters };
};

/**
 * Hook for URL-based search (shareable links)
 */
export const useSearchParamsURL = () => {
  const getQueryParams = useCallback((): SearchParams | null => {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    
    const origin = params.get('origin');
    const destination = params.get('destination');
    
    if (!origin || !destination) return null;

    const childrenStr = params.get('children');
    const infantsStr = params.get('infants');
    const maxResultsStr = params.get('maxResults');

    return {
      origin,
      destination,
      departureDate: params.get('departureDate') || '',
      returnDate: params.get('returnDate') || undefined,
      adults: parseInt(params.get('adults') || '1'),
      children: childrenStr ? parseInt(childrenStr) : undefined,
      infants: infantsStr ? parseInt(infantsStr) : undefined,
      travelClass: (params.get('travelClass') as 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST' | undefined),
      nonStop: params.get('nonStop') === 'true' ? true : undefined,
      currencyCode: params.get('currencyCode') || undefined,
      maxResults: maxResultsStr ? parseInt(maxResultsStr) : undefined,
    };
  }, []);

  const setQueryParams = useCallback((searchParams: SearchParams) => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    params.set('origin', searchParams.origin);
    params.set('destination', searchParams.destination);
    params.set('departureDate', searchParams.departureDate);
    if (searchParams.returnDate) params.set('returnDate', searchParams.returnDate);
    params.set('adults', String(searchParams.adults));
    if (searchParams.children) params.set('children', String(searchParams.children));
    if (searchParams.infants) params.set('infants', String(searchParams.infants));
    if (searchParams.travelClass) params.set('travelClass', searchParams.travelClass);
    if (searchParams.nonStop) params.set('nonStop', 'true');
    if (searchParams.currencyCode) params.set('currencyCode', searchParams.currencyCode);
    if (searchParams.maxResults) params.set('maxResults', String(searchParams.maxResults));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, []);

  const getShareableLink = useCallback((searchParams: SearchParams): string => {
    if (typeof window === 'undefined') return '';

    const params = new URLSearchParams();
    params.set('origin', searchParams.origin);
    params.set('destination', searchParams.destination);
    params.set('departureDate', searchParams.departureDate);
    if (searchParams.returnDate) params.set('returnDate', searchParams.returnDate);
    params.set('adults', String(searchParams.adults));
    if (searchParams.children) params.set('children', String(searchParams.children));
    if (searchParams.infants) params.set('infants', String(searchParams.infants));
    if (searchParams.travelClass) params.set('travelClass', searchParams.travelClass);
    if (searchParams.nonStop) params.set('nonStop', 'true');
    if (searchParams.currencyCode) params.set('currencyCode', searchParams.currencyCode);
    if (searchParams.maxResults) params.set('maxResults', String(searchParams.maxResults));

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, []);

  return { getQueryParams, setQueryParams, getShareableLink };
};
