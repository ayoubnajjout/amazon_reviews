import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

/**
 * SentimentRadarChart visualizes review metrics in a radar/spider chart
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Review data array
 * @param {String} props.title - Chart title
 */
const SentimentRadarChart = ({ reviews, title = "Product Sentiment Analysis" }) => {
  // Process data for the radar chart
  const processData = () => {
    if (!reviews || reviews.length === 0) return [];
    
    // Extract available products
    const products = {};
    reviews.forEach(review => {
      if (review.asin && !products[review.asin]) {
        products[review.asin] = {
          id: review.asin,
          name: review.asin,
          reviews: []
        };
      }
      
      if (review.asin) {
        products[review.asin].reviews.push(review);
      }
    });
    
    // Calculate metrics for each product
    // For each product we'll track:
    // - Average rating
    // - Positive sentiment percentage
    // - Negative sentiment percentage
    const productMetrics = [];
    
    Object.values(products).forEach(product => {
      if (product.reviews.length > 0) {
        // Calculate average rating
        const avgRating = product.reviews.reduce((sum, review) => 
          sum + (review.overall || 0), 0) / product.reviews.length;
        
        // Calculate sentiment percentages
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        
        product.reviews.forEach(review => {
          if (review.sentiment_prediction === 'Positive') positiveCount++;
          else if (review.sentiment_prediction === 'Negative') negativeCount++;
          else neutralCount++;
        });
        
        const positivePercentage = (positiveCount / product.reviews.length) * 5; // Scale to 0-5
        const negativePercentage = (negativeCount / product.reviews.length) * 5; // Scale to 0-5
        const neutralPercentage = (neutralCount / product.reviews.length) * 5; // Scale to 0-5
        
        // Add normalized metrics to the data array
        productMetrics.push({
          subject: product.name.substring(0, 6), // Show first few chars of product ID
          'Avg Rating': avgRating,
          'Positive': positivePercentage,
          'Neutral': neutralPercentage,
          'Negative': negativePercentage
        });
      }
    });
    
    return productMetrics;
  };

  const data = processData();
  
  // If we don't have enough data, show a placeholder
  if (data.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="chart-wrapper" style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Not enough data for radar chart visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <RadarChart outerRadius={90} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 5]} />
            <Radar
              name="Avg Rating"
              dataKey="Avg Rating"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name="Positive"
              dataKey="Positive"
              stroke="#4BC0C0"
              fill="#4BC0C0"
              fillOpacity={0.6}
            />
            <Radar
              name="Neutral"
              dataKey="Neutral"
              stroke="#FFCD56"
              fill="#FFCD56"
              fillOpacity={0.6}
            />
            <Radar
              name="Negative"
              dataKey="Negative"
              stroke="#FF6384"
              fill="#FF6384"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentRadarChart;