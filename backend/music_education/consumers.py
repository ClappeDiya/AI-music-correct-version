import json
from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from .models import AIAnalysis, ExpertCourse, UserMetrics, AnalyticsEvent, AnalysisProgress

class AIAnalysisConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        """
        Called when the websocket is handshaking as part of initial connection.
        """
        # Accept the connection
        await self.accept()
        
        # Get the analysis ID from the URL route
        self.analysis_id = self.scope['url_route']['kwargs'].get('analysis_id')
        if self.analysis_id:
            # Add this channel to the analysis group
            await self.channel_layer.group_add(
                f"analysis_{self.analysis_id}",
                self.channel_name
            )

    async def disconnect(self, close_code):
        """
        Called when the WebSocket closes for any reason.
        """
        # Leave analysis group
        if hasattr(self, 'analysis_id'):
            await self.channel_layer.group_discard(
                f"analysis_{self.analysis_id}",
                self.channel_name
            )

    async def receive_json(self, content):
        """
        Called when we get a text frame from the client.
        """
        command = content.get("command", None)
        if command == "get_progress":
            await self.send_progress_update()

    @database_sync_to_async
    def get_analysis_progress(self):
        """
        Get the current progress of the analysis.
        """
        try:
            analysis = AIAnalysis.objects.get(id=self.analysis_id)
            progress = AnalysisProgress.objects.get(analysis=analysis)
            return {
                'progress_percentage': progress.progress_percentage,
                'current_step': progress.current_step,
                'estimated_time_remaining': progress.estimated_time_remaining
            }
        except (AIAnalysis.DoesNotExist, AnalysisProgress.DoesNotExist):
            return None

    async def send_progress_update(self):
        """
        Send a progress update to the client.
        """
        progress_data = await self.get_analysis_progress()
        if progress_data:
            await self.send_json({
                'type': 'progress_update',
                'data': progress_data
            })

    async def progress_update(self, event):
        """
        Handler for progress_update event, sends the update to the client.
        """
        await self.send_json({
            'type': 'progress_update',
            'data': event['data']
        })

class MusicEducationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.room_group_name = f"user_{self.user.id}"
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            event_type = data.get('type')
            
            if event_type == 'course_progress':
                await self.handle_course_progress(data)
            elif event_type == 'analytics_event':
                await self.handle_analytics_event(data)
            elif event_type == 'user_metrics':
                await self.handle_user_metrics(data)
            
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")
        except Exception as e:
            await self.send_error(str(e))

    async def handle_course_progress(self, data):
        try:
            course_id = data.get('course_id')
            progress = data.get('progress')
            
            if not course_id or progress is None:
                await self.send_error("Missing required fields")
                return
            
            # Update course progress
            await self.update_course_progress(course_id, progress)
            
            # Send progress update to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'progress_update',
                    'course_id': course_id,
                    'progress': progress
                }
            )
            
        except ObjectDoesNotExist:
            await self.send_error("Course not found")
        except Exception as e:
            await self.send_error(str(e))

    async def handle_analytics_event(self, data):
        try:
            event_data = {
                'event_type': data.get('event_type'),
                'data': data.get('data', {}),
                'user': self.user,
                'session_id': data.get('session_id')
            }
            
            # Save analytics event
            await self.save_analytics_event(event_data)
            
            # Send event confirmation
            await self.send_json({
                'type': 'event_received',
                'status': 'success'
            })
            
        except Exception as e:
            await self.send_error(str(e))

    async def handle_user_metrics(self, data):
        try:
            metrics_data = {
                'user': self.user,
                'session_id': data.get('session_id'),
                'session_duration': data.get('duration'),
                'completed_items': data.get('completed_items', []),
                'interactions': data.get('interactions', {}),
                'progress': data.get('progress', 0)
            }
            
            # Save user metrics
            await self.save_user_metrics(metrics_data)
            
            # Send metrics confirmation
            await self.send_json({
                'type': 'metrics_received',
                'status': 'success'
            })
            
        except Exception as e:
            await self.send_error(str(e))

    async def progress_update(self, event):
        # Send progress update to WebSocket
        await self.send_json({
            'type': 'progress_update',
            'course_id': event['course_id'],
            'progress': event['progress']
        })

    @database_sync_to_async
    def update_course_progress(self, course_id, progress):
        course = ExpertCourse.objects.get(id=course_id)
        # Update progress logic here
        return True

    @database_sync_to_async
    def save_analytics_event(self, event_data):
        return AnalyticsEvent.objects.create(**event_data)

    @database_sync_to_async
    def save_user_metrics(self, metrics_data):
        return UserMetrics.objects.create(**metrics_data)

    async def send_error(self, message):
        await self.send_json({
            'type': 'error',
            'message': message
        })

    async def send_json(self, content):
        await self.send(text_data=json.dumps(content)) 