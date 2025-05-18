from kafka import KafkaProducer
import pandas as pd
import json
import time

def main():
    print("Starting Amazon review producer...")
    try:
        # Create producer
        producer = KafkaProducer(
            bootstrap_servers='localhost:29092',
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        # Read the actual data file - change to 'data.csv' if that's your filename
        try:
            df = pd.read_csv('prod_data.csv')
            print(f"Successfully loaded CSV with {len(df)} rows")
            print(f"Columns: {df.columns.tolist()}")
        except Exception as e:
            print(f"Error loading CSV: {e}")
            return
        
        # Send messages one by one to Kafka
        message_count = 0
        for _, row in df.iterrows():
            # Convert row to dictionary and clean up the data
            review = row.to_dict()
            
            # Send message
            producer.send('amazon_reviews', review)
            message_count += 1
            
            # Print every 5th record for monitoring
            if message_count % 5 == 0:
                print(f"Sent {message_count} messages, latest: {review}")
            
            # Small delay to prevent overwhelming the system
            time.sleep(0.5)
        
        # Make sure all messages are sent
        producer.flush()
        print(f"All done! Sent {message_count} messages to Kafka.")
        
    except Exception as e:
        print(f"Error in producer: {e}")
    finally:
        if 'producer' in locals():
            producer.close()
            print("Producer closed")

if __name__ == "__main__":
    main()