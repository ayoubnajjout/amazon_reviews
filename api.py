from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from typing import List
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from pyspark.ml import PipelineModel
from pyspark.sql import SparkSession
import os
import sys

# Create Pydantic model for Review
class Review(BaseModel):
    _id: str
    asin: str
    reviewerName: str | None
    reviewText: str
    overall: float
    sentiment_prediction: str
    timestamp: str | None  # Convert datetime to string

# Create Pydantic model for Review Prediction Request
class ReviewPredictionRequest(BaseModel):
    text: str

# Create Pydantic model for Review Prediction Response
class ReviewPredictionResponse(BaseModel):
    text: str
    sentiment_prediction: str
    cleaned_text: str | None = None
    processed_text: str | None = None

app = FastAPI(title="Amazon Reviews API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Text cleaning function
def clean_text(text):
    if text is None:
        return ""
    # Conversion to lowercase
    text = str(text).lower()
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    # Remove special characters and numbers
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Text preprocessing function with safety checks
def preprocess_text(text):
    if text is None or not text:
        return ""
    try:
        # Increased recursion limit to prevent potential issues
        sys.setrecursionlimit(10000)
        
        try:
            stop_words = set(stopwords.words('english'))
        except Exception as e:
            print(f"Warning: Could not load stopwords: {e}")
            stop_words = set()
            
        try:
            lemmatizer = WordNetLemmatizer()
        except Exception as e:
            print(f"Warning: Could not initialize lemmatizer: {e}")
            return text
            
        try:
            tokens = nltk.word_tokenize(text)
        except Exception as e:
            print(f"Warning: Could not tokenize text: {e}")
            tokens = text.split()
            
        result = []
        for word in tokens:
            if word.isalpha() and word not in stop_words:
                try:
                    lemma = lemmatizer.lemmatize(word)
                    result.append(lemma)
                except Exception:
                    result.append(word)
                    
        return ' '.join(result)
    except Exception as e:
        print(f"Error preprocessing text: {e}")
        return text

def download_nltk_resources():
    # Set NLTK data path to look for our downloaded data first
    nltk_data_dir = "./nltk_data"
    if os.path.exists(nltk_data_dir):
        print(f"Setting NLTK data path to {nltk_data_dir}")
        nltk.data.path.insert(0, nltk_data_dir)
    
    # Check if stopwords are available, if not download them
    try:
        stopwords.words('english')
        print("NLTK stopwords successfully loaded")
    except LookupError:
        print("NLTK resources not found, downloading them...")
        nltk.download('stopwords')
        nltk.download('punkt')
        nltk.download('wordnet')
        print("NLTK resources downloaded")

# MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    try:
        # Download NLTK resources
        download_nltk_resources()
        
        # Initialize MongoDB client
        app.mongodb_client = MongoClient("mongodb://mongodb:27017")
        app.database = app.mongodb_client['amazon_reviews']
        # Test the connection
        app.mongodb_client.server_info()
        print("✅ Successfully connected to MongoDB!")

        # List available collections
        collections = app.database.list_collection_names()
        print(f"📂 Available collections in 'amazon_reviews' database: {collections}")

        # Create Spark session for ML predictions
        app.spark = SparkSession.builder \
            .appName("AmazonReviewAPI") \
            .config("spark.driver.memory", "2g") \
            .config("spark.executor.memory", "2g") \
            .getOrCreate()
        
        # Load the ML model - exploring multiple possible locations
        # Print current working directory for debugging
        import os
        current_dir = os.getcwd()
        print(f"Current working directory: {current_dir}")
        
        # Try different possible paths
        possible_paths = [
            "spark_data/prod_model",
            "../spark_data/prod_model",
            "./spark_data/prod_model",
            f"{current_dir}/spark_data/prod_model",
            "prod_model",
            "./prod_model",
        ]
        
        # Check which of these paths exist
        model_path = None
        for path in possible_paths:
            print(f"Checking if model exists at: {path}")
            if os.path.exists(path):
                print(f"✓ Found directory at: {path}")
                if os.path.exists(f"{path}/metadata"):
                    print(f"✓ Found metadata folder in: {path}")
                    model_path = path
                    break
                else:
                    print(f"✗ No metadata folder in: {path}")
            else:
                print(f"✗ Directory not found: {path}")
        
        # Try to load the model if we found a valid path
        if model_path:
            try:
                app.ml_model = PipelineModel.load(model_path)
                print(f"✅ Successfully loaded ML model from {model_path}")
            except Exception as e:
                print(f"❌ Error loading ML model: {e}")
                print(f"⚠️ API will start but prediction functionality won't work")
                app.ml_model = None
        else:
            print("❌ Could not find model directory in any of the expected locations")
            print("⚠️ API will start but prediction functionality won't work")
            
            # As a fallback, let's implement a simple rule-based sentiment analyzer
            print("🔧 Setting up fallback rule-based sentiment analyzer")
            app.ml_model = None
            
            # Create a simple function to predict sentiment based on keywords
            app.fallback_predict = lambda text: "Positive" if any(word in text.lower() for word in [
                "good", "great", "excellent", "amazing", "love", "best", "perfect", "recommend"
            ]) else "Negative" if any(word in text.lower() for word in [
                "bad", "awful", "terrible", "worst", "hate", "poor", "disappointing", "waste"
            ]) else "Neutral"
            
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB or initialize resources: {e}")
        raise e

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()
    print("📤 MongoDB connection closed")
    
    if hasattr(app, "spark"):
        app.spark.stop()
        print("📤 Spark session stopped")

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint that returns API information
    """
    return {
        "message": "Welcome to Amazon Reviews API",
        "version": "1.0",
        "endpoints": {
            "reviews": "/reviews - Get all reviews with sentiment predictions",
            "predict": "/predict - Predict sentiment for a review text"
        }
    }

@app.get("/reviews", response_model=List[Review], tags=["Reviews"])
async def get_all_reviews():
    """
    Get all Amazon reviews with their sentiment predictions
    """
    try:
        print("🔍 Fetching reviews from MongoDB...")
        reviews = list(app.database.processed_reviews.find({}))
        print(f"✅ Found {len(reviews)} reviews in the database.")

        # Convert ObjectId and timestamp to string for JSON serialization
        for review in reviews:
            review["_id"] = str(review["_id"])
            if "timestamp" in review and isinstance(review["timestamp"], datetime):
                review["timestamp"] = review["timestamp"].isoformat()
        return reviews
    except Exception as e:
        print(f"❌ Error fetching reviews: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/predict", response_model=ReviewPredictionResponse, tags=["Predictions"])
async def predict_sentiment(request: ReviewPredictionRequest):
    """
    Predict sentiment for a review text
    """
    try:
        print(f"🔍 Predicting sentiment for text: {request.text[:50]}...")
        
        # Clean and preprocess the text
        cleaned_text = clean_text(request.text)
        processed_text = preprocess_text(cleaned_text)
        
        # Check if model is loaded
        if hasattr(app, "ml_model") and app.ml_model is not None:
            # Use the ML model for prediction
            print("Using ML model for prediction")
            
            # Create DataFrame from the text
            from pyspark.sql.types import StructType, StructField, StringType, IntegerType, FloatType
            from pyspark.sql.functions import col, length, size, split, lit
            
            # Define schema similar to what's in the Spark streaming file
            schema = StructType([
                StructField("reviews", StringType()),
            ])
            
            # Create DataFrame with the input text
            data = [(request.text,)]
            df = app.spark.createDataFrame(data, schema)
            
            # Apply the same transformations as in the streaming file
            processed_df = df \
                .withColumn("cleaned_reviews", lit(cleaned_text)) \
                .withColumn("processed_reviews", lit(processed_text)) \
                .withColumn("review_len", length(col("reviews"))) \
                .withColumn("word_count", size(split(col("reviews"), " "))) \
                .withColumn("weight", lit(1.0))
            
            # Apply the ML model
            prediction_df = app.ml_model.transform(processed_df)
            
            # Convert numeric prediction back to sentiment label
            from pyspark.sql.functions import when
            prediction_df = prediction_df.withColumn(
                "sentiment_prediction", 
                when(col("prediction") == 0, "Negative")
                .when(col("prediction") == 1, "Neutral")
                .when(col("prediction") == 2, "Positive")
                .otherwise("Unknown")
            )
            
            # Get the prediction result
            result = prediction_df.select("sentiment_prediction").collect()[0]
            sentiment = result["sentiment_prediction"]
        elif hasattr(app, "fallback_predict"):
            # Use the fallback rule-based prediction
            print("Using fallback rule-based sentiment analyzer")
            sentiment = app.fallback_predict(request.text)
        else:
            # No prediction method available
            raise HTTPException(status_code=503, detail="ML model not loaded and no fallback available")
        
        print(f"✅ Prediction complete: {sentiment}")
        
        # Return the prediction response
        return ReviewPredictionResponse(
            text=request.text,
            sentiment_prediction=sentiment,
            cleaned_text=cleaned_text,
            processed_text=processed_text
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        print(f"❌ Error predicting sentiment: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error predicting sentiment: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Amazon Reviews API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)