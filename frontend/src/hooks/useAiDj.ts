import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/useToast";
import { Track, SavedSet, Recommendation, AIDJSession, Feedback } from "@/types/AiDj";
import { aiDjApi } from "@/lib/api/services/AiDj";

/**
 * Hook for managing AI DJ functionality with centralized authentication
 */
export function useAiDj() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentSession, setCurrentSession] = useState<AIDJSession | null>(
    null,
  );
  const { toast } = useToast();

  // Initialize and try to retrieve existing session 
  useEffect(() => {
    // The fetchWithAuth function in the API service already handles authentication
    // via ensureAuthCookie, so we don't need to set cookies here anymore
    
    if (process.env.NODE_ENV === "development") {
      console.log("[useAiDj] Initializing AI DJ hook");
    }
    
    // Ensure authentication tokens are available from localStorage if they exist
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    
    // Verify tokens are still valid
    if (accessToken && refreshToken) {
      // The aiDjApi service will handle token refresh if needed
    } else if (refreshToken && !accessToken) {
      // We have a refresh token but no access token - try to refresh manually
      const refreshAccessToken = async () => {
        try {
          if (process.env.NODE_ENV === "development") {
            console.log("[useAiDj] Attempting to refresh access token with refresh token");
          }
          
          // First try the Next.js API route for token refresh
          const nextResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (nextResponse.ok) {
            if (process.env.NODE_ENV === "development") {
              console.log("[useAiDj] Successfully refreshed token via Next.js API");
            }
            return;
          }
          
          // If that fails, try direct backend call
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
              console.log("[useAiDj] Successfully refreshed access token via direct backend call");
            }
          } else {
            const errorText = await response.text().catch(() => "Unknown error");
            console.error(`[useAiDj] Failed to refresh token: ${response.status} - ${errorText}`);
          }
        } catch (error) {
          console.error("[useAiDj] Failed to refresh token:", error);
        }
      };
      
      refreshAccessToken();
    }
    
    // Try to retrieve an existing session when the hook initializes
    const fetchExistingSession = async () => {
      try {
        const sessions = await aiDjApi.getSessions({ limit: 1, ordering: '-created_at' });
        if (sessions.results && sessions.results.length > 0) {
          setCurrentSession(sessions.results[0]);
        }
      } catch (error) {
        console.error("Failed to retrieve existing session:", error);
      }
    };
    
    fetchExistingSession();
  }, []);

  const startSession = useCallback(
    async (moodSettings?: Record<string, any>) => {
      setIsLoading(true);
      try {
        const session = await aiDjApi.createSession({
          mood_settings: moodSettings,
        });
        setCurrentSession(session);
        toast({
          title: "Session Started",
          description: "Your AI DJ session has begun",
        });
        return session;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start session",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  const endSession = useCallback(async () => {
    if (!currentSession) return;

    setIsLoading(true);
    try {
      await aiDjApi.deleteSession(currentSession.id);
      setCurrentSession(null);
      setCurrentTrack(null);
      toast({
        title: "Session Ended",
        description: "Your AI DJ session has ended",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, toast]);

  const playTrack = useCallback(async (track: Track) => {
    setCurrentTrack(track);
    try {
      // The user parameter will be handled by the backend
      await aiDjApi.createPlayHistory({ track: track.id });
    } catch (error) {
      console.error("Failed to record play history:", error);
    }
  }, []);

  const getRecommendations = useCallback(async () => {
    if (!currentSession) return [];

    setIsLoading(true);
    try {
      // The API now handles authentication and user association
      const response = await aiDjApi.getRecommendations({
        session: currentSession.id,
        limit: 10,
      });
      return response.results || [];
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  const provideFeedback = useCallback(
    async (track: Track, isPositive: boolean) => {
      if (!currentSession) return;

      try {
        // No need to specify user - backend will handle it
        await aiDjApi.createFeedback({
          track: track.id,
          recommendation: null, 
          feedback_type: isPositive ? "like" : "dislike",
          // Note: session is handled by the backend based on the user's authentication
        });

        toast({
          title: isPositive ? "Liked" : "Disliked",
          description: `You ${isPositive ? "liked" : "disliked"} ${track.title}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to record feedback",
          variant: "destructive",
        });
      }
    },
    [currentSession, toast],
  );

  const saveSet = useCallback(
    async (name: string, tracks: Track[]) => {
      try {
        // No need to specify user - backend will handle it
        const savedSet = await aiDjApi.createSavedSet({
          set_name: name,
          track_list: { tracks: tracks.map((t) => t.id) }, 
        });

        toast({
          title: "Set Saved",
          description: `Your set "${name}" has been saved`,
        });

        return savedSet;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save set",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const getSavedSets = useCallback(async () => {
    setIsLoading(true);
    try {
      // The API now handles authentication and user association
      const response = await aiDjApi.getSavedSets();
      return response.results || [];
    } catch (error) {
      console.error("Failed to get saved sets:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    currentTrack,
    currentSession,
    startSession,
    endSession,
    playTrack,
    getRecommendations,
    provideFeedback,
    saveSet,
    getSavedSets,
  };
}
