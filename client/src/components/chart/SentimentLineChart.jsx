import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * SentimentLineChart component for displaying sentiment trends over time
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Review data array
 * @param {String} props.title - Chart title
 */
const SentimentLineChart = ({ reviews, title = "Sentiment & Rating Over Time" }) => {
  // Process data for the chart
  const processData = () => {
    if (!reviews || reviews.length === 0) return [];
    
    // Sort reviews by timestamp if available
    const sortedReviews = [...reviews].sort((a, b) => {
      return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
    });
    
    // Map reviews to chart data format and convert sentiment to numeric value
    return sortedReviews.map((review, index) => {
      // Convert sentiment to numeric value for charting
      const sentimentValue = 
        review.sentiment_prediction === 'Positive' ? 5 :
        review.sentiment_prediction === 'Neutral' ? 3 :
        review.sentiment_prediction === 'Negative' ? 1 : 0;
      
      return {
        name: formatTimestamp(review.timestamp) || `Review ${index + 1}`,
        rating: review.overall || 0,
        sentiment: sentimentValue,
        product: review.asin || 'Unknown'
      };
    });
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const data = processData();

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
            <Tooltip formatter={(value, name) => {
              if (name === 'sentiment') {
                return [
                  value === 5 ? 'Positive' : value === 3 ? 'Neutral' : value === 1 ? 'Negative' : 'Unknown',
                  'Sentiment'
                ];
              }
              return [value, name];
            }} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="rating" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              name="Rating"
              strokeWidth={2}
            />
            <Line 
              type="stepAfter" 
              dataKey="sentiment" 
              stroke="#82ca9d" 
              name="Sentiment"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentLineChart;