"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ArrowLeft, RefreshCw, Share2, Copy, Users } from 'lucide-react';
import { CollaborativeLyricsEditor } from '@/components/lyrics_editor/CollaborativeLyricsEditor';
import { Input } from '@/components/ui/Input';

interface Track {
  id: number;
  title: string;
  artist: string;
}

export default function CollaborateLyricsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const trackId = searchParams.get('trackId');
  const sessionId = searchParams.get('sessionId');
  
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareLink, setShareLink] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);

  useEffect(() => {
    if (!trackId && !sessionId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No track ID or session ID provided. Redirecting to dashboard.',
      });
      router.push('/lyrics');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch track info if trackId is provided
        if (trackId) {
          // This would be replaced with an actual API call
          // For now, use mock data
          // const trackResponse = await fetch(`/api/tracks/${trackId}`);
          // if (!trackResponse.ok) throw new Error('Failed to fetch track');
          // const trackData = await trackResponse.json();
          
          // Mock data for development
          const trackData = {
            id: parseInt(trackId),
            title: 'Summer Vibes',
            artist: 'DJ Cool'
          };
          
          setTrack(trackData);
          
          // Create a new collaborative session
          // This would be replaced with an actual API call
          // For now, use mock data
          // const sessionResponse = await fetch('/api/lyrics/collaborative-sessions', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify({ trackId }),
          // });
          // if (!sessionResponse.ok) throw new Error('Failed to create collaborative session');
          // const sessionData = await sessionResponse.json();
          
          // Mock data for development
          const sessionData = {
            id: 'new-session-' + Date.now(),
            shareLink: 'https://example.com/share/' + Math.random().toString(36).substring(2, 8)
          };
          
          setShareLink(sessionData.shareLink);
        } 
        // Fetch session info if sessionId is provided
        else if (sessionId) {
          // This would be replaced with an actual API call
          // For now, use mock data
          // const sessionResponse = await fetch(`/api/lyrics/collaborative-sessions/${sessionId}`);
          // if (!sessionResponse.ok) throw new Error('Failed to fetch session');
          // const sessionData = await sessionResponse.json();
          
          // Mock data for development
          const sessionData = {
            id: sessionId,
            track: {
              id: 1,
              title: 'Summer Vibes',
              artist: 'DJ Cool'
            },
            shareLink: 'https://example.com/share/' + Math.random().toString(36).substring(2, 8),
            collaborators: [
              { id: 'user-1', name: 'John Doe', isActive: true },
              { id: 'user-2', name: 'Jane Smith', isActive: true }
            ]
          };
          
          setTrack(sessionData.track);
          setShareLink(sessionData.shareLink);
          setCollaborators(sessionData.collaborators || []);
        }
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

    fetchData();
  }, [trackId, sessionId, router, toast]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: 'Copied',
      description: 'Share link copied to clipboard',
    });
  };

  const generateNewShareLink = async () => {
    try {
      const response = await fetch(`/api/lyrics/collaborative-sessions/${sessionId || ''}/share-link`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to generate share link');
      
      const data = await response.json();
      setShareLink(data.shareLink);
      
      toast({
        title: 'Success',
        description: 'New share link generated',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate share link',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
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
          <h1 className="text-3xl font-bold tracking-tight">Collaborative Editing</h1>
          <p className="text-muted-foreground mt-1">
            {track?.title} by {track?.artist}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Share with Collaborators</CardTitle>
          <CardDescription>
            Invite others to collaborate on these lyrics in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={shareLink}
              readOnly
              className="flex-1"
              placeholder="Share link will appear here..."
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyShareLink}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button
                variant="outline"
                onClick={generateNewShareLink}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">New Link</span>
              </Button>
            </div>
          </div>

          {collaborators.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Active Collaborators ({collaborators.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {collaborators.map((collaborator) => (
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lyrics Editor</CardTitle>
          <CardDescription>
            Changes are saved automatically and visible to all collaborators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CollaborativeLyricsEditor 
            trackId={track?.id || 0} 
            isOwner={true}
            className="min-h-[500px]"
          />
        </CardContent>
      </Card>
    </div>
  );
} 