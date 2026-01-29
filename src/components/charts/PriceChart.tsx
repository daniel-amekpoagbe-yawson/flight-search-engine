

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import type { PriceTrend } from '../../types/flight';
import { formatPrice } from '../../utils/Helper';

interface PriceChartProps {
  priceTrend: PriceTrend;
  currency?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  priceTrend,
  currency = 'USD',
}) => {
  // Group data by price buckets for cleaner visualization
  const chartData = useMemo(() => {
    const allPrices = priceTrend.current.map(d => d.price).sort((a, b) => a - b);
    const filteredPrices = priceTrend.filtered.map(d => d.price).sort((a, b) => a - b);

    // Create buckets
    const bucketSize = 50;
    const min = Math.floor(Math.min(...allPrices) / bucketSize) * bucketSize;
    const max = Math.ceil(Math.max(...allPrices) / bucketSize) * bucketSize;
    
    const buckets: Record<number, { all: number; filtered: number }> = {};
    
    for (let i = min; i <= max; i += bucketSize) {
      buckets[i] = { all: 0, filtered: 0 };
    }

    // Count flights in each bucket
    allPrices.forEach(price => {
      const bucket = Math.floor(price / bucketSize) * bucketSize;
      if (buckets[bucket]) buckets[bucket].all++;
    });

    filteredPrices.forEach(price => {
      const bucket = Math.floor(price / bucketSize) * bucketSize;
      if (buckets[bucket]) buckets[bucket].filtered++;
    });

    return Object.entries(buckets).map(([price, counts]) => ({
      price: Number(price),
      allFlights: counts.all,
      filtered: counts.filtered,
    }));
  }, [priceTrend.current, priceTrend.filtered]);

  return (
    <Card className="mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Price Distribution</h2>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-600">Average: </span>
            <span className="font-semibold">{formatPrice(priceTrend.average, currency)}</span>
          </div>
          <div>
            <span className="text-gray-600">Lowest: </span>
            <span className="font-semibold text-green-600">{formatPrice(priceTrend.lowest, currency)}</span>
          </div>
          <div>
            <span className="text-gray-600">Highest: </span>
            <span className="font-semibold text-red-600">{formatPrice(priceTrend.highest, currency)}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="price" 
            tickFormatter={(value) => `$${value}`}
            label={{ value: 'Price', position: 'insideBottom', offset: -5 }}
          />
          <YAxis label={{ value: '# of Flights', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value) => [`${value} flights`, '']}
            labelFormatter={(value) => `Price: $${value}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="allFlights" 
            stroke="#9CA3AF" 
            strokeWidth={2}
            name="All Flights"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="filtered" 
            stroke="#3B82F6" 
            strokeWidth={3}
            name="Filtered"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};