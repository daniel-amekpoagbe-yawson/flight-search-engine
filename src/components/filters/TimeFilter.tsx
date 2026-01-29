import React from 'react';

interface TimeFilterProps {
  value: [number, number];
  label: string;
  onChange: (value: [number, number]) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({ value, label, onChange }) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= value[1]) {
      onChange([newMin, value[1]]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= value[0]) {
      onChange([value[0], newMax]);
    }
  };

  const formatHour = (hour: number): string => {
    return hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      
      <div className="space-y-2">
        {/* Min Time */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">From</span>
            <span className="text-sm font-medium text-gray-700">{formatHour(value[0])}</span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={value[0]}
            onChange={handleMinChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Max Time */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">To</span>
            <span className="text-sm font-medium text-gray-700">{formatHour(value[1])}</span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={value[1]}
            onChange={handleMaxChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
};
