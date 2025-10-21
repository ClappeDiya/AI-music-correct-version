from locust import HttpUser, task, between
from django.contrib.auth import get_user_model
import random
import json

User = get_user_model()

class LyricsGenerationLoadTest(HttpUser):
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

    @task(3)
    def generate_lyrics(self):
        """Generate new lyrics with random parameters"""
        parameters = {
            "prompt_text": f"Test prompt {random.randint(1, 1000)}",
            "provider": random.choice([1, 2]),  # Random AI provider
            "parameters": {
                "complexity": random.randint(1, 10),
                "rhymeScheme": random.choice(["aabb", "abab", "abba", "free"]),
                "thematicElements": random.sample([
                    "Nature", "Love", "Urban Life", "Technology",
                    "Spirituality", "Social Issues", "Personal Growth"
                ], k=random.randint(1, 3)),
                "emotionalTone": random.choice([
                    "Joyful", "Melancholic", "Energetic", "Contemplative",
                    "Angry", "Hopeful", "Peaceful", "Mysterious"
                ]),
                "verseStructure": random.choice([
                    "verse-chorus", "verse-chorus-bridge",
                    "stanzas", "free-form"
                ])
            }
        }
        
        self.client.post("/api/lyrics-generation/prompts/", json.dumps(parameters))

    @task(2)
    def edit_lyrics(self):
        """Edit existing lyrics"""
        # Get user's drafts
        response = self.client.get("/api/lyrics-generation/drafts/")
        if response.status_code == 200:
            drafts = response.json()
            if drafts:
                draft = random.choice(drafts)
                edit_data = {
                    "draft": draft["id"],
                    "edited_content": f"Modified content {random.randint(1, 1000)}",
                    "edit_notes": "Load test edit"
                }
                self.client.post("/api/lyrics-generation/edits/", json.dumps(edit_data))

    @task(1)
    def create_timeline(self):
        """Create timeline entries for lyrics"""
        # Get user's final lyrics
        response = self.client.get("/api/lyrics-generation/final-lyrics/")
        if response.status_code == 200:
            lyrics = response.json()
            if lyrics:
                lyric = random.choice(lyrics)
                timeline_data = {
                    "final_lyrics": lyric["id"],
                    "start_time_seconds": random.uniform(0, 60),
                    "end_time_seconds": random.uniform(61, 120),
                    "lyric_segment": f"Timeline segment {random.randint(1, 1000)}"
                }
                self.client.post("/api/lyrics-generation/timeline/", json.dumps(timeline_data))

    @task
    def get_long_lyrics(self):
        """Test handling of extremely long lyrics"""
        parameters = {
            "prompt_text": "Generate a very long epic poem with multiple verses and complex structure",
            "provider": 1,
            "parameters": {
                "complexity": 10,
                "rhymeScheme": "abab",
                "thematicElements": ["Epic", "Fantasy", "Mythology"],
                "emotionalTone": "Mysterious",
                "verseStructure": "verse-chorus-bridge"
            }
        }
        
        self.client.post("/api/lyrics-generation/prompts/", json.dumps(parameters))

    @task
    def repeated_prompts(self):
        """Test handling of repeated AI prompts"""
        parameters = {
            "prompt_text": "This is a repeated prompt",
            "provider": 1,
            "parameters": {
                "complexity": 5,
                "rhymeScheme": "aabb",
                "thematicElements": ["Love"],
                "emotionalTone": "Joyful",
                "verseStructure": "verse-chorus"
            }
        }
        
        # Send the same prompt multiple times
        for _ in range(3):
            self.client.post("/api/lyrics-generation/prompts/", json.dumps(parameters)) 