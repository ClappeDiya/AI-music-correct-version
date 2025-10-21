"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useToast } from "@/components/ui/useToast";
import { GenreSelector } from "./components/GenreSelector";
import { MixingVisualizer } from "./components/MixingVisualizer";
import { MixingControls } from "./components/MixingControls";
import { useMixingSession } from "@/hooks/useMixingSession";
import { AIAnalysisResult } from "@/services/AiAnalysisService";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { InstrumentEffectsControls } from "./components/InstrumentEffectsControls";
import { InstrumentVisualizer } from "./components/InstrumentVisualizer";
import { api } from "@/lib/api";
import { XCircle } from "@/components/icons/XCircle";
import { LockIcon } from "@/components/icons/LockIcon";
import React from "react";

export default function GenreMixingPage() {
  console.log("Rendering GenreMixingPage");

  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  // Log auth state immediately to see what's happening
  console.log("Auth state:", { user, authLoading });
  
  const {
    session,
    genres,
    selectedGenres,
    isLoading,
    error: sessionError,
    createSession,
    updateGenreWeight,
    generateMix,
    downloadMix,
  } = useMixingSession();

  const [analysisData, setAnalysisData] = useState<AIAnalysisResult | undefined>();
  const [hasAccess, setHasAccess] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [error, setError] = useState(sessionError);
  const [debugState, setDebugState] = useState({
    step: "initial", 
    authState: "waiting", 
    sessionState: "none", 
    error: null as string | null
  });

  // Use a clientOnly flag to prevent hydration issues with dynamic content
  const [isClient, setIsClient] = useState(false);
  
  // Use a stable identifier instead of timestamp to prevent hydration mismatch 
  const [mountId] = useState("mount-" + Math.random().toString(36).substring(2, 10));

  // Set client-side rendering flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Log when component mounts  
  useEffect(() => {
    console.log("GenreMixingPage mounted at:", new Date().toISOString());
    // Force update debug state to show we've reached the mount effect
    setDebugState(prev => ({...prev, step: "component_mounted", mountId}));
    return () => {
      console.log("GenreMixingPage unmounting");
    };
  }, [mountId]);

  // Sync errors from session
  useEffect(() => {
    if (sessionError && !error) {
      setError(sessionError);
    }
  }, [sessionError, error]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    console.log("Setting up loading timeout");
    
    const timeoutId = setTimeout(() => {
      console.log("Loading timeout check - authLoading:", authLoading, "isAuthChecked:", isAuthChecked);
      
      if (!isAuthChecked) {
        console.log("Loading timeout exceeded - forcing page to render");
        setIsAuthChecked(true);
        setDebugState(prev => ({...prev, step: "timeout_exceeded", authState: "timeout", error: "Loading timeout exceeded"}));
      }
    }, 10000); // 10-second timeout
    
    return () => {
      console.log("Clearing loading timeout");
      clearTimeout(timeoutId);
    };
  }, [isAuthChecked, authLoading]);

  // Simple auth check that matches the ai_music implementation
  useEffect(() => {
    if (!authLoading) {
      setIsAuthChecked(true);
      setDebugState(prev => ({
        ...prev, 
        step: "auth_checked", 
        authState: user ? "authenticated" : "unauthenticated"
      }));
      
      if (user) {
        setHasAccess(true);
        if (!session) {
          console.log("No session, creating one");
          createSession()
            .then(() => console.log("Session created successfully"))
            .catch(err => {
              console.error("Failed to create session:", err);
              setError(err.message || "Failed to create session");
            });
        }
      } else {
        console.log("No user, redirecting to login");
        router.push('/auth/login?redirect_url=/genre_mixing');
      }
    }
  }, [user, authLoading, router, createSession, session]);

  // Debug panel component that only renders on the client to avoid hydration issues
  const DebugPanel = () => {
    if (!isClient) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 z-50 text-xs">
        <div className="flex justify-between items-center">
          <h4 className="font-bold">Debug Panel</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDebugPanel(!showDebugPanel)}
          >
            {showDebugPanel ? "Hide Details" : "Show Details"}
          </Button>
        </div>
        
        {showDebugPanel && (
          <div className="mt-2 p-2 bg-muted rounded">
            <pre className="overflow-auto max-h-48 text-[10px]">
              {JSON.stringify({
                auth: {
                  user: user ? "authenticated" : "null",
                  isAuthLoading: authLoading,
                  isAuthChecked,
                  hasAccess
                },
                session: {
                  exists: session ? true : false,
                  id: session?.id || "none",
                  genres: selectedGenres?.length || 0,
                  isLoading
                },
                state: {
                  step: debugState.step,
                  authState: debugState.authState,
                  sessionState: debugState.sessionState,
                  mountId
                },
                error: error || null
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  // Show loading state - simplified to avoid hydration issues
  if ((authLoading || !isAuthChecked) && !error) {
    console.log("Rendering loading state");
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-[300px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading genre mixing studio...</p>
              <p className="text-xs text-muted-foreground">Debug: auth_checked / Auth: {isClient ? debugState.authState : "checking"}</p>
            </div>
          </CardContent>
        </Card>
        {isClient && <DebugPanel />}
      </div>
    );
  }

  // Show mixing session loading state
  if (isLoading && isAuthChecked && !error) {
    console.log("Rendering session loading state");
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-[300px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Preparing mixing session...</p>
              <p className="text-xs text-muted-foreground">Session: {isClient ? debugState.sessionState : "loading"}</p>
            </div>
          </CardContent>
        </Card>
        {isClient && <DebugPanel />}
      </div>
    );
  }

  // Show error state
  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-[300px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-destructive">
              <XCircle className="h-8 w-8" />
              <p className="text-sm">{error}</p>
              <Button variant="outline" onClick={() => router.push('/project/dashboard')}>
                Return to Dashboard
              </Button>
              <Button variant="default" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
        {isClient && <DebugPanel />}
      </div>
    );
  }

  // Show access denied state
  if (!hasAccess && isAuthChecked) {
    console.log("Rendering access denied state");
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-[300px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <LockIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You do not have access to this feature.</p>
              <Button variant="outline" onClick={() => router.push('/project/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
        {isClient && <DebugPanel />}
      </div>
    );
  }

  // Main genre mixing studio content
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Genre Mixing Studio</h1>
        <Button variant="outline" onClick={() => router.push('/project/dashboard')}>
          Return to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - Genre Selection & Controls */}
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Genres</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {genres.length > 0 ? (
                  <GenreSelector
                    genres={genres}
                    selectedGenres={selectedGenres}
                    onGenreSelect={(genre) => {
                      if (!session) {
                        createSession().then(() => {
                          updateGenreWeight(genre.id, 50);
                        });
                      } else {
                        updateGenreWeight(genre.id, 50);
                      }
                    }}
                    isLoading={isLoading}
                  />
                ) : (
                  <p className="text-muted-foreground">Loading genres...</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mixing Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MixingControls
                selectedGenres={selectedGenres}
                sessionId={session?.id}
                onWeightChange={updateGenreWeight}
                onGenerateMix={generateMix}
                onDownloadMix={downloadMix}
                onTrackSaved={(trackId) => {
                  toast({
                    title: "Track Saved",
                    description: "Your mixed track has been saved successfully!"
                  });
                }}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Visualizer */}
        <div className="md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Mix Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <MixingVisualizer 
                selectedGenres={selectedGenres}
                waveformData={session?.mixing_outputs?.[0]?.waveform_data}
                notationData={session?.mixing_outputs?.[0]?.notation_data}
                analysisData={analysisData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Instrument Effects */}
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instrument Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <InstrumentVisualizer 
                instruments={["Drums", "Bass", "Keys", "Guitar", "Vocals"]}
                spectrumData={{}}
                stereoData={{}}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Effects</CardTitle>
            </CardHeader>
            <CardContent>
              <InstrumentEffectsControls 
                onInstrumentBalanceChange={(instrument, balance) => {
                  console.log("Balance changed:", instrument, balance);
                }}
                onEffectsChange={(effects) => {
                  console.log("Effects changed:", effects);
                }}
                instruments={["Drums", "Bass", "Keys", "Guitar", "Vocals"]}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {isClient && <DebugPanel />}
    </div>
  );
}
