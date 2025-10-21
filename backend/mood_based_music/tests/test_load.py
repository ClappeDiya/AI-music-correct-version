from locust import HttpUser, task, between
from django.contrib.auth import get_user_model
import json
import random

User = get_user_model()

class MoodGenerationLoadTest(HttpUser):
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    def on_start(self):
        """Setup before starting tests"""
        # Create test user and get token
        response = self.client.post("/api/auth/login/", {
            "username": f"testuser_{self.user_id}",
            "password": "testpass123"
        })
        self.token = response.json()["token"]
        self.client.headers = {'Authorization': f'Bearer {self.token}'}
        
        # Get available moods
        response = self.client.get("/api/moods/")
        self.moods = response.json()

    @task(3)
    def generate_mood_track(self):
        """Generate a new mood-based track"""
        mood = random.choice(self.moods)
        intensity = random.uniform(0.1, 1.0)
        
        self.client.post("/api/mood-music/generate/", {
            "mood_id": mood["id"],
            "intensity": intensity
        })

    @task(2)
    def submit_feedback(self):
        """Submit feedback for a generated track"""
        # Get user's tracks
        response = self.client.get("/api/mood-music/tracks/")
        if response.status_code == 200:
            tracks = response.json()
            if tracks:
                track = random.choice(tracks)
                feedback_type = random.choice(["like", "dislike"])
                
                self.client.post(f"/api/mood-music/tracks/{track['id']}/feedback/", {
                    "feedback_type": feedback_type,
                    "notes": f"Test feedback for track {track['id']}"
                })

    @task(1)
    def view_analytics(self):
        """View analytics for a track"""
        response = self.client.get("/api/mood-music/tracks/")
        if response.status_code == 200:
            tracks = response.json()
            if tracks:
                track = random.choice(tracks)
                self.client.get(f"/api/mood-music/tracks/{track['id']}/analytics/")

class UserBehavior(HttpUser):
    tasks = [MoodGenerationLoadTest]
    min_wait = 1000
    max_wait = 3000 