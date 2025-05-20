import React, { useEffect, useRef } from 'react';

function LatestReview({ review }) {
  const reviewCardRef = useRef(null);

  // Add flash animation when new review comes in
  useEffect(() => {
    if (review && reviewCardRef.current) {
      reviewCardRef.current.classList.add('animate-flash');
      
      // Remove animation class after it completes
      const timer = setTimeout(() => {
        if (reviewCardRef.current) {
          reviewCardRef.current.classList.remove('animate-flash');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [review]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="card h-full" ref={reviewCardRef}>
      <h2 className="text-xl font-semibold mb-4">Latest Review</h2>
      
      {review ? (
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">
              {review.reviewerName?.split('"')[0].trim() || 'Anonymous'}
            </span>
            <div className="flex space-x-2">
              <span className="text-review-yellow font-bold">
                Rating: {review.overall} / 5
              </span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                review.sentiment_prediction === 'Positive' 
                  ? 'bg-green-100 text-green-800' 
                  : review.sentiment_prediction === 'Negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {review.sentiment_prediction}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-700 leading-relaxed">
            {review.reviewText?.substring(0, 150)}
            {review.reviewText?.length > 150 ? '...' : ''}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Product ID: {review.asin}</span>
            <span>{formatTimestamp(review.timestamp)}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-500">
          Waiting for reviews...
        </div>
      )}
    </div>
  );
}

export default LatestReview;