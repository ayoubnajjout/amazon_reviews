import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const SentimentProductPieChart = ({ reviews, productCode = "B00004Y2UT" }) => {
  const chartData = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    
    // Filter reviews for the specific product if needed
    const productReviews = productCode ? 
      reviews.filter(review => review.asin === productCode) : 
      reviews;
    
    // Count sentiments
    const counts = { 
      positive: 0, 
      neutral: 0, 
      negative: 0 
    };
    
    productReviews.forEach(review => {
      if (review.sentiment_prediction === 'Positive') {
        counts.positive++;
      } else if (review.sentiment_prediction === 'Neutral') {
        counts.neutral++;
      } else if (review.sentiment_prediction === 'Negative') {
        counts.negative++;
      }
    });
    
    // Calculate percentages
    const total = counts.positive + counts.neutral + counts.negative;
    
    // Convert to array format for PieChart
    return [
      { name: 'Positive', value: counts.positive, percentage: Math.round((counts.positive / total) * 100) },
      { name: 'Neutral', value: counts.neutral, percentage: Math.round((counts.neutral / total) * 100) },
      { name: 'Negative', value: counts.negative, percentage: Math.round((counts.negative / total) * 100) }
    ];
  }, [reviews, productCode]);

  // Define colors for each segment
  const COLORS = [
    'rgb(75, 192, 92)', // Green
    'rgb(201, 203, 207)',  // Yellow
    'rgb(239, 68, 68)'  // Red
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-semibold mb-4">
        Scoring relatif au produit portant le code asin = {productCode}
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) => `${name}: ${percentage}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} (${chartData.find(item => item.name === name)?.percentage || 0}%)`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentProductPieChart;
