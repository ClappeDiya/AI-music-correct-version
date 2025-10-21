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
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select';
import { useToast } from '@/components/ui/useToast';
import { 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Music 
} from 'lucide-react';
import { Slider } from '@/components/ui/Slider';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface Track {
  id: number;
  title: string;
  artist: string;
}

export default function CreateLyricsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const trackId = searchParams.get('trackId');
  
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState<string[]>([]);
  const [selectedLyrics, setSelectedLyrics] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [complexity, setComplexity] = useState(50);
  const [influencer, setInfluencer] = useState('');
  const [activeTab, setActiveTab] = useState('prompt');

  useEffect(() => {
    if (!trackId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No track ID provided. Redirecting to dashboard.',
      });
      router.push('/lyrics');
      return;
    }

    const fetchTrack = async () => {
      try {
        setIsLoading(true);
        // This would be replaced with an actual API call
        // For now, use mock data
        // const response = await fetch(`/api/tracks/${trackId}`);
        // if (!response.ok) throw new Error('Failed to fetch track');
        // const data = await response.json();
        
        // Mock data for development
        const data = {
          id: parseInt(trackId || '1'),
          title: 'Summer Vibes',
          artist: 'DJ Cool'
        };
        
        setTrack(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load track information.',
        });
        router.push('/lyrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrack();
  }, [trackId, router, toast]);

  const handleGenerateLyrics = async () => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a prompt for lyrics generation.',
      });
      return;
    }

    try {
      setIsGenerating(true);
      // This would be replaced with an actual API call
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate generated lyrics
      const mockLyrics = [
        `Verse 1:\nIn the city lights, we find our way\nThrough the darkness, through the rain\nEvery moment, every day\nWe're searching for something to say\n\nChorus:\nThis is our time, this is our song\nThis is where we belong\nIn the rhythm of the night\nWe'll find our way home`,
        
        `Verse 1:\nSilent whispers in the wind\nTelling stories of where we've been\nMemories fade but never end\nIn the echoes of what might have been\n\nChorus:\nWe are the dreamers, we are the believers\nWe are the ones who see beyond the horizon\nWhen the world is sleeping, we're still breathing\nCreating moments that last forever`,
        
        `Verse 1:\nBroken mirrors reflect the truth\nFragments of a forgotten youth\nPieces scattered across the floor\nReminders of what came before\n\nChorus:\nBut we rise from the ashes\nWe build from the dust\nWhen everything crashes\nIn ourselves we trust`
      ];
      
      setGeneratedLyrics(mockLyrics);
      setSelectedLyrics(mockLyrics[0]);
      setActiveTab('results');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate lyrics. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLyrics = async () => {
    if (!selectedLyrics) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select lyrics to save.',
      });
      return;
    }

    try {
      // This would be replaced with an actual API call
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Lyrics saved successfully.',
      });
      
      router.push(`/lyrics/edit/${trackId}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save lyrics. Please try again.',
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
          <h1 className="text-3xl font-bold tracking-tight">Generate Lyrics</h1>
          <p className="text-muted-foreground mt-1">
            {track?.title} by {track?.artist}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="prompt">1. Create Prompt</TabsTrigger>
          <TabsTrigger value="results" disabled={generatedLyrics.length === 0}>2. Review Results</TabsTrigger>
        </TabsList>

        <TabsContent value="prompt">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lyrics Prompt</CardTitle>
                  <CardDescription>
                    Describe the lyrics you want to generate. Include themes, emotions, or specific elements.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="E.g., A song about finding hope in difficult times, with uplifting chorus and emotional verses..."
                    className="min-h-[200px]"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleGenerateLyrics} 
                    disabled={isGenerating || !prompt.trim()}
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Generate Lyrics</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parameters</CardTitle>
                  <CardDescription>
                    Customize your lyrics generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complexity">Complexity</Label>
                    <Slider
                      id="complexity"
                      min={0}
                      max={100}
                      step={1}
                      value={[complexity]}
                      onValueChange={(value) => setComplexity(value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Simple</span>
                      <span>Complex</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="influencer">Style Influencer</Label>
                    <Select value={influencer} onValueChange={setInfluencer}>
                      <SelectTrigger id="influencer">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="hiphop">Hip Hop</SelectItem>
                        <SelectItem value="rnb">R&B</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="edm">EDM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Track Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{track?.title}</div>
                      <div className="text-sm text-muted-foreground">{track?.artist}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Lyrics</CardTitle>
                  <CardDescription>
                    Review and edit the selected lyrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="min-h-[400px] font-mono"
                    value={selectedLyrics || ''}
                    onChange={(e) => setSelectedLyrics(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('prompt')}
                  >
                    Back to Prompt
                  </Button>
                  <Button 
                    onClick={handleSaveLyrics}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Lyrics</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Variations</CardTitle>
                  <CardDescription>
                    Choose from different generated options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedLyrics.map((lyrics, index) => (
                    <div 
                      key={index}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${
                        selectedLyrics === lyrics ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedLyrics(lyrics)}
                    >
                      <div className="font-medium mb-1">Version {index + 1}</div>
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {lyrics.split('\n').slice(0, 2).join(' ')}...
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGenerateLyrics}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <span>Generate More</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 