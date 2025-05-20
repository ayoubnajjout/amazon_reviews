import json
import datetime
import threading
from typing import List
from fastapi import FastAPI, WebSocket
from kafka import KafkaConsumer
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

# Kafka configuration
KAFKA_TOPIC = 'processed_reviews'
KAFKA_BOOTSTRAP_SERVERS = 'localhost:29092'

# Connected WebSocket clients
connected_clients: List[WebSocket] = []

# Kafka consumer thread
class KafkaConsumerThread(threading.Thread):
    def __init__(self, topic, bootstrap_servers, callback):
        super().__init__()
        self.topic = topic
        self.bootstrap_servers = bootstrap_servers
        self.callback = callback
        self._stop_event = threading.Event()

    def run(self):
        print(f"[KafkaConsumerThread] Listening to topic: {self.topic}")
        consumer = KafkaConsumer(
            self.topic,
            bootstrap_servers=self.bootstrap_servers,
            auto_offset_reset='earliest',
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            group_id='fastapi-websocket-group'
        )
        try:
            for message in consumer:
                if self._stop_event.is_set():
                    break
                data = message.value
                data['timestamp'] = datetime.datetime.now().isoformat()
                print(f"[Kafka] Received message: {data}")
                self.callback(data)
        except Exception as e:
            print(f"[Kafka Error] {e}")
        finally:
            consumer.close()
            print("[Kafka] Consumer closed")

    def stop(self):
        self._stop_event.set()

# Function to send Kafka data to all WebSocket clients
def broadcast_message(data):
    to_remove = []
    for client in connected_clients:
        try:
            import asyncio
            asyncio.run(client.send_json(data))
        except Exception as e:
            print(f"[WebSocket] Send failed: {e}")
            to_remove.append(client)

    for client in to_remove:
        connected_clients.remove(client)

# FastAPI lifespan handler for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    kafka_thread = KafkaConsumerThread(
        topic=KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        callback=broadcast_message
    )
    kafka_thread.daemon = True
    kafka_thread.start()
    print("[Startup] Kafka consumer started")

    yield  # Wait until shutdown

    kafka_thread.stop()
    print("[Shutdown] Kafka consumer stopped")

# FastAPI app with lifespan
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "fastapi-kafka-websocket"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    print("[WebSocket] Client connected")
    try:
        while True:
            await websocket.receive_text()  # keep connection alive
    except Exception:
        print("[WebSocket] Client disconnected")
    finally:
        connected_clients.remove(websocket)
