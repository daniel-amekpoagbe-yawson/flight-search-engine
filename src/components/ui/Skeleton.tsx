import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 animate-pulse rounded ${className}`}
        />
      ))}
    </>
  );
};

export const SkeletonFlightCard: React.FC = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-4 space-y-4">
      {/* Airline + Stops */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="w-48 h-4" />
        </div>
        <Skeleton className="w-20 h-4" />
      </div>

      {/* Route Line */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-9">
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-24 h-8" />
          </div>
        </div>
        <div className="md:col-span-3">
          <Skeleton className="w-full h-8" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonFilterPanel: React.FC = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-6">
      {/* Header */}
      <Skeleton className="w-24 h-6" />

      {/* Price section */}
      <div className="space-y-2">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-full h-10" />
      </div>

      {/* Stops section */}
      <div className="space-y-2">
        <Skeleton className="w-16 h-4" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-6" />
        ))}
      </div>

      {/* Airlines section */}
      <div className="space-y-2">
        <Skeleton className="w-20 h-4" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-6" />
        ))}
      </div>
    </div>
  );
};
