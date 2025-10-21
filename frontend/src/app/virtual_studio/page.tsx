"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Music2, BarChart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import type { StudioSession } from "@/types/virtual_studio";
import { useVirtualStudio } from "@/hooks/useVirtualStudio";
import { directVirtualStudioApi } from "@/services/virtual_studio/direct-api";
import Link from "next/link";

// Mock data to use when API is not available
const MOCK_SESSIONS: StudioSession[] = [
  {
    id: 1,
    session_name: "My First Demo Track",
    description: "Electronic dance music with synth and bass",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false,
    user: 1,
    collaborators: []
  },
  {
    id: 2,
    session_name: "Acoustic Guitar Session",
    description: "Acoustic guitar recording with vocals",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    is_public: true,
    user: 1,
    collaborators: [2, 3]
  },
  {
    id: 3,
    session_name: "Piano Composition",
    description: "Classical piano composition",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    is_public: false,
    user: 1,
    collaborators: []
  }
];

export default function VirtualStudioPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<StudioSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const { api, isLoading: authLoading, isAuthenticated } = useVirtualStudio();

  const handleCreateSession = () => {
    router.push("/virtual_studio/new");
  };

  const handleSessionClick = (sessionId: number) => {
    router.push(`/virtual_studio/${sessionId}`);
  };

  const toggleMockData = () => {
    const newUseMockData = !useMockData;
    setUseMockData(newUseMockData);
    
    if (newUseMockData) {
      setSessions(MOCK_SESSIONS);
      setError(null);
      setLoading(false);
    } else {
      // Reload real data
      loadSessions();
    }
  };

  // Define columns with access to handleSessionClick
  const columns = [
    {
      accessorKey: "session_name",
      header: "Session Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: { row: { original: StudioSession } }) => {
        return new Date(row.original.created_at).toLocaleDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: StudioSession } }) => {
        return (
          <Button
            onClick={() => handleSessionClick(row.original.id)}
            variant="ghost"
            size="sm"
          >
            Open
          </Button>
        );
      },
    },
  ];

  const loadSessions = async () => {
    // If we're already loading or using mock data, don't do anything
    if (loading && !useMockData) return;
    if (useMockData) {
      setSessions(MOCK_SESSIONS);
      setLoading(false);
      return;
    }
    
    // Start loading
    setLoading(true);
    setError(null);
    
    // Set a timeout to automatically fall back to mock data if API request takes too long
    let isTimedOut = false;
    const timeoutId = setTimeout(() => {
      console.log('[VirtualStudio] API request timed out, switching to mock data');
      if (loading && !useMockData) {
        isTimedOut = true;
        setSessions(MOCK_SESSIONS);
        setUseMockData(true);
        setLoading(false);
        setError("API request timed out. Using mock data for demonstration.");
      }
    }, 5000); // 5 seconds timeout
    
    try {
      // If we're not authenticated, default to mock data
      if (!isAuthenticated) {
        console.log('[VirtualStudio] Not authenticated, using mock data');
        setSessions(MOCK_SESSIONS);
        setUseMockData(true);
        clearTimeout(timeoutId);
        return;
      }
      
      console.log('[VirtualStudio] Loading sessions from API');
      
      // Use direct fetch with robust error handling
      const apiUrl = '/api/virtual_studio/sessions/';
      console.log(`[VirtualStudio] Making direct request to: ${apiUrl}`);
      
      try {
        const data = await directVirtualStudioApi.getSessions();
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        // Only process the response if we didn't already timeout
        if (!isTimedOut) {
          if (!data || data.length === 0) {
            console.log('[VirtualStudio] No sessions found');
            setSessions([]);
          } else {
            console.log(`[VirtualStudio] Loaded ${data.length} sessions`);
            setSessions(data);
          }
          setLoading(false);
        }
      } catch (apiError) {
        console.error('[VirtualStudio] Error from API getSessions:', apiError);
        
        // Clear the timeout since we got a response (even if it's an error)
        clearTimeout(timeoutId);
        
        // Only handle the error if we didn't already timeout
        if (!isTimedOut) {
          if (!useMockData) {
            console.log('[VirtualStudio] API error, switching to mock data');
            setSessions(MOCK_SESSIONS);
            setUseMockData(true);
            setError("API error occurred. Using mock data for demonstration.");
          } else {
            setSessions([]);
            setError("Failed to load sessions. Please try again later.");
          }
          setLoading(false);
        }
      }
    } catch (error) {
      // This catch handles any other errors in the try block
      console.error("[VirtualStudio] Unexpected error:", error);
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      // Only handle the error if we didn't already timeout
      if (!isTimedOut) {
        if (!useMockData) {
          console.log('[VirtualStudio] Unexpected error, switching to mock data');
          setSessions(MOCK_SESSIONS);
          setUseMockData(true);
          setError("An unexpected error occurred. Using mock data for demonstration.");
        } else {
          setSessions([]);
          setError("Failed to load sessions. Please try again later.");
        }
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Only attempt to load sessions after auth check completes
    if (authLoading) return;
    
    // Load sessions
    loadSessions();
    
    // Add cleanup function for any pending operations when component unmounts
    return () => {
      // Any cleanup code here if needed
    };
  }, [authLoading, isAuthenticated, useMockData]);

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Music2 className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Virtual Studio</h1>
          </div>
        </div>
        
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Please sign in to access the Virtual Studio.</p>
            <Link href="/auth/login?redirect_url=/virtual_studio" className="no-underline">
              <Button>Sign In</Button>
            </Link>
            <div className="mt-6">
              <Button variant="outline" onClick={() => {
                setUseMockData(true);
                setSessions(MOCK_SESSIONS);
                setLoading(false);
              }}>
                Continue with Demo Mode
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Demo mode uses mock data and limited functionality.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Music2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Virtual Studio</h1>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={toggleMockData} 
            variant={useMockData ? "default" : "outline"}
          >
            {useMockData ? "Using Mock Data" : "Use Mock Data"}
          </Button>
          <Button onClick={handleCreateSession}>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions?.length || 0}</div>
            {useMockData && (
              <div className="text-xs text-gray-500 mt-1">Using mock data</div>
            )}
          </CardContent>
        </Card>
        {/* Add more stats cards here */}
      </div>

      {error && (
        <Card className="mb-6">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="text-red-500">{error}</div>
            {!useMockData && (
              <Button onClick={toggleMockData} variant="outline" size="sm">
                Switch to Mock Data
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Studio Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4">No sessions found</div>
              <Button onClick={handleCreateSession}>Create Your First Session</Button>
            </div>
          ) : (
            <DataTable columns={columns} data={sessions} searchKey="session_name" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
