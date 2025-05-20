import { useState } from 'react';

const Predict = () => {
  const [reviewText, setReviewText] = useState('');
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputError, setInputError] = useState(false);
  
  const handleChange = (e) => {
    setReviewText(e.target.value);
    // Clear input error when user starts typing
    if (inputError) {
      setInputError(false);
    }
  };
  
  const handleSubmit = async () => {
    // Check if input is empty
    if (!reviewText.trim()) {
      setInputError(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const timestamp = new Date().toISOString();
      
      // Create request body with just the text
      const requestBody = {
        text: reviewText
      };
      
      // Send POST request to the predict endpoint
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }
      
      const data = await response.json();
      
      // Create prediction result using the API response data
      setPrediction({
        reviewText: reviewText,
        sentiment_prediction: data.sentiment_prediction,
        timestamp: timestamp
      });
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error('Error making prediction:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setReviewText('');
    setPrediction(null);
    setError(null);
    setInputError(false);
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-semibold text-center text-gray-800">Review Sentiment Prediction</h1>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Info Section */}
          <div className="w-full md:w-1/3">
            <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-8">
                <img 
                  src="/src/assets/images/logo.png" 
                  alt="Logo" 
                  className="h-16 w-auto object-contain drop-shadow-lg mr-4" 
                />
                <h2 className="text-xl font-semibold tracking-wider uppercase">RIA-STREAM</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">About This Tool</h3>
                  <p className="text-gray-300">This tool predicts the sentiment of product reviews based on our machine learning model.</p>
                </div>
                
                {/* <div>
                  <h3 className="text-lg font-medium mb-2">Sample Data</h3>
                  <p className="text-gray-300">ASIN: B000WN4J9S</p>
                  <p className="text-gray-300">Rating: 5</p>
                  <p className="text-gray-300">Reviewer: Salvatore Quaglieri</p>
                  <p className="text-gray-300">Review: "Nice F logo upgrade on my squier deluxe strat..."</p>
                </div> */}
              </div>
            </div>
          </div>
          
          {/* Prediction Form */}
          <div className="w-full md:w-2/3">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Product Review Sentiment Analysis</h2>
              
              {prediction && (
                <div className={`
                  ${prediction.sentiment_prediction === 'Positive' ? 'bg-green-50 border-green-400 text-green-700' : 
                    prediction.sentiment_prediction === 'Negative' ? 'bg-red-50 border-red-400 text-red-700' : 
                    'bg-yellow-50 border-yellow-400 text-yellow-700'} 
                  border-2 px-6 py-4 rounded-lg mb-6 shadow-sm`}>
                  <div className="flex items-center mb-3">
                    {prediction.sentiment_prediction === 'Positive' ? (
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : prediction.sentiment_prediction === 'Negative' ? (
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    )}
                    <h3 className="text-lg font-semibold">Prediction Result</h3>
                  </div>
                  <div className="mb-3 pb-3 border-b border-opacity-20 border-current">
                    <div className="font-medium mb-1">Sentiment:</div>
                    <div className="text-xl font-bold">{prediction.sentiment_prediction}</div>
                  </div>
                  <div className="mb-4 text-sm opacity-90">
                    <div className="font-medium mb-1">Review Text:</div>
                    <div className="italic">{prediction.reviewText}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs opacity-75">Submitted on: {new Date(prediction.timestamp).toLocaleString()}</p>
                    <button 
                      onClick={handleReset}
                      className="bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 border border-current"
                    >
                      New Prediction
                    </button>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  <p>{error}</p>
                </div>
              )}
              
              {!prediction && (
                <div>
                  <div className="mb-6">
                    <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                    <textarea
                      id="reviewText"
                      value={reviewText}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Enter your product review here..."
                      className={`w-full px-4 py-2 border ${inputError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    ></textarea>
                    {inputError && (
                      <p className="mt-1 text-sm text-red-600">Please enter some text before submitting.</p>
                    )}
                  </div>
                  
                  <div>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium disabled:bg-gray-400"
                    >
                      {loading ? 'Analyzing...' : 'Predict Sentiment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predict;