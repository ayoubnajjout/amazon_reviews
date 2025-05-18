from kafka import KafkaProducer
import pandas as pd
import json
import time
import os

def main():
    print("Starting Amazon review producer for ML pipeline...")
    try:
        # Create producer
        producer = KafkaProducer(
            bootstrap_servers='localhost:29092',
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
       
        # Read the CSV data file
        try:
            # Change this path to your CSV file location
            csv_path = 'prod_data.csv'
            df = pd.read_csv(csv_path)
           
            # Take only 10% of the data as specified
            sample_size = int(len(df) * 0.1)
            df_sample = df.sample(n=sample_size, random_state=42)
           
            print(f"Successfully loaded CSV with {len(df)} rows")
            print(f"Using sample of {len(df_sample)} rows")
        except Exception as e:
            print(f"Error loading CSV: {e}")
            return
       
        # Create the topic if it doesn't exist
        topic_name = 'amazon_reviews'
        print(f"Producing messages to topic: {topic_name}")
       
        # Send messages one by one to Kafka
        message_count = 0
        for _, row in df_sample.iterrows():
            # Convert row to dictionary and clean up the data
            review = row.to_dict()
           
            # Handle potential NaN values
            for key, value in review.items():
                if pd.isna(value):
                    review[key] = None
           
            # Parse the helpful field if it's a string representation of a list
            if isinstance(review.get('helpful'), str):
                try:
                    review['helpful'] = json.loads(review['helpful'].replace("'", '"'))
                except:
                    review['helpful'] = [0, 0]
           
            # Convert float values to ensure they're serializable
            for key, value in review.items():
                if isinstance(value, float):
                    review[key] = float(value)
           
            # Send message
            producer.send(topic_name, review)
            producer.flush()  # Ensure the message is sent immediately
            message_count += 1
           
            # Print information for monitoring
            print(f"Sent message {message_count}: Product {review['asin']}")
           
            time.sleep(2)
       
        print(f"All done! Sent {message_count} messages to Kafka.")
       
    except Exception as e:
        print(f"Error in producer: {e}")
    finally:
        if 'producer' in locals():
            producer.close()
            print("Producer closed")

if __name__ == "__main__":
    main()