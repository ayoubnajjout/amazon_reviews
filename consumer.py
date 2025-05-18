from kafka import KafkaConsumer
import json
import time
import pandas as pd
from pymongo import MongoClient
import datetime

def main():
    print("Starting Kafka ML predictions consumer with MongoDB integration...")
    
    # Connect to MongoDB - using port 27018 as per your docker-compose
    try:
        mongo_client = MongoClient('mongodb://localhost:27018/')
        db = mongo_client['amazon_reviews']
        reviews_collection = db['processed_reviews']
        print("Successfully connected to MongoDB")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return
    
    try:
        # Initialize consumer - removed consumer_timeout_ms to keep consumer running indefinitely
        consumer = KafkaConsumer(
            'processed_reviews',
            bootstrap_servers='localhost:29092',
            auto_offset_reset='earliest',
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            group_id='amazon-ml-consumer',
            # Removing the timeout so it doesn't stop after 30 seconds
        )
        
        # Check if topic exists
        topics = consumer.topics()
        print(f"Available topics: {topics}")
        
        if 'processed_reviews' not in topics:
            print("WARNING: 'processed_reviews' topic doesn't exist yet! Waiting for it to be created...")
        
        # Create a dataframe to store received messages (for summary reporting)
        reviews_data = []
        columns = ['asin', 'reviewerName', 'reviewText', 'overall', 'sentiment_prediction']
        
        # Get topic partition information
        print("Waiting for messages with ML predictions...")
        start_time = time.time()
        message_count = 0
        
        for message in consumer:
            message_count += 1
            data = message.value
            
            # Debug print to see what's in the message
            print(f"\nDebug - Received raw message: {data}")
            
            # Add timestamp for MongoDB
            data['timestamp'] = datetime.datetime.now()
            
            # Print message info - with safety checks
            print(f"\nReceived message #{message_count}:")
            print(f"Product ID: {data.get('asin', 'UNKNOWN')}")
            print(f"Rating: {data.get('overall', 'UNKNOWN')}")
            print(f"Predicted Sentiment: {data.get('sentiment_prediction', 'UNKNOWN')}")
            
            review_text = data.get('reviewText', '')
            if review_text:
                print(f"Review: {review_text[:100]}..." if len(review_text) > 100 else f"Review: {review_text}")
            else:
                print("Review: NONE")
            print("-" * 50)
            
            # Insert into MongoDB
            if all(field in data for field in ['asin', 'reviewText', 'overall', 'sentiment_prediction']):
                try:
                    # Insert the full message data into MongoDB
                    result = reviews_collection.insert_one(data)
                    print(f"Inserted document with ID: {result.inserted_id}")
                    
                    # Add to our data collection for summary reporting
                    reviews_data.append([
                        data['asin'],
                        data.get('reviewerName', 'Unknown'),
                        data['reviewText'],
                        data['overall'],
                        data['sentiment_prediction']
                    ])
                except Exception as e:
                    print(f"Error inserting into MongoDB: {e}")
            else:
                print("WARNING: Skipping message due to missing required fields")
                missing = [field for field in ['asin', 'reviewText', 'overall', 'sentiment_prediction'] if field not in data]
                print(f"Missing fields: {missing}")
            
            # Every 10 messages, show a summary of predictions so far
            if message_count % 10 == 0 and reviews_data:
                df = pd.DataFrame(reviews_data, columns=columns)
                sentiment_counts = df['sentiment_prediction'].value_counts()
                print("\nSummary of sentiment predictions so far:")
                print(sentiment_counts)
                
                # MongoDB summary counts
                db_count = reviews_collection.count_documents({})
                print(f"Total documents in MongoDB: {db_count}")
                print("-" * 50)
        
    except KeyboardInterrupt:
        print("Consumer stopped by user")
    except Exception as e:
        print(f"Error in Kafka consumer: {e}")
        import traceback
        traceback.print_exc()  # Print full stack trace
    finally:
        if 'consumer' in locals():
            consumer.close()
            print("Consumer closed")
            
        if 'mongo_client' in locals():
            mongo_client.close()
            print("MongoDB connection closed")
        
        print(f"Consumer ran for {(time.time() - start_time):.2f} seconds")
        print(f"Received {message_count} messages")
        
        # If we have data, show final summary
        if message_count > 0 and reviews_data:
            df = pd.DataFrame(reviews_data, columns=columns)
            print("\nFinal sentiment prediction distribution:")
            print(df['sentiment_prediction'].value_counts())
            
            # Show average rating by sentiment
            print("\nAverage rating by sentiment:")
            print(df.groupby('sentiment_prediction')['overall'].mean())

if __name__ == "__main__":
    main()