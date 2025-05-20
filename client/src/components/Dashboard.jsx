import React, { useState, useEffect, useRef } from 'react';
import LatestReview from './LatestReview';
import ReviewTable from './ReviewTable';
import SentimentChart from './chart/SentimentChart';

function Dashboard() {
  const [latestReview, setLatestReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState({
    Positive: 0,
    Neutral: 0,
    Negative: 0,
  });

  const socketRef = useRef(null);

useEffect(() => {
  const connect = () => {
    const socket = new WebSocket("ws://localhost:2000/ws");

    socket.onopen = () => console.log("WebSocket connected");
    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
      setTimeout(connect, 3000);  // Retry after 3 seconds
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLatestReview(data);
      // ... update other states
    };

    return socket;
  };

  const socket = connect();
  return () => socket.close();
}, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Real-Time Amazon Reviews Dashboard
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Review */}
        <div className="lg:col-span-1">
          <LatestReview review={latestReview} />
        </div>

        {/* Sentiment Chart */}
        <div className="lg:col-span-2">
          <SentimentChart sentimentCounts={sentimentCounts} />
        </div>

        {/* Review Table */}
        <div className="lg:col-span-3">
          <ReviewTable reviews={reviews} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
