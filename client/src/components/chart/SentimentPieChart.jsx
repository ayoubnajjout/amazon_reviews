import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * SentimentPieChart component using Recharts for sentiment distribution
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Review data array
 * @param {String} props.title - Chart title
 */
const SentimentPieChart = ({ reviews, title = "Sentiment Distribution" }) => {
  // Color scheme for different sentiments
  const COLORS = {
    'Positive': 'rgba(75, 192, 92, 0.7)', // Green
    'Neutral': 'rgba(201, 203, 207, 0.7)',  // Yellow
    'Negative': 'rgba(239, 68, 68, 0.7)'  // Red
  };
  
  // Process data for the chart
  const processData = () => {
    const sentimentCounts = { 
      'Positive': 0, 
      'Neutral': 0, 
      'Negative': 0 
    };
    
    reviews.forEach(review => {
      if (review && review.sentiment_prediction) {
        sentimentCounts[review.sentiment_prediction]++;
      }
    });
    
    return [
      { name: 'Positive', value: sentimentCounts['Positive'] },
      { name: 'Neutral', value: sentimentCounts['Neutral'] },
      { name: 'Negative', value: sentimentCounts['Negative'] }
    ];
  };

  const data = processData();
  
  // Custom tooltip to show percentage
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = data.reduce((sum, entry) => sum + entry.value, 0);
      const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0.0';
      
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px' 
        }}>
          <p className="tooltip-label">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="tooltip-percentage">{`${percentage}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card h-full">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => value > 0 ? name : ''}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentPieChart;