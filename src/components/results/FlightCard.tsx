import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { ProcessedFlight } from '../../types/flight';
import {formatDuration, formatPrice, getTimeFromISO } from '../../utils/Helper';

interface FlightCardProps {
  flight: ProcessedFlight;
  dictionaries?: { carriers?: Record<string, string> };
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, dictionaries }) => {
  const itinerary = flight.itineraries[0];
  const firstSegment = itinerary.segments[0];
  const lastSegment = itinerary.segments[itinerary.segments.length - 1];

  const airlineName = dictionaries?.carriers?.[flight.mainAirline] || flight.mainAirline;

  return (
    <Card hover className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Flight details - Left side */}
        <div className="md:col-span-9 space-y-4">
          {/* Airline logo/name */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
              <span className="text-xs font-bold text-blue-600">
                {flight.mainAirline}
              </span>
            </div>
            <span className="text-sm text-gray-600">{airlineName}</span>
          </div>

          {/* Route information */}
          <div className="flex items-center space-x-4">
            {/* Departure */}
            <div className="flex-1">
              <div className="text-2xl font-bold">{getTimeFromISO(firstSegment.departure.at)}</div>
              <div className="text-sm text-gray-600">{firstSegment.departure.iataCode}</div>
            </div>

            {/* Duration and stops */}
            <div className="flex-1 text-center">
              <div className="text-sm text-gray-600">{formatDuration(flight.totalDuration)}</div>
              <div className="flex items-center justify-center my-2">
                <div className="h-px bg-gray-300 flex-1" />
                <div className="mx-2">
                  {flight.totalStops === 0 ? (
                    <span className="text-xs text-green-600 font-medium">Non-stop</span>
                  ) : (
                    <span className="text-xs text-gray-600">{flight.totalStops} stop{flight.totalStops > 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="h-px bg-gray-300 flex-1" />
              </div>
            </div>

            {/* Arrival */}
            <div className="flex-1 text-right">
              <div className="text-2xl font-bold">{getTimeFromISO(lastSegment.arrival.at)}</div>
              <div className="text-sm text-gray-600">{lastSegment.arrival.iataCode}</div>
            </div>
          </div>
        </div>

        {/* Price and CTA - Right side */}
        <div className="md:col-span-3 flex flex-col justify-between items-end">
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(flight.priceNumeric, flight.price.currency)}
            </div>
            <div className="text-sm text-gray-500">per person</div>
          </div>
          
          <Button variant="primary" size="md" className="mt-4 md:mt-0">
            Select Flight
          </Button>
        </div>
      </div>
    </Card>
  );
};