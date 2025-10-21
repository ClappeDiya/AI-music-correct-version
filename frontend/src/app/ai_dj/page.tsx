"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/useToast";
import {
  Music,
  ListMusic,
  Sparkles,
  History,
  BarChart,
  Sliders,
} from "lucide-react";
import { TrackList } from "@/components/ai_dj/TrackList";
import { SavedSets } from "@/components/ai_dj/SavedSets";
import { Recommendations } from "@/components/ai_dj/Recommendations";
import { SessionManager } from "@/components/ai_dj/SessionManager";
import { PlayHistoryView } from "@/components/ai_dj/PlayHistory";
import { TrackAnalysis } from "@/components/ai_dj/TrackAnalysis";
import { MixingControls } from "@/components/ai_dj/MixingControls";
import { FeedbackPanel } from "@/components/ai_dj/FeedbackPanel";
import { Track, SavedSet, Recommendation, AIDJSession } from "@/types/AiDj";
import { aiDjApi } from "@/lib/api/services/AiDj";
import { useAiDj } from "@/hooks/useAiDj";
import { MoodControls } from "@/components/ai_dj/MoodControls";
import { useAuth } from "@/contexts/AuthContext";
import Cookies from "js-cookie";

export default function AIDJPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [savedSets, setSavedSets] = useState<SavedSet[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [nextTrack, setNextTrack] = useState<Track | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState("tracks");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentSession, currentTrack, playTrack, provideFeedback } =
    useAiDj();
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      try {
        // Ensure authentication tokens are present
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Set dashboard session cookie with longer expiration for backup auth
        Cookies.set("dashboard_session", "active", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 7 // 7 days
        });
        localStorage.setItem("dashboard_session", "active");
        
        // Verify authentication state first
        const isAuth = await checkAuth();
        
        if (!isAuth) {
          // If not authenticated, try to refresh the token manually
          if (refreshToken) {
            try {
              if (process.env.NODE_ENV === "development") {
                console.log("[AI DJ Page] Attempting manual token refresh");
              }
              
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/token/refresh/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
                credentials: 'include',
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.access) {
                  localStorage.setItem("accessToken", data.access);
                  if (process.env.NODE_ENV === "development") {
                    console.log("[AI DJ Page] Successfully refreshed access token");
                  }
                  
                  // Check authentication again after token refresh
                  await checkAuth();
                }
              } else {
                const errorText = await response.text().catch(() => "Unknown error");
                console.error(`[AI DJ Page] Failed to refresh token: ${response.status} - ${errorText}`);
              }
            } catch (refreshError) {
              console.error("[AI DJ Page] Error refreshing token:", refreshError);
            }
          } else {
            console.warn("[AI DJ Page] No refresh token available");
          }
        }
        
        // Now load the data
        const dataLoaded = await loadData();
        
        if (!dataLoaded) {
          setError("Failed to load data. Please try again.");
        }
      } catch (error) {
        console.error("Failed to initialize AI DJ page:", error);
        setError("Failed to load data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load data. Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        aiDjApi.getTracks(),
        aiDjApi.getSavedSets(),
        aiDjApi.getRecommendations(),
      ]);

      // Process tracks
      if (results[0].status === 'fulfilled') {
        setTracks(results[0].value.results || []);
      } else {
        console.error("Failed to load tracks:", results[0].reason);
      }
      
      // Process saved sets
      if (results[1].status === 'fulfilled') {
        setSavedSets(results[1].value.results || []);
      } else {
        console.error("Failed to load saved sets:", results[1].reason);
      }
      
      // Process recommendations
      if (results[2].status === 'fulfilled') {
        setRecommendations(results[2].value.results || []);
      } else {
        console.error("Failed to load recommendations:", results[2].reason);
      }
      
      return true;
    } catch (error) {
      console.error("Error loading AI DJ data:", error);
      toast({
        title: "Error",
        description: "Failed to load DJ data. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handlePlay = async (track: Track) => {
    try {
      if (currentTrack) {
        // If a track is already playing, set it as next track
        setNextTrack(track);
      } else {
        // If no track is playing, play it directly
        await playTrack(track);
      }
    } catch (error) {
      console.error("Error playing track:", error);
      toast({
        title: "Error",
        description: "Failed to play track",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = async (track: Track, type: "like" | "dislike") => {
    try {
      await provideFeedback(type, track);
    } catch (error) {
      console.error("Error providing feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  const handleSetDelete = async (set: SavedSet) => {
    try {
      await aiDjApi.deleteSavedSet(set.id);
      setSavedSets(savedSets.filter((s) => s.id !== set.id));
      toast({
        title: "Success",
        description: "Set deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting set:", error);
      toast({
        title: "Error",
        description: "Failed to delete set",
        variant: "destructive",
      });
    }
  };

  const handleSetEdit = async (set: SavedSet) => {
    try {
      // Update the saved sets list after editing
      const updatedSets = await aiDjApi.getSavedSets();
      setSavedSets(updatedSets.results || []);
    } catch (error) {
      console.error("Error updating sets after edit:", error);
      toast({
        title: "Error",
        description: "Failed to refresh sets",
        variant: "destructive",
      });
    }
  };

  const handleSetPlay = async (set: SavedSet) => {
    if (set.track_list?.tracks?.length) {
      try {
        // Play the first track
        const firstTrackId = set.track_list.tracks[0];
        const track = await aiDjApi.getTrack(firstTrackId);
        await playTrack(track);
        
        // Queue the rest of the tracks
        if (set.track_list.tracks.length > 1) {
          const nextTrack = await aiDjApi.getTrack(set.track_list.tracks[1]);
          setNextTrack(nextTrack);
        }
      } catch (error) {
        console.error("Error playing set:", error);
        toast({
          title: "Error",
          description: "Failed to play set",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "This set contains no tracks",
        variant: "destructive",
      });
    }
  };

  const handleTransitionStart = () => {
    // Transition is starting
  };

  const handleTransitionEnd = async () => {
    try {
      // After transition, update current track and clear next track
      if (nextTrack) {
        await playTrack(nextTrack);
        setNextTrack(null);
      }
    } catch (error) {
      console.error("Error during track transition:", error);
      toast({
        title: "Error",
        description: "Failed to transition to next track",
        variant: "destructive",
      });
    }
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedback(false);
    loadData(); // Refresh recommendations
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await loadData();
      toast({
        title: "Success",
        description: "Data refreshed successfully!",
      });
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading AI DJ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading AI DJ</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI DJ</h1>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <SessionManager
        currentSession={currentSession}
        onSessionStart={loadData}
        onSessionEnd={loadData}
      />

      {currentSession && (
        <MoodControls
          sessionId={currentSession.id}
          onMoodChange={(settings) => {
            // Refresh recommendations when mood changes
            loadData();
          }}
        />
      )}

      {currentTrack && (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Now Playing</h3>
                <p className="text-sm text-muted-foreground">
                  {currentTrack.title} - {currentTrack.artist}
                </p>
              </div>
              {nextTrack && (
                <div className="text-right">
                  <h3 className="font-medium">Next Up</h3>
                  <p className="text-sm text-muted-foreground">
                    {nextTrack.title} - {nextTrack.artist}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MixingControls
              currentTrack={currentTrack}
              nextTrack={nextTrack}
              onTransitionStart={handleTransitionStart}
              onTransitionEnd={handleTransitionEnd}
            />
            <FeedbackPanel
              track={currentTrack}
              onFeedbackSubmitted={handleFeedbackSubmitted}
            />
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tracks">
            <Music className="h-4 w-4 mr-2" />
            Tracks
          </TabsTrigger>
          <TabsTrigger value="saved-sets">
            <ListMusic className="h-4 w-4 mr-2" />
            Saved Sets
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Sparkles className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="mt-6">
          <TrackList
            tracks={tracks}
            onPlay={handlePlay}
            onFeedback={handleFeedback}
          />
        </TabsContent>

        <TabsContent value="saved-sets" className="mt-6">
          <SavedSets
            savedSets={savedSets}
            onPlay={handleSetPlay}
            onDelete={handleSetDelete}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <Recommendations
            recommendations={recommendations}
            onPlay={handlePlay}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <PlayHistoryView onPlay={handlePlay} />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <TrackAnalysis userId={currentSession?.user || 0} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
