

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
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
    // Safety check: if no data, return empty array
    if (!priceTrend.current.length) return [];

    const allPrices = priceTrend.current.map(d => d.price).sort((a, b) => a - b);
    const filteredPrices = priceTrend.filtered.map(d => d.price).sort((a, b) => a - b);

    // Double check to avoid Infinity
    if (allPrices.length === 0) return [];

    // Create buckets
    const bucketSize = 50;
    const min = Math.floor(Math.min(...allPrices) / bucketSize) * bucketSize;
    const max = Math.ceil(Math.max(...allPrices) / bucketSize) * bucketSize;
    
    // Safety check for invalid range
    if (!isFinite(min) || !isFinite(max)) return [];

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

  // Calculate savings if filters are active
  const savingsPercent = priceTrend.lowest > 0 && priceTrend.average > 0
    ? Math.round(((priceTrend.average - priceTrend.lowest) / priceTrend.average) * 100)
    : 0;

  if (chartData.length === 0) {
    return (
      <Card className="mb-6 p-6 text-center text-gray-500">
        <p>No price data available for visualization.</p>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gradient-to-br from-slate-50 to-white border border-slate-200">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Price Analysis</h2>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {/* Average Price */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 line-clamp-2">Avg Price</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-900">{formatPrice(priceTrend.average, currency)}</span>
            <p className="text-xs text-slate-500 mt-1">all results</p>
          </div>

          {/* Lowest Price */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 line-clamp-2">Lowest</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-emerald-700">{formatPrice(priceTrend.lowest, currency)}</span>
            <p className="text-xs text-emerald-600 mt-1">best deal</p>
          </div>

          {/* Highest Price */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-300 hover:border-slate-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 line-clamp-2">Highest</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-700">{formatPrice(priceTrend.highest, currency)}</span>
            <p className="text-xs text-slate-600 mt-1">maximum</p>
          </div>

          {/* Potential Savings */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 line-clamp-2">Save</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-blue-700">{savingsPercent}%</span>
            <p className="text-xs text-blue-600 mt-1">average</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-100 overflow-x-auto">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart 
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorAllFlights" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e5e7eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#e5e7eb" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFiltered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="#e2e8f0" 
              vertical={false}
              horizontalPoints={[0]}
            />
            <XAxis 
              dataKey="price" 
              tickFormatter={(value) => `$${value}`}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              label={{ value: '# of Flights', angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#64748b', fontWeight: 500 } }}
            />
            <Tooltip 
              formatter={(value) => [`${value} flights`, '']}
              labelFormatter={(value) => `Price Range: $${value} - $${value + 50}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              labelStyle={{
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '13px'
              }}
              itemStyle={{
                color: '#475569',
                fontWeight: 600,
                fontSize: '12px'
              }}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontWeight: 600,
                color: '#334155'
              }}
              iconType="line"
            />
            <Area 
              type="monotone" 
              dataKey="allFlights" 
              stroke="#9ca3af"
              strokeWidth={2}
              fill="url(#colorAllFlights)"
              name="All Flights"
              isAnimationActive={true}
            />
            <Area 
              type="monotone" 
              dataKey="filtered" 
              stroke="#0f172a"
              strokeWidth={3}
              fill="url(#colorFiltered)"
              name="Filtered Results"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs sm:text-sm text-stone-800">
          <span className="font-semibold">💡 Tip:</span> The darker line shows your filtered results. Find the lowest point to identify the best deals.
        </p>
      </div>
    </Card>
  );
};

export default PriceChart;