from channels.generic.websocket import AsyncWebsocketConsumer
import json

class AnalysisConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Send a welcome message to confirm connection
        await self.send(json.dumps({"message": "Connected to Analysis WebSocket"}))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        # For minimal implementation, simply echo back the received data
        data = json.loads(text_data)
        await self.send(text_data=json.dumps({"echo": data})) 