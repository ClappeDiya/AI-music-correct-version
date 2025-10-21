"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/useToast';
import { ArrowLeft, RefreshCw, Users } from 'lucide-react';
import { CollaborativeLyricsEditor } from '@/components/lyrics_editor/CollaborativeLyricsEditor';

interface Track {
  id: number;
  title: string;
  artist: string;
}

interface Session {
  id: string;
  track: Track;
  owner: {
    id: string;
    name: string;
  };
  collaborators: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
}

export default function JoinCollaborativeSessionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No session ID provided. Redirecting to dashboard.',
      });
      router.push('/lyrics');
      return;
    }

    const fetchSession = async () => {
      try {
        setIsLoading(true);
        
        // Fetch session info
        // This would be replaced with an actual API call
        // For now, use mock data
        // const response = await fetch(`/api/lyrics/collaborative-sessions/${sessionId}`);
        // if (!response.ok) throw new Error('Failed to fetch session');
        // const data = await response.json();
        
        // Mock data for development
        const data = {
          id: sessionId,
          track: {
            id: 1,
            title: 'Summer Vibes',
            artist: 'DJ Cool'
          },
          owner: {
            id: 'owner-1',
            name: 'John Doe'
          },
          collaborators: [
            { id: 'user-1', name: 'John Doe', isActive: true },
            { id: 'user-2', name: 'Jane Smith', isActive: true }
          ]
        };
        
        setSession(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load session information.',
        });
        router.push('/lyrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, router, toast]);

  const handleJoinSession = async () => {
    if (!session) return;
    
    try {
      setIsJoining(true);
      
      // Join the session
      // This would be replaced with an actual API call
      // For now, use mock data
      // const response = await fetch(`/api/lyrics/collaborative-sessions/${sessionId}/join`, {
      //   method: 'POST',
      // });
      // if (!response.ok) throw new Error('Failed to join session');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasJoined(true);
      
      toast({
        title: 'Success',
        description: 'You have joined the collaborative session',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to join the session. Please try again.',
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-2">Session Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The collaborative session you're looking for doesn't exist or has expired.
        </p>
        <Button onClick={() => router.push('/lyrics')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/lyrics')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collaborative Session</h1>
          <p className="text-muted-foreground mt-1">
            {session.track.title} by {session.track.artist}
          </p>
        </div>
      </div>

      {!hasJoined ? (
        <Card>
          <CardHeader>
            <CardTitle>Join Collaborative Session</CardTitle>
            <CardDescription>
              You've been invited to collaborate on lyrics for "{session.track.title}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Session Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Track:</span>
                  <span>{session.track.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Artist:</span>
                  <span>{session.track.artist}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Owner:</span>
                  <span>{session.owner.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Collaborators:</span>
                  <span>{session.collaborators.length} active</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleJoinSession} 
              disabled={isJoining}
              className="w-full"
            >
              {isJoining ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  <span>Join Session</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Collaborative Editing</CardTitle>
            <CardDescription>
              You are now collaborating on lyrics for "{session.track.title}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Active Collaborators ({session.collaborators.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {session.collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        collaborator.isActive ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                    <span>{collaborator.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <CollaborativeLyricsEditor 
              trackId={session.track.id} 
              isOwner={session.owner.id === 'current-user-id'} // Replace with actual user ID check
              className="min-h-[500px]"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 