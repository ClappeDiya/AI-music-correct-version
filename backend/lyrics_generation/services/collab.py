from typing import Dict, List, Optional, Callable
import asyncio
import json
import websockets
from django.conf import settings
from ..config import LyricsConfig
from ..models import LyricEdit

class CollaborationService:
    """Service for real-time collaboration on lyrics"""
    
    def __init__(self):
        self.config = LyricsConfig.get_instance()
        self.connections: Dict[int, List[websockets.WebSocketServerProtocol]] = {}
        self.handlers: Dict[str, Callable] = {
            'edit': self._handle_edit,
            'cursor': self._handle_cursor,
            'selection': self._handle_selection,
            'comment': self._handle_comment
        }
    
    async def connect(self, lyrics_id: int, websocket: websockets.WebSocketServerProtocol):
        """
        Connect a new client to the collaboration session
        """
        if lyrics_id not in self.connections:
            self.connections[lyrics_id] = []
        
        if len(self.connections[lyrics_id]) >= self.config.MAX_COLLABORATORS:
            raise ValueError('Maximum number of collaborators reached')
        
        self.connections[lyrics_id].append(websocket)
        
        try:
            async for message in websocket:
                await self._handle_message(lyrics_id, websocket, message)
        finally:
            await self._disconnect(lyrics_id, websocket)
    
    async def _handle_message(self, lyrics_id: int, websocket: websockets.WebSocketServerProtocol, message: str):
        """
        Handle incoming WebSocket messages
        """
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            if message_type in self.handlers:
                await self.handlers[message_type](lyrics_id, websocket, data)
            else:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
        except json.JSONDecodeError:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Invalid JSON message'
            }))
    
    async def _handle_edit(self, lyrics_id: int, websocket: websockets.WebSocketServerProtocol, data: Dict):
        """
        Handle edit operations
        """
        edit = await LyricEdit.objects.create(
            lyrics_id=lyrics_id,
            content=data['content'],
            position=data.get('position', 0),
            user_id=data['user_id']
        )
        
        # Broadcast edit to all connected clients except sender
        await self._broadcast(lyrics_id, websocket, {
            'type': 'edit',
            'edit_id': edit.id,
            'content': edit.content,
            'position': edit.position,
            'user_id': edit.user_id,
            'timestamp': edit.created_at.isoformat()
        })
    
    async def _handle_cursor(self, lyrics_id: int, websocket: websockets.WebSocketServerProtocol, data: Dict):
        """
        Handle cursor position updates
        """
        await self._broadcast(lyrics_id, websocket, {
            'type': 'cursor',
            'user_id': data['user_id'],
            'position': data['position']
        })
    
    async def _handle_selection(self, lyrics_id: int, websocket: websockets.WebSocketServerProtocol, data: Dict):
        """
        Handle text selection updates
        """
        await self._broadcast(lyrics_id, websocket, {
            'type': 'selection',
            'user_id': data['user_id'],
            'start': data['start'],
            'end': data['end']
        })
    
    async def _handle_comment(self, lyrics_id: int, websocket: websockets.WebSocketServerProtocol, data: Dict):
        """
        Handle comment additions
        """
        await self._broadcast(lyrics_id, websocket, {
            'type': 'comment',
            'user_id': data['user_id'],
            'content': data['content'],
            'position': data['position'],
            'timestamp': data['timestamp']
        })
    
    async def _broadcast(self, lyrics_id: int, sender: websockets.WebSocketServerProtocol, message: Dict):
        """
        Broadcast a message to all connected clients except the sender
        """
        if lyrics_id in self.connections:
            message_str = json.dumps(message)
            await asyncio.gather(*[
                client.send(message_str)
                for client in self.connections[lyrics_id]
                if client != sender and not client.closed
            ])
    
    async def _disconnect(self, lyrics_id: int, websocket: websockets.WebSocketServerProtocol):
        """
        Disconnect a client from the collaboration session
        """
        if lyrics_id in self.connections:
            self.connections[lyrics_id].remove(websocket)
            if not self.connections[lyrics_id]:
                del self.connections[lyrics_id]
    
    async def close_all(self):
        """
        Close all active connections
        """
        for lyrics_id in list(self.connections.keys()):
            for websocket in self.connections[lyrics_id]:
                await websocket.close()
            del self.connections[lyrics_id] 