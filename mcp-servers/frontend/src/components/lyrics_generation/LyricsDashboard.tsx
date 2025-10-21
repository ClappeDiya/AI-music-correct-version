"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/Tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select';
import { useToast } from '@/components/ui/useToast';
import { 
  PenTool, 
  Music, 
  Users, 
  History, 
  Plus, 
  RefreshCw, 
  Search,
  Sparkles,
  BookOpen,
  Share2
} from 'lucide-react';
import { LyricsEditor } from '@/components/lyrics_editor/LyricsEditor';
import { CollaborativeLyricsEditor } from '@/components/lyrics_editor/CollaborativeLyricsEditor';

interface Track {
  id: number;
  title: string;
  artist: string;
  created_at: string;
}

interface LyricsDashboardProps {
  className?: string;
}

export function LyricsDashboard({ className }: LyricsDashboardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-lyrics');
  const [recentLyrics, setRecentLyrics] = useState<any[]>([]);
  const [collaborativeSessions, setCollaborativeSessions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch user's tracks
    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        // This would be replaced with an actual API call
        // For now, use mock data
        // const response = await fetch('/api/tracks');
        // if (!response.ok) throw new Error('Failed to fetch tracks');
        // const data = await response.json();
        
        // Mock data for development
        const data = [
          { id: 1, title: 'Summer Vibes', artist: 'DJ Cool', created_at: '2023-01-15T12:00:00Z' },
          { id: 2, title: 'Midnight Dreams', artist: 'Luna Sky', created_at: '2023-02-20T15:30:00Z' },
          { id: 3, title: 'Urban Flow', artist: 'City Beats', created_at: '2023-03-10T09:45:00Z' },
          { id: 4, title: 'Ocean Waves', artist: 'Coastal Sounds', created_at: '2023-04-05T14:20:00Z' },
          { id: 5, title: 'Mountain Echo', artist: 'Alpine Tunes', created_at: '2023-05-12T11:10:00Z' },
        ];
        
        setTracks(data);
        
        if (data.length > 0) {
          setSelectedTrack(data[0]);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load tracks. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch recent lyrics
    const fetchRecentLyrics = async () => {
      try {
        // This would be replaced with an actual API call
        // For now, use mock data
        // const response = await fetch('/api/lyrics/recent');
        // if (!response.ok) throw new Error('Failed to fetch recent lyrics');
        // const data = await response.json();
        
        // Mock data for development
        const data = [
          { id: 101, track_id: 1, track_title: 'Summer Vibes', created_at: '2023-06-10T10:00:00Z', preview: 'Feeling the heat, dancing in the street...' },
          { id: 102, track_id: 2, track_title: 'Midnight Dreams', created_at: '2023-06-15T14:30:00Z', preview: 'Under the stars, wondering who you are...' },
          { id: 103, track_id: 3, track_title: 'Urban Flow', created_at: '2023-06-20T09:15:00Z', preview: 'City lights, endless nights...' },
        ];
        
        setRecentLyrics(data);
      } catch (error) {
        console.error('Failed to load recent lyrics', error);
      }
    };

    // Fetch collaborative sessions
    const fetchCollaborativeSessions = async () => {
      try {
        // This would be replaced with an actual API call
        // For now, use mock data
        // const response = await fetch('/api/lyrics/collaborative-sessions');
        // if (!response.ok) throw new Error('Failed to fetch collaborative sessions');
        // const data = await response.json();
        
        // Mock data for development
        const data = [
          { id: 'session-1', track_id: 1, track_title: 'Summer Vibes', collaborator_count: 3, share_link: 'https://example.com/share/abc123' },
          { id: 'session-2', track_id: 2, track_title: 'Midnight Dreams', collaborator_count: 2, share_link: 'https://example.com/share/def456' },
        ];
        
        setCollaborativeSessions(data);
      } catch (error) {
        console.error('Failed to load collaborative sessions', error);
      }
    };

    // Call all fetch functions
    fetchTracks();
    fetchRecentLyrics();
    fetchCollaborativeSessions();
  }, [toast]);

  const handleCreateNewLyrics = () => {
    if (!selectedTrack) {
      toast({
        title: 'No Track Selected',
        description: 'Please select a track first.',
        variant: 'destructive',
      });
      return;
    }

    router.push(`/lyrics/create?trackId=${selectedTrack.id}`);
  };

  const handleCreateCollaborativeSession = () => {
    if (!selectedTrack) {
      toast({
        title: 'No Track Selected',
        description: 'Please select a track first.',
        variant: 'destructive',
      });
      return;
    }

    router.push(`/lyrics/collaborate?trackId=${selectedTrack.id}`);
  };

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lyrics Generation</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and collaborate on AI-generated lyrics for your tracks
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateNewLyrics} className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Generate New Lyrics</span>
          </Button>
          <Button 
            onClick={handleCreateCollaborativeSession} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>Collaborate</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Track Selection Panel */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Tracks</CardTitle>
            <CardDescription>Select a track to work with</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tracks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="h-[300px] overflow-y-auto border rounded-md">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTracks.length > 0 ? (
                <div className="divide-y">
                  {filteredTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                        selectedTrack?.id === track.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedTrack(track)}
                    >
                      <div className="font-medium">{track.title}</div>
                      <div className="text-sm text-muted-foreground">{track.artist}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <Music className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No tracks found</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push('/ai_music')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Track
            </Button>
          </CardFooter>
        </Card>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="my-lyrics" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                <span>My Lyrics</span>
              </TabsTrigger>
              <TabsTrigger value="collaborative" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Collaborative</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-lyrics" className="space-y-4">
              {selectedTrack ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedTrack.title}</CardTitle>
                    <CardDescription>by {selectedTrack.artist}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LyricsEditor trackId={selectedTrack.id} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Music className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Track Selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a track from the list or create a new one to start generating lyrics
                    </p>
                    <Button onClick={() => router.push('/ai_music')}>
                      Create New Track
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Lyrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentLyrics.length > 0 ? (
                      <div className="space-y-2">
                        {recentLyrics.slice(0, 5).map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-2 hover:bg-muted rounded-md">
                            <div>
                              <div className="font-medium">{item.track_title}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/lyrics/edit/${item.id}`)}>
                              Edit
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No recent lyrics found
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lyric Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                        <div className="font-medium">Pop Song Structure</div>
                        <div className="text-sm text-muted-foreground">
                          Verse-Chorus-Verse-Chorus-Bridge-Chorus
                        </div>
                      </div>
                      <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                        <div className="font-medium">Hip Hop Verse</div>
                        <div className="text-sm text-muted-foreground">
                          16 bars with complex rhyme schemes
                        </div>
                      </div>
                      <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                        <div className="font-medium">EDM Drop</div>
                        <div className="text-sm text-muted-foreground">
                          Short, catchy phrases for dance music
                        </div>
                      </div>
                      <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                        <div className="font-medium">Ballad Structure</div>
                        <div className="text-sm text-muted-foreground">
                          Emotional storytelling format
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="collaborative" className="space-y-4">
              {selectedTrack ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Collaborative Editing: {selectedTrack.title}</CardTitle>
                    <CardDescription>Real-time collaboration with your team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CollaborativeLyricsEditor trackId={selectedTrack.id} isOwner={true} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Track Selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a track to start a collaborative session
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Active Collaborative Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {collaborativeSessions.length > 0 ? (
                    <div className="space-y-2">
                      {collaborativeSessions.map((session) => (
                        <div key={session.id} className="flex justify-between items-center p-3 hover:bg-muted rounded-md">
                          <div>
                            <div className="font-medium">{session.track_title}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{session.collaborator_count} collaborators</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => router.push(`/lyrics/collaborate/${session.id}`)}
                            >
                              Join
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(session.share_link);
                                toast({
                                  title: 'Link Copied',
                                  description: 'Share link copied to clipboard',
                                });
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No active collaborative sessions
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCreateCollaborativeSession}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Session
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lyrics History</CardTitle>
                  <CardDescription>View and restore previous versions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentLyrics.length > 0 ? (
                      recentLyrics.map((item) => (
                        <div key={item.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <div className="font-medium">{item.track_title}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(item.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => router.push(`/lyrics/edit/${item.id}`)}>
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm">
                                Restore
                              </Button>
                            </div>
                          </div>
                          <div className="bg-muted p-3 rounded-md text-sm max-h-24 overflow-y-auto">
                            {item.preview || 'No preview available'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium mb-2">No History Found</h3>
                        <p className="text-muted-foreground">
                          Your lyrics editing history will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 