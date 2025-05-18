from kafka import KafkaConsumer, TopicPartition
import json
import time

# Create a more robust consumer with better error handling and debugging
def main():
    print("Starting Kafka consumer...")
    try:
        # Initialize consumer with more debugging options
        consumer = KafkaConsumer(
            'processed_reviews',
            bootstrap_servers='localhost:29092',
            auto_offset_reset='earliest',
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            group_id='amazon-reviews-consumer',
            # Reduced timeout for quicker feedback
            consumer_timeout_ms=30000,  # 30 seconds timeout
        )
        
        # Check if topic exists
        topics = consumer.topics()
        print(f"Available topics: {topics}")
        
        if 'processed_reviews' not in topics:
            print("WARNING: 'processed_reviews' topic doesn't exist yet! Waiting for it to be created...")
        
        # Get topic partition information
        print("Waiting for messages...")
        start_time = time.time()
        message_count = 0
        
        for message in consumer:
            message_count += 1
            print(f"Received message #{message_count}:")
            print(f"Topic: {message.topic}, Partition: {message.partition}, Offset: {message.offset}")
            print(f"Key: {message.key}, Value: {message.value}")
            print("-" * 50)
        
    except KeyboardInterrupt:
        print("Consumer stopped by user")
    except Exception as e:
        print(f"Error in Kafka consumer: {e}")
    finally:
        if 'consumer' in locals():
            consumer.close()
            print("Consumer closed")
        
        print(f"Consumer ran for {(time.time() - start_time):.2f} seconds")
        print(f"Received {message_count} messages")

if __name__ == "__main__":
    main()