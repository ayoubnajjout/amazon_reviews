import React from 'react';

/**
 * SentimentStats component for displaying sentiment statistics
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Review data array
 */
const SentimentStats = ({ reviews }) => {
  // Process reviews data
  const processData = () => {
    const stats = {
      productStats: {},
      totalPositive: 0,
      totalNeutral: 0,
      totalNegative: 0,
      avgRating: 0,
      ratingsDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    };
    
    if (!reviews || reviews.length === 0) return stats;
    
    reviews.forEach(review => {
      // Count sentiments
      if (review.sentiment_prediction === 'Positive') stats.totalPositive++;
      else if (review.sentiment_prediction === 'Negative') stats.totalNegative++;
      else stats.totalNeutral++;
      
      // Count ratings
      const rating = Math.round(review.overall);
      if (rating >= 1 && rating <= 5) {
        stats.ratingsDistribution[rating]++;
      }
      
      // Track product-specific stats
      if (review.asin) {
        if (!stats.productStats[review.asin]) {
          stats.productStats[review.asin] = {
            positive: 0,
            neutral: 0,
            negative: 0,
            count: 0,
            avgRating: 0,
            totalRating: 0
          };
        }
        
        const productStat = stats.productStats[review.asin];
        productStat.count++;
        
        if (review.sentiment_prediction === 'Positive') productStat.positive++;
        else if (review.sentiment_prediction === 'Negative') productStat.negative++;
        else productStat.neutral++;
        
        if (review.overall) {
          productStat.totalRating += review.overall;
          productStat.avgRating = productStat.totalRating / productStat.count;
        }
      }
    });
    
    // Calculate overall average rating
    stats.avgRating = reviews.reduce((sum, review) => sum + (review.overall || 0), 0) / reviews.length;
    
    return stats;
  };
  
  const stats = processData();
  const total = reviews.length;
  
  // Calculate percentages
  const positivePercentage = total > 0 ? Math.round((stats.totalPositive / total) * 100) : 0;
  const neutralPercentage = total > 0 ? Math.round((stats.totalNeutral / total) * 100) : 0;
  const negativePercentage = total > 0 ? Math.round((stats.totalNegative / total) * 100) : 0;
  
  // Sort products by number of reviews
  const topProducts = Object.entries(stats.productStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Sentiment Statistics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Overview */}
        <div>
          <h3 className="text-lg font-medium mb-3">Sentiment Overview</h3>
          
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Sentiment</th>
                <th className="text-right py-2">Count</th>
                <th className="text-right py-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Positive
                </td>
                <td className="text-right font-medium">{stats.totalPositive}</td>
                <td className="text-right font-medium">{positivePercentage}%</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  Neutral
                </td>
                <td className="text-right font-medium">{stats.totalNeutral}</td>
                <td className="text-right font-medium">{neutralPercentage}%</td>
              </tr>
              <tr>
                <td className="py-2 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Negative
                </td>
                <td className="text-right font-medium">{stats.totalNegative}</td>
                <td className="text-right font-medium">{negativePercentage}%</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 font-medium">Total</td>
                <td className="text-right font-medium">{total}</td>
                <td className="text-right font-medium">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Top Products Sentiment */}
        <div>
          <h3 className="text-lg font-medium mb-3">Top Products</h3>
          
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map(([productId, data]) => (
                <div key={productId} className="border p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{productId}</span>
                    <span className="text-sm text-gray-500">{data.count} reviews</span>
                  </div>
                  
                  <div className="flex items-center mb-1">
                    <span className="text-sm text-gray-600 w-20">Positive:</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${data.count > 0 ? (data.positive / data.count) * 100 : 0}%` }}>
                      </div>
                    </div>
                    <span className="text-sm">{data.positive}</span>
                  </div>
                  
                  <div className="flex items-center mb-1">
                    <span className="text-sm text-gray-600 w-20">Neutral:</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${data.count > 0 ? (data.neutral / data.count) * 100 : 0}%` }}>
                      </div>
                    </div>
                    <span className="text-sm">{data.neutral}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-20">Negative:</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${data.count > 0 ? (data.negative / data.count) * 100 : 0}%` }}>
                      </div>
                    </div>
                    <span className="text-sm">{data.negative}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center p-4">No product data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentStats;