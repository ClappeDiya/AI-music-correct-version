import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/useToast";
import { Genre, MixingSession, MixingSessionGenre } from "@/types/GenreMixing";
import { api } from "@/lib/api";

interface UseMixingSessionReturn {
  session: MixingSession | null;
  genres: Genre[];
  selectedGenres: MixingSessionGenre[];
  isLoading: boolean;
  error: string | null;
  createSession: () => Promise<void>;
  updateGenreWeight: (genreId: string, weight: number) => Promise<void>;
  generateMix: () => Promise<void>;
  downloadMix: () => Promise<void>;
}

export function useMixingSession(): UseMixingSessionReturn {
  const [session, setSession] = useState<MixingSession | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Log when the hook is initialized
  console.log("useMixingSession hook initialized");

  // Create memoized fetch genres function
  const fetchGenres = useCallback(async () => {
    console.log("useMixingSession: fetchGenres called");
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Making API request to fetch genres");
      // Use a timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Genre fetch timeout")), 10000)
      );
      
      const apiPromise = api.get("/api/genre_mixing/genres/");
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      console.log("Genres fetched successfully:", response?.data?.length || 0);
      
      if (response?.data && Array.isArray(response.data)) {
        setGenres(response.data);
      } else {
        throw new Error("Invalid genre data received");
      }
    } catch (err: any) {
      console.error("Error fetching genres:", err);
      setError(`Failed to fetch genres: ${err.message || "Unknown error"}`);
      toast({
        title: "Warning",
        description: "Using sample genres due to API error",
        variant: "default",
      });
      
      // Always set some fallback genres to allow the UI to function
      const fallbackGenres = [
        { id: "fallback1", name: "Rock", description: "Fallback genre" },
        { id: "fallback2", name: "Jazz", description: "Fallback genre" },
        { id: "fallback3", name: "Electronic", description: "Fallback genre" },
        { id: "fallback4", name: "Classical", description: "Fallback genre" },
        { id: "fallback5", name: "Hip Hop", description: "Fallback genre" },
      ];
      setGenres(fallbackGenres as Genre[]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch available genres on mount with retry
  useEffect(() => {
    console.log("useMixingSession: Fetching genres on mount");
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptFetch = () => {
      fetchGenres().catch(err => {
        console.error(`Genre fetch attempt ${retryCount + 1} failed:`, err);
        if (retryCount < maxRetries) {
          retryCount++;
          // Exponential backoff for retries
          const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
          console.log(`Retrying genre fetch in ${delay}ms...`);
          setTimeout(attemptFetch, delay);
        } else {
          console.error("Max genre fetch retries reached, using fallback genres only");
        }
      });
    };
    
    attemptFetch();
  }, [fetchGenres]);

  // Memoize the createSession function
  const createSession = useCallback(async () => {
    console.log("useMixingSession: createSession called");
    try {
      setIsLoading(true);
      setError(null);
      
      // Add a timeout for the session creation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session creation timeout")), 8000)
      );
      
      console.log("Making API request to create session");
      const apiPromise = api.post("/api/genre_mixing/sessions/", {
        session_name: "New Mix",
        status: "in_progress",
      });
      
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      if (response?.data) {
        console.log("Session created successfully:", response.data);
        setSession(response.data);
        return response.data;
      } else {
        throw new Error("Invalid session data received");
      }
    } catch (err: any) {
      console.error("Error creating session:", err);
      const errorMessage = `Failed to create session: ${err.message || "Unknown error"}`;
      toast({
        title: "Session Creation Issue",
        description: "Using a temporary session for now",
        variant: "default",
      });
      
      // Create a mock session for any mode to ensure the UI works
      console.log("Creating mock session for testing");
      const mockSession = {
        id: "mock-" + Date.now(),
        session_name: "Mix Session",
        status: "in_progress",
        session_genres: [],
        mixing_outputs: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSession(mockSession as MixingSession);
      return mockSession;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateGenreWeight = async (genreId: string, weight: number) => {
    console.log("useMixingSession: updateGenreWeight called", { genreId, weight });
    if (!session) {
      console.warn("Cannot update genre weight: No active session");
      toast({
        title: "Warning",
        description: "Create a session first before adjusting genres",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const existingGenre = session.session_genres.find(
        (sg) => sg.genre.id === genreId,
      );

      if (existingGenre) {
        // Update existing genre weight
        console.log("Updating existing genre weight", existingGenre.id);
        const response = await api.patch(
          `/api/genre_mixing/session-genres/${existingGenre.id}/`,
          { weight },
        );
        setSession({
          ...session,
          session_genres: session.session_genres.map((sg) =>
            sg.id === existingGenre.id ? response.data : sg,
          ),
        });
      } else {
        // Add new genre to session
        console.log("Adding new genre to session", { genreId, sessionId: session.id });
        const response = await api.post("/api/genre_mixing/session-genres/", {
          session: session.id,
          genre: genreId,
          weight,
        });
        setSession({
          ...session,
          session_genres: [...session.session_genres, response.data],
        });
      }
    } catch (err: any) {
      console.error("Error updating genre weight:", err);
      
      // For any mode, update the local state to keep UI responsive
      console.log("Updating local genre weight for improved UX");
      const updatedGenres = [...session.session_genres];
      
      const existingIndex = updatedGenres.findIndex(sg => sg.genre.id === genreId);
      if (existingIndex >= 0) {
        updatedGenres[existingIndex] = {
          ...updatedGenres[existingIndex],
          weight
        };
      } else {
        const selectedGenre = genres.find(g => g.id === genreId);
        if (selectedGenre) {
          updatedGenres.push({
            id: `local-genre-${Date.now()}`,
            session: session.id,
            genre: selectedGenre,
            weight,
          } as MixingSessionGenre);
        }
      }
      
      setSession({
        ...session,
        session_genres: updatedGenres,
      });
      
      // Still inform the user there was an API issue
      toast({
        title: "Warning",
        description: "Changes saved locally but not synced to server",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMix = async () => {
    console.log("useMixingSession: generateMix called");
    if (!session) {
      toast({
        title: "Error",
        description: "No active session to generate mix",
        variant: "destructive", 
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Making API request to generate mix");
      const response = await api.post(
        `/api/genre_mixing/sessions/${session.id}/generate/`,
      );
      
      console.log("Mix generated successfully:", response.data);
      setSession(response.data);
      toast({
        title: "Success",
        description: "Mix generated successfully",
      });
    } catch (err: any) {
      console.error("Error generating mix:", err);
      toast({
        title: "Error",
        description: "Failed to generate mix. Try again or check connection.",
        variant: "destructive",
      });
      
      // Don't set error state to allow user to try again
      // setError(`Failed to generate mix: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMix = async () => {
    console.log("useMixingSession: downloadMix called");
    if (!session?.mixing_outputs?.[0]?.audio_file_url) {
      console.warn("Cannot download mix: No audio file URL available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Making API request to download mix");
      const response = await api.get(session.mixing_outputs[0].audio_file_url, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${session.session_name || "mix"}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("Mix downloaded successfully");
    } catch (err: any) {
      console.error("Error downloading mix:", err);
      setError(`Failed to download mix: ${err.message || "Unknown error"}`);
      toast({
        title: "Error",
        description: "Failed to download mix",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    genres,
    selectedGenres: session?.session_genres || [],
    isLoading,
    error,
    createSession,
    updateGenreWeight,
    generateMix,
    downloadMix,
  };
}
