import React, { useState, useEffect } from 'react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

/**
 * ReviewComposedChart combines multiple chart types in one visualization
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Review data array
 * @param {String} props.title - Chart title
 */
const ReviewComposedChart = ({ reviews, title = "Review Metrics Over Time" }) => {
  const [chartData, setChartData] = useState([]);
  
  // Process data for the chart
  useEffect(() => {
    if (!reviews || reviews.length === 0) {
      setChartData([]);
      return;
    }
    
    // Group reviews by date (or by index if date not available)
    const reviewsByDate = {};
    
    reviews.forEach(review => {
      // Try to get a date key
      const dateKey = review.reviewTime || 'Unknown';
      
      if (!reviewsByDate[dateKey]) {
        reviewsByDate[dateKey] = {
          reviews: [],
          totalRating: 0,
          helpfulVotes: 0,
          totalVotes: 0
        };
      }
      
      reviewsByDate[dateKey].reviews.push(review);
      reviewsByDate[dateKey].totalRating += review.overall || 0;
      
      if (review.helpful && Array.isArray(review.helpful) && review.helpful.length >= 2) {
        reviewsByDate[dateKey].helpfulVotes += review.helpful[0] || 0;
        reviewsByDate[dateKey].totalVotes += review.helpful[1] || 0;
      }
    });
    
    // Convert to array format for chart
    const chartData = Object.keys(reviewsByDate).map(date => {
      const data = reviewsByDate[date];
      const reviewCount = data.reviews.length;
      
      return {
        date,
        avgRating: reviewCount > 0 ? data.totalRating / reviewCount : 0,
        reviewCount: reviewCount,
        helpfulRatio: data.totalVotes > 0 ? (data.helpfulVotes / data.totalVotes) * 100 : 0
      };
    });
    
    // Sort by date if possible
    chartData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Handle invalid dates
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      
      return dateA - dateB;
    });
    
    setChartData(chartData);
  }, [reviews]);
  
  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h2>{title}</h2>
        <div className="chart-wrapper" style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Waiting for review data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h2>{title}</h2>
      <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="reviewCount" 
              fill="#8884d8" 
              stroke="#8884d8" 
              name="Review Count" 
            />
            <Bar 
              yAxisId="left" 
              dataKey="helpfulRatio" 
              fill="#82ca9d" 
              name="Helpful Ratio (%)" 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="avgRating" 
              stroke="#ff7300" 
              name="Avg Rating" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReviewComposedChart;