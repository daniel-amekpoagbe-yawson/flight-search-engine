import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PriceFilter } from './PriceFilter';
import { StopsFilter } from './StopsFilter';
import { AirlineFilter } from './AirlineFilter';
import { TimeFilter } from './TimeFilter';
import type { FilterState } from '../../types/flight';

interface FilterPanelProps {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  filterOptions: {
    airlines: string[];
    priceRange: [number, number];
    durationRange: [number, number];
  };
  dictionaries?: Record<string, string>;
  resultCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
  filterOptions,
  dictionaries,
  resultCount,
}) => {
  return (
    <Card className="sticky top-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Result count */}
        <div className="text-sm text-gray-600">
          {resultCount} flight{resultCount !== 1 ? 's' : ''} found
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Price Filter */}
        <PriceFilter
          value={filters.priceRange}
          min={filterOptions.priceRange[0]}
          max={filterOptions.priceRange[1]}
          onChange={(value) => updateFilter('priceRange', value)}
        />

        <div className="border-t border-gray-200" />

        {/* Departure Time Filter */}
        <TimeFilter
          label="Departure Time"
          value={filters.departureTimeRange}
          onChange={(value) => updateFilter('departureTimeRange', value)}
        />

        <div className="border-t border-gray-200" />

        {/* Arrival Time Filter */}
        <TimeFilter
          label="Arrival Time"
          value={filters.arrivalTimeRange}
          onChange={(value) => updateFilter('arrivalTimeRange', value)}
        />

        <div className="border-t border-gray-200" />

        {/* Stops Filter */}
        <StopsFilter
          value={filters.stops}
          onChange={(value) => updateFilter('stops', value)}
        />

        <div className="border-t border-gray-200" />

        {/* Airline Filter */}
        <AirlineFilter
          airlines={filterOptions.airlines}
          selected={filters.airlines}
          onChange={(value) => updateFilter('airlines', value)}
          dictionaries={dictionaries}
        />
      </div>
    </Card>
  );
};