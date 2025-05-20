import React from 'react';

/**
 * SentimentCounters component for displaying counts of each sentiment type
 * @param {Object} props - Component props
 * @param {Object} props.sentimentCounts - Object containing counts for each sentiment
 */
const SentimentCounters = ({ sentimentCounts }) => {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Sentiment Counters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Positive Counter */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-green-600 text-5xl font-bold mb-2">
            {sentimentCounts.Positive}
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-green-800 font-medium">Positive Reviews</span>
          </div>
        </div>
        
        {/* Neutral Counter */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-yellow-600 text-5xl font-bold mb-2">
            {sentimentCounts.Neutral}
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span className="text-yellow-800 font-medium">Neutral Reviews</span>
          </div>
        </div>
        
        {/* Negative Counter */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-red-600 text-5xl font-bold mb-2">
            {sentimentCounts.Negative}
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span className="text-red-800 font-medium">Negative Reviews</span>
          </div>
        </div>
      </div>
      
      {/* Total counter */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          <span className="text-blue-800 font-medium">Total Reviews</span>
        </div>
        <div className="text-blue-600 text-2xl font-bold">
          {sentimentCounts.Positive + sentimentCounts.Neutral + sentimentCounts.Negative}
        </div>
      </div>
      
      {/* Positive Rate */}
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Positive Rate</span>
          <span className="text-sm font-medium text-gray-700">
            {calculatePercentage(sentimentCounts.Positive, 
              sentimentCounts.Positive + sentimentCounts.Neutral + sentimentCounts.Negative)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full" 
            style={{ width: `${calculatePercentage(sentimentCounts.Positive, 
              sentimentCounts.Positive + sentimentCounts.Neutral + sentimentCounts.Negative)}%` }}>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate percentages
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export default SentimentCounters;