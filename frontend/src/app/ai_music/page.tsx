"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/useToast";
import { MusicGenerationForm } from "./components/MusicGenerationForm";
import { WaveformVisualizer } from "./components/WaveformVisualizer";
import { PlaybackControls } from "./components/PlaybackControls";
import { ModuleIntegration } from "@/components/integration/ModuleIntegration";
import { generateTrack, getGenerationStatus } from "@/services/api/ai_music";
import type { GenerationRequest, Track as BaseTrack } from "@/types/AiMusic";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useSearchParams } from "next/navigation";
import { SunoGenerationPanel } from "./components/SunoGenerationPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

// Define a type for the response data to handle various shapes
interface ResponseData {
  request?: { 
    id: string;
    [key: string]: any;
  };
  id?: string;
  music_request?: { 
    id: string;
    [key: string]: any;
  };
  track_request?: { 
    id: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Extended track type that includes additional fields we're using
interface Track extends BaseTrack {
  // Additional fields that might be in the API response but not in the base type
  title?: string;
  style?: string;
  mood?: string;
  tempo?: number;
}

// Utility function to safely clear intervals with proper type checking
const safeClearInterval = (interval: NodeJS.Timeout | null): void => {
  if (interval) {
    clearInterval(interval);
  }
};

export default function AIMusicPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [initialFormValues, setInitialFormValues] = useState<Record<string, any> | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [authRetries, setAuthRetries] = useState(0);
  const [activePollingInterval, setActivePollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isThrottled, setIsThrottled] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, checkAuth, getUserFromLocalStorage } = useAuth();
  const [showSunoPanel, setShowSunoPanel] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<Track[]>([]);
  
  // Handle the case where ProjectProvider might not be available
  let projectContext = null;
  let projectId = null;
  try {
    // Try to use the project context, but don't throw if it's not available
    projectContext = useProject();
    const searchParams = useSearchParams();
    // Ensure searchParams is not null before calling methods on it
    if (searchParams) {
      projectId = searchParams.get('projectId');
    }
  } catch (e) {
    console.log("Project context not available, running in standalone mode");
  }
  
  // Safely access project and dispatch
  const project = projectContext?.project;
  const dispatch = projectContext?.dispatch;
  
  // Check authentication when component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        const isAuth = await checkAuth();
        
        if (!isAuth) {
          setGenerationError("Please log in to generate music.");
          toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "You need to be logged in to generate music.",
          });
        } else if (!user) {
          // Auth is true but no user - check localStorage
          const localUser = getUserFromLocalStorage();
          if (!localUser) {
            console.warn("Authenticated but no user found");
          } else {
            console.log("Retrieved user from localStorage:", localUser);
          }
        }
      }
    };
    
    verifyAuth();
  }, [isAuthenticated, checkAuth, user, toast, getUserFromLocalStorage]);
  
  // Cleanup active polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (activePollingInterval) {
        console.log("Cleaning up active polling interval on unmount");
        safeClearInterval(activePollingInterval);
      }
    };
  }, [activePollingInterval]);
  
  // Callback for receiving parameters from other modules
  const handleParametersReceived = useCallback((params: Record<string, any>) => {
    // Update the form with received parameters
    const formValues: Record<string, any> = {};
    
    if (params.tempo) {
      formValues.tempo = params.tempo;
    }
    
    if (params.complexity) {
      formValues.complexity = params.complexity;
    }
    
    if (params.emotionalTone) {
      formValues.mood = params.emotionalTone;
    }
    
    if (params.genre) {
      formValues.style = params.genre;
    }
    
    setInitialFormValues(formValues);
  }, []);
  
  // Callback for sharing parameters with other modules
  const handleParametersShared = useCallback(() => {
    // Return the current music generation parameters
    return {
      tempo: currentTrack?.tempo || currentTrack?.metadata?.tempo || 120,
      style: currentTrack?.style || 'pop',
      mood: currentTrack?.mood || 'neutral'
    };
  }, [currentTrack]);

  const handleGeneration = async (data: {
    prompt: string;
    style: string;
    mood: string;
    duration: number;
    complexity: number;
    advancedParameters?: any;
  }) => {
    try {
      // Reset any previous errors
      setGenerationError(null);
      
      // Perform a comprehensive authentication check with up to 2 retries
      let currentUser = user;
      const maxRetries = 2;
      
      // If no user, try multiple sources with retries
      if (!currentUser) {
        console.log("No user found initially, trying multiple sources...");
        
        // Try getting user from local storage first
        currentUser = getUserFromLocalStorage();
        
        if (!currentUser) {
          // If still no user, check authentication
          const isAuth = await checkAuth();
          
          if (isAuth) {
            // Wait a moment for context to update
            await new Promise(resolve => setTimeout(resolve, 300));
            currentUser = user || getUserFromLocalStorage();
            
            // If still no user but authenticated, retry with exponential backoff
            if (!currentUser && authRetries < maxRetries) {
              const retryDelay = Math.pow(2, authRetries) * 500; // 500ms, 1000ms for retries
              console.log(`Retry ${authRetries + 1}/${maxRetries} - waiting ${retryDelay}ms`);
              
              setAuthRetries(prev => prev + 1);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              
              // Try once more to get user after waiting
              currentUser = getUserFromLocalStorage();
              if (!currentUser) {
                // Force a checkAuth call again
                await checkAuth();
                currentUser = user || getUserFromLocalStorage();
              }
            }
          }
          
          if (!currentUser) {
            throw new Error("Authentication required. Please log in to generate music.");
          }
        }
      }
      
      // Reset retry counter if we have a user
      if (currentUser) {
        setAuthRetries(0);
      }
      
      // Log user information before proceeding
      console.log("Proceeding with user:", currentUser);
      
      setIsGenerating(true);

      const request: Partial<GenerationRequest> = {
        // Use the userId safely - if it's not available, the backend service will handle it
        userId: currentUser?.id,
        prompt: data.prompt,
        style: data.style,
        mood: data.mood,
        duration: data.duration,
        format: "mp3", // Default format
        status: "pending",
      };

      // Log the request to help debug
      console.log("Sending generation request:", request);

      const response = await generateTrack(request);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to generate music");
      }

      // Extract the requestId, handling different possible response structures
      let requestId: string | undefined;
      console.log("Response data structure:", JSON.stringify(response.data, null, 2));
      
      // Cast response.data to our flexible ResponseData type
      const responseData = response.data as ResponseData;
      
      // Handle different possible response structures
      if (responseData.request && responseData.request.id) {
        // Original expected format
        requestId = responseData.request.id;
      } else if (responseData.id) {
        // Alternative format where ID is directly on the data object
        requestId = responseData.id;
      } else if (typeof responseData === 'object') {
        // Try to find an id property in the response data
        const possibleId = Object.keys(responseData).find(key => 
          ['id', 'request_id', 'track_id', 'requestId'].includes(key)
        );
        
        if (possibleId) {
          requestId = responseData[possibleId];
        } else {
          // If we have a nested request object but with different structure
          const nestedRequest = responseData.request || responseData.music_request || responseData.track_request;
          if (nestedRequest && 'id' in nestedRequest) {
            requestId = nestedRequest.id;
          }
        }
      }
      
      // If we still couldn't find an ID, throw an error
      if (!requestId) {
        console.error("Could not find request ID in response:", response.data);
        throw new Error("Invalid response from server: Missing request ID");
      }

      // Clear any existing polling interval
      if (activePollingInterval) {
        safeClearInterval(activePollingInterval);
      }

      // Start polling for status
      let pollAttempts = 0;
      let pollDelay = 3000; // Start with 3 seconds interval
      const maxPollAttempts = 30; // Maximum number of polling attempts (approx. 10 minutes with exponential growth)
      const maxPollDelay = 30000; // Maximum delay between polls (30 seconds)

      // Define the poll handler as a named function so we can reuse it when creating new intervals
      const pollHandler = async () => {
        try {
          pollAttempts++;
          
          // Log polling attempt
          console.log(`Polling attempt ${pollAttempts} with delay ${pollDelay}ms`);
          
          // Check if we've reached the maximum number of attempts
          if (pollAttempts > maxPollAttempts) {
            safeClearInterval(activePollingInterval);
            setActivePollingInterval(null);
            setIsGenerating(false);
            setIsThrottled(false);
            throw new Error("Generation is taking too long. Please check again later.");
          }
          
          const statusResponse = await getGenerationStatus(requestId);
          
          // Log the status response for debugging
          console.log(`Status check response (success=${statusResponse.success}):`, 
            statusResponse.success ? 
              `status=${statusResponse.data?.status || 'unknown'}` : 
              `error=${statusResponse.error?.message || 'unknown error'}`
          );
          
          // Handle rate limiting errors (429) - check for specific patterns in the response
          if (!statusResponse.success) {
            // Check different ways a 429 might be indicated in the response
            const isRateLimited = 
              // Direct status code
              statusResponse.error?.status === 429 || 
              // Status in error object
              statusResponse.error?.code === '429' ||
              // Status code in message string
              (statusResponse.error?.message && 
                (statusResponse.error.message.includes('429') || 
                 statusResponse.error.message.toLowerCase().includes('too many requests') ||
                 statusResponse.error.message.toLowerCase().includes('rate limit')));
            
            if (isRateLimited) {
              console.warn("Rate limited, increasing delay before next poll");
              
              // Set throttled state
              setIsThrottled(true);
              
              // Clear current interval
              safeClearInterval(activePollingInterval);
              
              // Increase the polling delay using exponential backoff
              pollDelay = Math.min(pollDelay * 2.5, maxPollDelay);
              
              // Toast notification to inform user
              toast({
                title: "Polling Rate Limited",
                description: "Server is busy, automatically reducing polling frequency...",
                duration: 3000,
              });
              
              // Set a new interval with the increased delay
              const newPollInterval = setInterval(pollHandler, pollDelay);
              setActivePollingInterval(newPollInterval);
              
              // Don't throw error, just return from this attempt
              return;
            }
          }
          
          // Reset throttled state on successful responses
          if (isThrottled) {
            setIsThrottled(false);
          }
          
          if (!statusResponse.success) {
            safeClearInterval(activePollingInterval);
            setActivePollingInterval(null);
            setIsThrottled(false);
            throw new Error(
              statusResponse.error?.message || "Failed to get generation status"
            );
          }

          // Safely check if the track is completed and has data
          const isCompleted = statusResponse.data?.status === "completed";
          const hasTrackData = Boolean(statusResponse.data?.track);
          const hasResults = Boolean(statusResponse.data?.results);
          
          if (isCompleted && (hasTrackData || hasResults)) {
            safeClearInterval(activePollingInterval);
            setActivePollingInterval(null);
            
            if (hasTrackData) {
              // Use track data directly if available
              setCurrentTrack(statusResponse.data.track);
              
              // If we're in project context, add this track to the project
              if (projectId && project && dispatch) {
                const trackForProject = statusResponse.data.track;
                dispatch({ 
                  type: 'ADD_TRACK', 
                  payload: {
                    id: trackForProject.id,
                    name: trackForProject.title || 'Untitled Track',
                    audioUrl: trackForProject.url,
                    waveformData: trackForProject.waveform
                  }
                });
                
                // Update the mood parameters based on the track
                dispatch({
                  type: 'UPDATE_MOOD',
                  payload: {
                    emotionalTone: data.mood,
                    tempo: data.advancedParameters?.tempo || 120,
                    complexity: data.complexity
                  }
                });
                
                // Update the genre parameters
                dispatch({
                  type: 'UPDATE_GENRE',
                  payload: {
                    primaryGenre: data.style,
                    influences: data.advancedParameters?.influences || []
                  }
                });
                
                toast({
                  title: "Track Added to Project",
                  description: "The generated track has been added to your project."
                });
              }
            } else if (hasResults) {
              // Try to extract track data from results
              const resultsObj = statusResponse.data.results;
              let extractedTrack: Track | null = null;
              
              // Look for track data in different possible locations
              if (resultsObj.track) {
                extractedTrack = resultsObj.track;
              } else if (resultsObj.generated_track) {
                extractedTrack = resultsObj.generated_track;
              } else if (resultsObj.url || resultsObj.audio_file_url) {
                // If results itself contains track-like fields
                extractedTrack = {
                  id: resultsObj.id || `result-${Date.now()}`,
                  url: resultsObj.url || resultsObj.audio_file_url,
                  duration: resultsObj.duration || 0,
                  waveform: resultsObj.waveform || resultsObj.waveform_data || [],
                  title: resultsObj.title || 'Generated Track',
                  style: data.style,
                  mood: data.mood,
                  tempo: data.advancedParameters?.tempo || 120,
                  // Add required Track properties
                  requestId: requestId,
                  format: "mp3",
                  metadata: {
                    tempo: data.advancedParameters?.tempo || 120,
                    key: data.advancedParameters?.key || 'C',
                    timeSignature: data.advancedParameters?.timeSignature || '4/4',
                    instruments: data.advancedParameters?.instruments || ['synth']
                  }
                };
              }
              
              if (extractedTrack) {
                setCurrentTrack(extractedTrack);
                
                // If we're in project context, add this track to the project
                if (projectId && project && dispatch) {
                  dispatch({ 
                    type: 'ADD_TRACK', 
                    payload: {
                      id: extractedTrack.id,
                      name: extractedTrack.title || 'Untitled Track',
                      audioUrl: extractedTrack.url,
                      waveformData: extractedTrack.waveform
                    }
                  });
                  
                  // Update the mood parameters based on the track
                  dispatch({
                    type: 'UPDATE_MOOD',
                    payload: {
                      emotionalTone: data.mood,
                      tempo: data.advancedParameters?.tempo || 120,
                      complexity: data.complexity
                    }
                  });
                  
                  // Update the genre parameters
                  dispatch({
                    type: 'UPDATE_GENRE',
                    payload: {
                      primaryGenre: data.style,
                      influences: data.advancedParameters?.influences || []
                    }
                  });
                  
                  toast({
                    title: "Track Added to Project",
                    description: "The generated track has been added to your project."
                  });
                }
              } else {
                // No usable track data found
                throw new Error("Generated track is missing required data");
              }
            }
            
            setIsGenerating(false);
          } else if (statusResponse.data?.status === "failed") {
            safeClearInterval(activePollingInterval);
            setActivePollingInterval(null);
            setIsGenerating(false);
            throw new Error(
              statusResponse.data?.error || "Music generation failed"
            );
          } else if (!isCompleted && !statusResponse.data?.status) {
            // Handle case where the status field is missing
            console.warn("Status response missing expected 'status' field:", statusResponse);
          } else {
            // Still in progress - apply exponential backoff for the next poll
            safeClearInterval(activePollingInterval);
            pollDelay = Math.min(pollDelay * 1.5, maxPollDelay);
            const newPollInterval = setInterval(pollHandler, pollDelay);
            setActivePollingInterval(newPollInterval);
          }
        } catch (pollingError) {
          safeClearInterval(activePollingInterval);
          setActivePollingInterval(null);
          setIsGenerating(false);
          
          const errorMessage = pollingError instanceof Error 
            ? pollingError.message 
            : "Error while checking generation status";
            
          setGenerationError(errorMessage);
          console.error("Polling error:", pollingError);
          
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: errorMessage,
          });
        }
      };

      // Start the polling process
      const pollInterval = setInterval(pollHandler, pollDelay);
      
      // Save the interval reference for cleanup
      setActivePollingInterval(pollInterval);
    } catch (error: any) {
      setIsGenerating(false);
      
      // Set error message for display
      const errorMessage = error.message || "Failed to generate music";
      setGenerationError(errorMessage);
      console.error("Generation error:", error);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: errorMessage,
      });
      
      // If unauthorized, suggest re-login
      if (errorMessage.includes("Authentication") || 
          errorMessage.includes("logged in") || 
          errorMessage.includes("user") || 
          errorMessage.includes("token")) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log out and log in again to refresh your session.",
        });
      }
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  // Handle completion from Suno generation
  const handleSunoGenerationComplete = useCallback((audioUrl: string, metadata: any) => {
    // Create a track from Suno generation
    const newTrack: Track = {
      id: `suno-${Date.now()}`,
      url: audioUrl,
      title: metadata.prompt || "Suno Generated Track",
      provider: "suno",
      metadata: {
        ...metadata,
        generationTime: new Date().toISOString()
      }
    };
    
    setCurrentTrack(newTrack);
    setGeneratedTracks(prev => [...prev, newTrack]);
    setIsGenerating(false);
  }, []);

  return (
    <ModuleIntegration 
      moduleName="ai_music"
      onParametersReceived={handleParametersReceived}
      onParametersShared={handleParametersShared}
    >
      <div className="container mx-auto py-8 px-4 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Music Generation</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 space-y-6">
            {/* Add tabs for different generation methods */}
            <Tabs defaultValue="standard">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="standard">Standard (Backend)</TabsTrigger>
                <TabsTrigger value="suno">Suno Direct</TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard">
                <MusicGenerationForm 
                  onSubmit={handleGeneration} 
                  isLoading={isGenerating}
                  initialValues={initialFormValues}
                />
              </TabsContent>
              
              <TabsContent value="suno">
                <SunoGenerationPanel 
                  onGenerationComplete={handleSunoGenerationComplete}
                />
              </TabsContent>
            </Tabs>
            
            {currentTrack ? (
              <>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {currentTrack.title || `Generated Track ${currentTrack.id}`}
                  </h2>
                  
                  <WaveformVisualizer
                    audioUrl={currentTrack.url}
                    waveformData={currentTrack.waveform}
                  />
                  
                  <div className="mt-4">
                    <PlaybackControls
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayPause}
                      onSeek={handleSeek}
                      onVolumeChange={handleVolumeChange}
                      currentTime={currentTime}
                      duration={currentTrack.duration || 0}
                      volume={volume}
                    />
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-6 flex items-center justify-center min-h-[300px]">
                <div className="text-center text-muted-foreground">
                  {isGenerating ? (
                    <div className="space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p>Generating your music...</p>
                      {isThrottled && (
                        <p className="text-sm text-amber-500">
                          Polling frequency reduced due to server load. Please be patient.
                        </p>
                      )}
                    </div>
                  ) : generationError ? (
                    <div className="space-y-2">
                      <p className="text-destructive font-medium">Generation Error</p>
                      <p>{generationError}</p>
                    </div>
                  ) : (
                    <p>Generated track will appear here</p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ModuleIntegration>
  );
}
