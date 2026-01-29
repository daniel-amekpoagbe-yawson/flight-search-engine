import React from 'react';

interface SortControlsProps {
  sortField: 'price' | 'duration' | 'departure';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'price' | 'duration' | 'departure') => void;
}

export const SortControls: React.FC<SortControlsProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {

  return (
    <div className="flex items-center gap-3 mb-6">
      <label className="text-sm font-semibold text-gray-700">Sort by:</label>
      <div className="flex gap-2">
        {(['price', 'duration', 'departure'] as const).map((field) => (
          <button
            key={field}
            onClick={() => onSort(field)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortField === field
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortField === field && (
              <span className="ml-1">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
