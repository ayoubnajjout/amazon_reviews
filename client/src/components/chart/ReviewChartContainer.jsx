import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * ChartContainer is a reusable wrapper component for Recharts visualizations
 * It handles the responsive container and basic chart structure
 */
const ReviewChartContainer = ({ 
  data, 
  title, 
  chartType, 
  xAxisDataKey, 
  barDataKey,
  barComponent,
  children 
}) => {
  return (
    <div className="chart-container">
      <h2>{title}</h2>
      <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value}`, 'Count']}
                labelFormatter={(label) => `Rating: ${label}`}
              />
              <Legend />
              {barComponent || <Bar dataKey={barDataKey} fill="#8884d8" />}
            </BarChart>
          ) : (
            // If not a bar chart, render children
            children
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReviewChartContainer;