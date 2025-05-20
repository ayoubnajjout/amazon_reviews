import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SentimentDateChart = ({ reviews }) => {
  const chartData = useMemo(() => {
    // Group reviews by date
    const groupedByDate = {};
    
    if (!reviews || reviews.length === 0) return [];
    
    // Process each review
    reviews.forEach((review) => {
      // Extract date (assuming timestamp is in ISO format)
      const date = new Date(review.timestamp);
      const dateKey = `${date.toLocaleString('default', { month: 'short' })}'${date.getDate()}`;
      
      // Initialize date entry if it doesn't exist
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          positive: 0,
          neutral: 0,
          negative: 0
        };
      }
      
      // Increment sentiment counter
      if (review.sentiment_prediction === 'Positive') {
        groupedByDate[dateKey].positive++;
      } else if (review.sentiment_prediction === 'Neutral') {
        groupedByDate[dateKey].neutral++;
      } else if (review.sentiment_prediction === 'Negative') {
        groupedByDate[dateKey].negative++;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => {
      const monthA = a.date.substring(0, 3);
      const monthB = b.date.substring(0, 3);
      
      // First compare months
      if (monthA !== monthB) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(monthA) - months.indexOf(monthB);
      }
      
      // If months are the same, compare days
      const dayA = parseInt(a.date.split("'")[1]);
      const dayB = parseInt(b.date.split("'")[1]);
      return dayA - dayB;
    });
  }, [reviews]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Résultat des prédictions par date/heure</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="negative" stackId="a" fill="rgba(239, 68, 68, 0.7)" name="negative" />
            <Bar dataKey="neutral" stackId="a" fill="rgba(201, 203, 207, 0.7)" name="neutral" />
            <Bar dataKey="positive" stackId="a" fill="rgba(75, 192, 92, 0.7)" name="positive" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentDateChart;