#!/bin/bash
set -e

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install nltk uvicorn numpy fastapi pyspark pymongo

# Setup NLTK resources
echo "🔍 Setting up NLTK resources..."
python /workspace/download_nltk.py

# Start Spark streaming as a background process
echo "🚀 Starting Spark Streaming application..."
spark-submit --master spark://spark-master:7077 --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0 /workspace/spark_streaming.py &
SPARK_PID=$!

# Give Spark streaming a moment to initialize
sleep 5

# Start FastAPI application
echo "🚀 Starting FastAPI service..."
python -m uvicorn api:app --host 0.0.0.0 --port 8000 &
API_PID=$!

# Function to handle termination signals
function handle_sigterm() {
    echo "📤 Received termination signal. Shutting down services..."
    kill -TERM $API_PID 2>/dev/null || true
    kill -TERM $SPARK_PID 2>/dev/null || true
    wait
    echo "📤 Services shut down successfully"
    exit 0
}

# Register the signal handler
trap handle_sigterm SIGTERM SIGINT

# Keep the script running
echo "✅ All services started! Container is now running..."
wait $SPARK_PID $API_PID