import React from 'react';
import { Bar } from 'recharts';
import ReviewChartContainer from './ReviewChartContainer';

/**
 * BarChart component using Recharts for rating distribution
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Review data array
 * @param {String} props.title - Chart title
 */
const ReviewBarChart = ({ reviews, title = "Rating Distribution" }) => {
  // Process data for the chart
  const processData = () => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      if (review && review.overall) {
        const rating = Math.round(review.overall);
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating]++;
        }
      }
    });

    return [
      { name: '1 Star', count: ratingCounts[1], fill: '#FF6384' },
      { name: '2 Stars', count: ratingCounts[2], fill: '#FF9F40' },
      { name: '3 Stars', count: ratingCounts[3], fill: '#FFCD56' },
      { name: '4 Stars', count: ratingCounts[4], fill: '#4BC0C0' },
      { name: '5 Stars', count: ratingCounts[5], fill: '#36A2EB' }
    ];
  };

  const chartData = processData();

  return (
    <ReviewChartContainer 
      data={chartData}
      title={title}
      chartType="bar"
      xAxisDataKey="name"
      barDataKey="count"
      barComponent={<Bar dataKey="count" fill="#8884d8" />}
    />
  );
};

export default ReviewBarChart;