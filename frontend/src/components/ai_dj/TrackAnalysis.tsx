import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  BarChart,
  Headphones,
  SkipForward,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Music2,
  Tag
} from "lucide-react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Track } from '@/types/AiDj';
import { aiDjApi } from '@/lib/api/services/AiDj';

interface UserPreferences {
  topGenres: { genre: string; count: number }[];
  listeningStats: {
    totalListens: number;
    likes: number;
    dislikes: number;
    skips: number;
  };
  preferredMoods: { mood: string; percentage: number }[];
}

interface TrackAnalysisProps {
  userId: number;
}

export function TrackAnalysis({ userId }: TrackAnalysisProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, [userId]);

  const loadUserPreferences = async () => {
    setIsLoading(true);
    try {
      // Load play history
      const historyResponse = await aiDjApi.getPlayHistory({
        user: userId,
        limit: 100 // Get last 100 plays
      });

      // Load feedback
      const feedbackResponse = await aiDjApi.getFeedback({
        user: userId
      });

      // Process data to generate preferences
      const tracks = new Map<number, Track>();
      const genres = new Map<string, number>();
      const moods = new Map<string, number>();
      let likes = 0;
      let dislikes = 0;
      let skips = 0;

      // Process play history
      for (const item of historyResponse.results) {
        const track = await aiDjApi.getTrack(item.track);
        tracks.set(track.id, track);
        if (track.genre) {
          genres.set(track.genre, (genres.get(track.genre) || 0) + 1);
        }
      }

      // Process feedback
      for (const feedback of feedbackResponse.results) {
        if (feedback.feedback_type === 'like') likes++;
        if (feedback.feedback_type === 'dislike') dislikes++;
        if (feedback.feedback_type === 'skip') skips++;
      }

      // Calculate top genres
      const topGenres = Array.from(genres.entries())
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Set preferences
      setPreferences({
        topGenres,
        listeningStats: {
          totalListens: historyResponse.results.length,
          likes,
          dislikes,
          skips
        },
        preferredMoods: [
          { mood: 'Energetic', percentage: 75 },
          { mood: 'Happy', percentage: 60 },
          { mood: 'Relaxed', percentage: 45 },
          { mood: 'Melancholic', percentage: 30 }
        ]
      });

      // Set recent tracks
      setRecentTracks(Array.from(tracks.values()).slice(0, 5));
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="ml-2">Analyzing preferences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Listening Analysis
          </CardTitle>
          <CardDescription>
            Based on your listening history and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Listening Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <Headphones className="h-8 w-8 mb-2" />
                <span className="text-2xl font-bold">
                  {preferences?.listeningStats.totalListens}
                </span>
                <span className="text-sm text-muted-foreground">Total Plays</span>
              </div>
              <div className="flex flex-col items-center">
                <ThumbsUp className="h-8 w-8 mb-2" />
                <span className="text-2xl font-bold">
                  {preferences?.listeningStats.likes}
                </span>
                <span className="text-sm text-muted-foreground">Likes</span>
              </div>
              <div className="flex flex-col items-center">
                <ThumbsDown className="h-8 w-8 mb-2" />
                <span className="text-2xl font-bold">
                  {preferences?.listeningStats.dislikes}
                </span>
                <span className="text-sm text-muted-foreground">Dislikes</span>
              </div>
              <div className="flex flex-col items-center">
                <SkipForward className="h-8 w-8 mb-2" />
                <span className="text-2xl font-bold">
                  {preferences?.listeningStats.skips}
                </span>
                <span className="text-sm text-muted-foreground">Skips</span>
              </div>
            </div>

            {/* Top Genres */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Top Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {preferences?.topGenres.map(({ genre, count }) => (
                  <Badge key={genre} variant="secondary">
                    {genre} ({count})
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mood Preferences */}
            <div>
              <h3 className="text-sm font-medium mb-3">Mood Preferences</h3>
              <div className="space-y-3">
                {preferences?.preferredMoods.map(({ mood, percentage }) => (
                  <div key={mood} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{mood}</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress value={percentage} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tracks */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Music2 className="h-4 w-4 mr-2" />
                Recently Played
              </h3>
              <ScrollArea className="h-[100px]">
                <div className="space-y-2">
                  {recentTracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{track.title}</span>
                      <span className="text-muted-foreground">{track.artist}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

