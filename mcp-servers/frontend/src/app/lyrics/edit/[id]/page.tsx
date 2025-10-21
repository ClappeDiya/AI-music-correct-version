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
import { ArrowLeft, RefreshCw, Save, Users } from 'lucide-react';
import { LyricsEditor } from '@/components/lyrics_editor/LyricsEditor';

interface Track {
  id: number;
  title: string;
  artist: string;
}

export default function EditLyricsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;
  
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No lyrics ID provided. Redirecting to dashboard.',
      });
      router.push('/lyrics');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch lyrics and associated track
        // This would be replaced with an actual API call
        // For now, use mock data
        // const response = await fetch(`/api/lyrics/${id}`);
        // if (!response.ok) throw new Error('Failed to fetch lyrics');
        // const data = await response.json();
        
        // Mock data for development
        const data = {
          id: parseInt(id),
          track: {
            id: 1,
            title: 'Summer Vibes',
            artist: 'DJ Cool'
          },
          lyrics: 'Feeling the heat, dancing in the street...'
        };
        
        setTrack(data.track);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load lyrics information.',
        });
        router.push('/lyrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router, toast]);

  const handleStartCollaboration = () => {
    if (!track) return;
    router.push(`/lyrics/collaborate?trackId=${track.id}`);
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Lyrics</h1>
          <p className="text-muted-foreground mt-1">
            {track?.title} by {track?.artist}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleStartCollaboration}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          <span>Start Collaboration</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lyrics Editor</CardTitle>
          <CardDescription>
            Edit your lyrics and save changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LyricsEditor 
            trackId={track?.id || 0} 
            className="min-h-[500px]"
          />
        </CardContent>
      </Card>
    </div>
  );
} 