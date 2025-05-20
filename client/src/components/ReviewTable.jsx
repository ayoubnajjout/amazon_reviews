import React, { useState } from 'react';

function ReviewTable({ reviews }) {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  // Pagination logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderStars = (rating) => {
    const roundedRating = Math.round(rating);
    return (
      <span className="text-review-yellow">
        {'★'.repeat(roundedRating)}
        {'☆'.repeat(5 - roundedRating)}
      </span>
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getSentimentBadge = (sentiment) => {
    let colorClasses = 'px-2 py-1 rounded text-xs font-bold ';

    switch (sentiment) {
      case 'Positive':
        colorClasses += 'bg-green-100 text-green-800';
        break;
      case 'Negative':
        colorClasses += 'bg-red-100 text-red-800';
        break;
      default:
        colorClasses += 'bg-gray-100 text-gray-800';
    }

    return <span className={colorClasses}>{sentiment}</span>;
  };

  return (
    <div className="card overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentReviews.length > 0 ? (
              currentReviews.map((review, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(review.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {review.reviewerName?.split('"')[0].trim() || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.asin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{renderStars(review.overall)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getSentimentBadge(review.sentiment_prediction)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">{review.reviewText}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No reviews yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Compact Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-4 space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              return (
                page === 1 || 
                page === totalPages || 
                Math.abs(currentPage - page) <= 2
              );
            })
            .reduce((acc, page, i, arr) => {
              if (i > 0 && page - arr[i - 1] > 1) {
                acc.push('ellipsis');
              }
              acc.push(page);
              return acc;
            }, [])
            .map((item, i) =>
              item === 'ellipsis' ? (
                <span key={i} className="px-2 py-1 text-gray-500">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => changePage(item)}
                  className={`px-3 py-1 rounded ${
                    currentPage === item
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {item}
                </button>
              )
            )}
        </div>
      )}
    </div>
  );
}

export default ReviewTable;
