from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *

def main():
    spark = SparkSession.builder \
        .appName("KafkaAmazonReviews") \
        .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0") \
        .config("spark.sql.streaming.checkpointLocation", "/tmp/checkpoints") \
        .config("spark.sql.shuffle.partitions", "1") \
        .config("spark.sql.streaming.noDataMicroBatches.enabled", "false") \
        .config("spark.cleaner.referenceTracking.cleanCheckpoints", "true") \
        .config("spark.driver.memory", "2g") \
        .config("spark.executor.memory", "2g") \
        .config("spark.driver.extraJavaOptions", "-XX:+UseG1GC") \
        .config("spark.executor.extraJavaOptions", "-XX:+UseG1GC") \
        .getOrCreate()

    # Set log level to see more details
    spark.sparkContext.setLogLevel("INFO")
    
    try:
        # Schema definition - UPDATED to match your CSV format
        review_schema = StructType([
            StructField("reviewerID", StringType()),
            StructField("asin", StringType()),
            StructField("reviewerName", StringType()),
            StructField("helpful", StringType()),  # This might be a list in your data
            StructField("reviewText", StringType()),
            StructField("overall", FloatType()),   # Changed to float since your data shows 5.0
            StructField("summary", StringType()),
            StructField("unixReviewTime", LongType()),
            StructField("reviewTime", StringType())
        ])

        # Read from Kafka with proper offset management
        raw_df = spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "kafka:9092") \
            .option("subscribe", "amazon_reviews") \
            .option("startingOffsets", "earliest") \
            .option("failOnDataLoss", "false") \
            .option("maxOffsetsPerTrigger", "100") \
            .load()

        # Print schema for debugging
        print("Raw Kafka schema:")
        raw_df.printSchema()

        # Processing - parse JSON from Kafka
        parsed_df = raw_df \
            .select(from_json(col("value").cast("string"), review_schema).alias("data")) \
            .select("data.*")
        
        # Print schema after parsing
        print("Parsed data schema:")
        parsed_df.printSchema()

        # Aggregation - UPDATED to use 'overall' instead of 'rating'
        result_df = parsed_df \
            .na.drop() \
            .filter(col("overall") >= 4.0) \
            .groupBy("asin") \
            .agg(
                count("*").alias("positive_reviews"),
                avg("overall").alias("avg_rating")
            )

        # Write to console for debugging (comment out in production)
        console_query = result_df \
            .writeStream \
            .outputMode("update") \
            .format("console") \
            .option("truncate", "false") \
            .start()
            
        # Write to Kafka topic
        kafka_query = result_df \
            .select(
                col("asin").cast("string").alias("key"),  # Use product ID as key
                to_json(struct("*")).alias("value")
            ) \
            .writeStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "kafka:9092") \
            .option("topic", "processed_reviews") \
            .option("checkpointLocation", "/tmp/kafka-checkpoint") \
            .outputMode("update") \
            .start()

        # Wait for termination
        spark.streams.awaitAnyTermination()

    except Exception as e:
        print(f"Error in Spark streaming: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Clean shutdown
        print("Shutting down Spark session")
        spark.stop()

if __name__ == "__main__":
    main()