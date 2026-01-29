import React from 'react';
import { FlightCard } from './FlightCard';
import { SkeletonFlightCard } from '../ui/Skeleton';
import type { ProcessedFlight } from '../../types/flight';

interface FlightListProps {
  flights: ProcessedFlight[];
  dictionaries?: { carriers?: Record<string, string> };
  isLoading?: boolean;
}

export const FlightList: React.FC<FlightListProps> = ({
  flights,
  dictionaries,
  isLoading,
}) => {
  // Find the cheapest flight
  const cheapestFlightId = flights.length > 0
    ? flights.reduce((minFlight, currentFlight) =>
        currentFlight.priceNumeric < minFlight.priceNumeric ? currentFlight : minFlight
      ).id
    : null;

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonFlightCard key={i} />
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">✈️</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No flights found</h3>
        <p className="text-gray-500">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div>
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          dictionaries={dictionaries}
          isBestDeal={flight.id === cheapestFlightId}
        />
      ))}
    </div>
  );
};