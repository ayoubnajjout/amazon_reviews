from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from pyspark.ml import PipelineModel
from pyspark.sql.functions import udf
import os
import sys

def download_nltk_resources():
    # Set NLTK data path to look for our downloaded data first
    nltk_data_dir = "./nltk_data"
    if os.path.exists(nltk_data_dir):
        print(f"Setting NLTK data path to {nltk_data_dir}")
        nltk.data.path.insert(0, nltk_data_dir)
    
    # Add the default NLTK data paths
    for path in nltk.data.path:
        print(f"NLTK data path: {path}")
    
    try:
        # Check if stopwords are available
        stopwords.words('english')
        print("NLTK stopwords successfully loaded")
    except LookupError:
        print("NLTK resources not found, downloading them...")
        nltk.download('stopwords')
        nltk.download('punkt')
        nltk.download('wordnet')
        print("NLTK resources downloaded")

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

def main():
    # Download NLTK resources first
    print("Setting up NLTK resources...")
    download_nltk_resources()
    
    # Create a SparkSession
    spark = SparkSession.builder \
        .appName("AmazonReviewMLStreaming") \
        .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0") \
        .config("spark.sql.streaming.checkpointLocation", "/tmp/checkpoints/ml") \
        .config("spark.sql.shuffle.partitions", "1") \
        .config("spark.sql.streaming.noDataMicroBatches.enabled", "false") \
        .config("spark.cleaner.referenceTracking.cleanCheckpoints", "true") \
        .config("spark.driver.memory", "2g") \
        .config("spark.executor.memory", "2g") \
        .getOrCreate()

    # Set log level to see more details
    spark.sparkContext.setLogLevel("INFO")
    
    try:
        # Register UDFs
        clean_text_udf = udf(clean_text, StringType())
        preprocess_text_udf = udf(preprocess_text, StringType())
        
        # Load the saved ML model
        model_path = "/spark_data/prod_model"  # Update this to your actual model path
        try:
            ml_model = PipelineModel.load(model_path)
            print(f"Successfully loaded ML model from {model_path}")
        except Exception as e:
            print(f"Error loading ML model: {e}")
            raise e
        
        # Define schema for the input data
        review_schema = StructType([
            StructField("reviewerID", StringType()),
            StructField("asin", StringType()),
            StructField("reviewerName", StringType()),
            StructField("helpful", StringType()),  # Will handle this as string and parse later
            StructField("reviewText", StringType()),
            StructField("overall", FloatType()),
            StructField("summary", StringType()),
            StructField("unixReviewTime", LongType()),
            StructField("reviewTime", StringType())
        ])

        # Read from Kafka
        raw_df = spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "kafka:9092") \
            .option("subscribe", "amazon_reviews") \
            .option("startingOffsets", "earliest") \
            .option("failOnDataLoss", "false") \
            .load()

        # Parse JSON from Kafka
        parsed_df = raw_df \
            .select(from_json(col("value").cast("string"), review_schema).alias("data")) \
            .select("data.*")
        
        # Create features needed for the ML model
        processed_df = parsed_df \
            .withColumn("reviews", concat_ws(" ", col("reviewText"), col("summary"))) \
            .withColumn("cleaned_reviews", clean_text_udf(col("reviews"))) \
            .withColumn("processed_reviews", preprocess_text_udf(col("cleaned_reviews"))) \
            .withColumn("review_len", length(col("reviews"))) \
            .withColumn("word_count", size(split(col("reviews"), " "))) \
            .withColumn("weight", lit(1.0))
        
        # Apply the ML model
        prediction_df = ml_model.transform(processed_df)
        
        # Convert numeric prediction back to sentiment label
        prediction_df = prediction_df.withColumn(
            "sentiment_prediction", 
            when(col("prediction") == 0, "Negative")
            .when(col("prediction") == 1, "Neutral")
            .when(col("prediction") == 2, "Positive")
            .otherwise("Unknown")
        )
        
        # Select the final columns for output
        output_df = prediction_df.select(
            "asin", 
            "reviewerName", 
            "reviewText", 
            "overall", 
            "sentiment_prediction"
        )
        
        # Write to console for debugging
        console_query = output_df \
            .writeStream \
            .outputMode("append") \
            .format("console") \
            .option("truncate", "false") \
            .start()
        
        # Write to Kafka topic
        kafka_query = output_df \
            .select(
                col("asin").cast("string").alias("key"),
                to_json(struct("*")).alias("value")
            ) \
            .writeStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "kafka:9092") \
            .option("topic", "processed_reviews") \
            .option("checkpointLocation", "/tmp/ml-kafka-checkpoint") \
            .outputMode("append") \
            .start()

        # Wait for termination
        spark.streams.awaitAnyTermination()

    except Exception as e:
        print(f"Error in ML Spark streaming: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Clean shutdown
        print("Shutting down Spark session")
        spark.stop()

if __name__ == "__main__":
    main()