/**
 * Amadeus API Service
 * Handles authentication and flight-related API calls
 * Uses axios for HTTP requests with proper error handling
 */

import axios, {type AxiosInstance } from 'axios';
import type {
  AmadeusAuthResponse,
  FlightOffersResponse,
  SearchParams,
  AirportSearchResult,
} from '../types/flight';

class AmadeusService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Initialize axios instance with base configuration
    this.api = axios.create({
      baseURL: 'https://test.api.amadeus.com/v2',
      timeout: 30000, // 30 second timeout for flight searches
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to inject access token
    this.api.interceptors.request.use(
      async (config) => {
        // Skip auth header for token endpoint
        if (config.url?.includes('/security/oauth2/token')) {
          return config;
        }

        // Ensure we have a valid token before making requests
        await this.ensureValidToken();
        
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Ensures we have a valid access token, refreshing if necessary
   * Implements automatic token refresh logic
   */
  private async ensureValidToken(): Promise<void> {
    const now = Date.now();
    
    // Check if token exists and hasn't expired (with 5 min buffer)
    if (this.accessToken && this.tokenExpiry > now + 300000) {
      return;
    }

    // Token expired or doesn't exist, get a new one
    await this.authenticate();
  }

  /**
   * Authenticates with Amadeus API and retrieves access token
   * Token is cached and automatically refreshed when needed
   */
  private async authenticate(): Promise<void> {
    try {
      const apiKey = import.meta.env.VITE_AMADEUS_API_KEY;
      const apiSecret = import.meta.env.VITE_AMADEUS_API_SECRET;

      if (!apiKey || !apiSecret) {
        throw new Error('Amadeus API credentials not configured');
      }

      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', apiKey);
      params.append('client_secret', apiSecret);

      const response = await axios.post<AmadeusAuthResponse>(
        'https://test.api.amadeus.com/v1/security/oauth2/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry time (subtract 5 minutes for safety margin)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  /**
   * Searches for airports based on keyword
   * Used for autocomplete functionality in search form
   */
  async searchAirports(keyword: string): Promise<AirportSearchResult[]> {
    try {
      // Ensure we have a valid token
      await this.ensureValidToken();
      
      const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params: {
          subType: 'AIRPORT,CITY',
          keyword,
          'page[limit]': 10,
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Airport search failed:', error);
      throw new Error('Failed to search airports');
    }
  }

  /**
   * Searches for flight offers based on search parameters
   * Returns comprehensive flight data including pricing and itineraries
   */
  async searchFlights(params: SearchParams): Promise<FlightOffersResponse> {
    try {
      const queryParams: Record<string, any> = {
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        adults: params.adults,
        max: params.maxResults || 50, // Limit results for performance
        currencyCode: params.currencyCode || 'USD',
      };

      // Add optional parameters if provided
      if (params.returnDate) {
        queryParams.returnDate = params.returnDate;
      }
      
      if (params.children) {
        queryParams.children = params.children;
      }
      
      if (params.infants) {
        queryParams.infants = params.infants;
      }
      
      if (params.travelClass) {
        queryParams.travelClass = params.travelClass;
      }
      
      if (params.nonStop !== undefined) {
        queryParams.nonStop = params.nonStop;
      }

      const response = await this.api.get<FlightOffersResponse>(
        '/shopping/flight-offers',
        { params: queryParams }
      );

      return response.data;
    } catch (error: any) {
      console.error('Flight search failed:', error);
      
      // Provide user-friendly error messages
      if (error.response?.status === 400) {
        throw new Error('Invalid search parameters. Please check your inputs.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check API credentials.');
      } else if (error.response?.status === 404) {
        throw new Error('No flights found for this route.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again in a moment.');
      }
      
      throw new Error('Failed to search flights. Please try again.');
    }
  }

  /**
   * Gets airline name from carrier code using cached dictionaries
   * Falls back to carrier code if name not found
   */
  getAirlineName(code: string, dictionaries?: Record<string, string>): string {
    return dictionaries?.[code] || code;
  }
}

// Export singleton instance
export const amadeusService = new AmadeusService();