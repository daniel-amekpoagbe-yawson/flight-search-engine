import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import type { SearchParams } from '../types/flight';
import { useFlightFilters, useFlightSearch, useFlightSort, usePriceTrend } from '../hooks/useFlights';
import { SearchForm } from '../components/search/SearchForm';
import { PriceChart } from '../components/charts/PriceChart';
import { FilterPanel } from '../components/filters/FilterPanel';
import { FlightList } from '../components/results/FlightList';
import { SortControls } from '../components/results/SortControls';
import { Pagination } from '../components/results/Pagination';

// Define search params validation
type FlightSearchSchema = Partial<SearchParams>;

function FlightSearchPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParams = Route.useSearch();
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when search params change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams.origin, searchParams.destination, searchParams.departureDate]);

  // Determine if we have enough params to search
  const hasRequiredParams = !!(searchParams.origin && searchParams.destination && searchParams.departureDate);
  const activeSearchParams = hasRequiredParams ? (searchParams as SearchParams) : null;

  // Update URL when search params change
  const handleSearch = (params: SearchParams) => {
    navigate({
      search: (prev) => ({ ...prev, ...params }),
    });
  };

  // Fetch flights with pagination
  const { 
    flights, 
    allFlights,
    dictionaries, 
    isLoading, 
    error,
    prefetchNextPage,
  } = useFlightSearch(activeSearchParams, currentPage);

  // Prefetch next page on mount and page change
  useEffect(() => {
    prefetchNextPage();
  }, [currentPage, prefetchNextPage]);

  // Apply filters to ALL flights (not paginated)
  const { filters, filteredFlights, updateFilter, resetFilters, filterOptions, hasActiveFilters } =
    useFlightFilters(allFlights);

  // Sort results
  const { sortedFlights, sortField, sortDirection, toggleSort } = useFlightSort(filteredFlights);

  // Paginate the filtered AND sorted results (10 items per page)
  const pageSize = 10;
  const totalFilteredPages = Math.ceil(sortedFlights.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedSortedFlights = sortedFlights.slice(startIdx, endIdx);

  // Generate price trend data
  const priceTrend = usePriceTrend(allFlights, filteredFlights);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Search Form - Pass URL params as initial values if needed, or controlled */}
          <SearchForm onSearch={handleSearch} isLoading={isLoading} initialValues={activeSearchParams || undefined} />

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
              <p className="text-sm font-semibold text-red-900">✕ Error</p>
              <p className="text-red-800 font-medium mt-2">{error.message}</p>
            </div>
          )}

          {/* Results Section */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Searching flights...</p>
              </div>
            </div>
          )}

          {!isLoading && flights.length === 0 && activeSearchParams && (
            <div className="bg-blue-50 border border-gray-500 rounded-xl p-8 text-center">
              <p className="text-stone-800 font-semibold">No flights found</p>
              <p className="text-stone-600 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          )}

          {!isLoading && flights.length > 0 && (
            <>
              {/* Price Chart */}
              <PriceChart priceTrend={priceTrend} />

              {/* Filters and Results */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Filter Panel - Sidebar */}
                <div className="lg:col-span-1">
                  <FilterPanel
                    filters={filters}
                    updateFilter={updateFilter}
                    resetFilters={resetFilters}
                    hasActiveFilters={hasActiveFilters}
                    filterOptions={filterOptions}
                    dictionaries={dictionaries?.carriers}
                    resultCount={filteredFlights.length}
                  />
                </div>

                {/* Flight Results */}
                <div className="lg:col-span-3">
                  <SortControls
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={toggleSort}
                  />
                  <FlightList flights={paginatedSortedFlights} dictionaries={dictionaries} isLoading={isLoading} />
                  
                  {/* Pagination Controls */}
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredFlights.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    isLoading={isLoading}
                    hasNextPage={currentPage < totalFilteredPages}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: FlightSearchPage,
  validateSearch: (search: Record<string, unknown>): FlightSearchSchema => {
    return {
      origin: search.origin as string,
      destination: search.destination as string,
      departureDate: search.departureDate as string,
      returnDate: search.returnDate as string,
      adults: Number(search.adults) || 1,
      currencyCode: search.currencyCode as string,
      // maxResults is handled internally for pagination
    };
  },
});