import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LatestReview from './LatestReview';
import ReviewTable from './ReviewTable';
import SentimentChart from './chart/SentimentChart';
import SentimentPieChart from './chart/SentimentPieChart';
import SentimentLineChart from './chart/SentimentLineChart';
import SentimentRadarChart from './chart/SentimentRadarChart';
import SentimentCounters from './chart/SentimentCounters';
import SentimentStats from './chart/SentimentStats';
import SentimentDateChart from './chart/SentimentDateChart';
import SentimentProductPieChart from './chart/SentimentProductPieChart';

function DashboardHistory() {
  const [latestReview, setLatestReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState({
    Positive: 0,
    Neutral: 0,
    Negative: 0,
  });
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/reviews');
        const data = response.data;
        console.log('data',data);
          
        // Sort by timestamp (descending)
        const sortedData = [...data].sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        setReviews(sortedData);
        
        // Set latest review
        if (sortedData.length > 0) {
          setLatestReview(sortedData[0]);
        }
        
        // Count sentiments
        const counts = { Positive: 0, Neutral: 0, Negative: 0 };
        sortedData.forEach((review) => {
          const sentiment = review.sentiment_prediction;
          if (sentiment && counts[sentiment] !== undefined) {
            counts[sentiment]++;
          }
        });
        setSentimentCounts(counts);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    
    fetchReviews();
    
    // Optional: Refresh every 10 seconds
    const interval = setInterval(fetchReviews, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        History Amazon Reviews Dashboard
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <SentimentCounters sentimentCounts={sentimentCounts} />
        </div>

        <div className="lg:col-span-3">
          <ReviewTable reviews={reviews} />
        </div>

        <div className="lg:col-span-1">
          <LatestReview review={latestReview} />
        </div>

        <div className="lg:col-span-2">
          <SentimentChart sentimentCounts={sentimentCounts} />
        </div>
        
        <div className="lg:col-span-3">
          <SentimentStats reviews={reviews} />
        </div>

        <div className="lg:col-span-3">
          <SentimentPieChart reviews={reviews} />
        </div>

        <div className="lg:col-span-2">
          <SentimentDateChart reviews={reviews} />
        </div>

        <div className="lg:col-span-1">
          <SentimentProductPieChart reviews={reviews} productCode="B00004Y2UT" />
        </div>
        
        {/* <div className="lg:col-span-3">
          <SentimentLineChart reviews={reviews} />
        </div> */}

        {/* <div className="lg:col-span-2">
          <SentimentRadarChart reviews={reviews} />
        </div> */}
      </div>
    </div>
  );
}

export default DashboardHistory;