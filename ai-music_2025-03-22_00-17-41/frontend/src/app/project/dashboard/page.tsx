"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/useToast';
import { useProject } from '@/contexts/ProjectContext';
import { useCreativeParameters } from '@/hooks/useCreativeParameters';
import { formatDateTime } from '@/lib/utils';
import {
  Music,
  PenTool,
  Mic2,
  Globe,
  Layers,
  Sliders,
  BarChart3,
  UserPlus,
  Clock,
  ArrowRight,
  Save,
  Share2,
  Edit,
  Calendar,
  PlayCircle,
  Sparkles,
  Headphones,
  Users,
  BookOpen
} from 'lucide-react';
import { ClientOnlyTimestamp } from '@/components/ui/ClientOnlyTimestamp';

export default function ProjectDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { project, saveProject, navigateToModule, getSuggestedNextSteps } = useProject();
  const { applyPreset } = useCreativeParameters();
  
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Load project if ID is provided in URL
  useEffect(() => {
    if (searchParams) {
      const projectId = searchParams.get('projectId');
      if (projectId && projectId !== project.id) {
        // In a real implementation, we would load the project
        // For now, we'll just show a toast since we're focusing on the UI
        toast({
          title: "Project Loaded",
          description: `Project ${projectId} has been loaded.`,
        });
      }
    }
  }, [searchParams, project.id, toast]);
  
  // Handle saving the project title
  const handleSaveTitle = async () => {
    if (projectTitle.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Project title cannot be empty.",
      });
      return;
    }
    
    try {
      // Update the project title in the project context
      project.title = projectTitle;
      
      // Save the updated project
      await saveProject();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Project title updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project title.",
      });
    }
  };
  
  // Function to determine appropriate icon for a module
  const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
      case 'ai_music':
        return <Music className="h-5 w-5" />;
      case 'lyrics':
        return <PenTool className="h-5 w-5" />;
      case 'voice_cloning':
        return <Mic2 className="h-5 w-5" />;
      case 'genre_mixing':
        return <Globe className="h-5 w-5" />;
      case 'mood_music':
        return <BarChart3 className="h-5 w-5" />;
      case 'virtual_studio':
        return <Sliders className="h-5 w-5" />;
      case 'ai_dj':
        return <Headphones className="h-5 w-5" />;
      default:
        return <Layers className="h-5 w-5" />;
    }
  };
  
  // Get suggestions based on project state
  const suggestedNextSteps = getSuggestedNextSteps();
  
  return (
    <div className="container mx-auto py-6 h-full overflow-y-auto">
      {/* Project header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="text-xl font-bold w-[300px]"
              />
              <Button onClick={handleSaveTitle} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="ml-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <ClientOnlyTimestamp timestamp={project.lastModified} />
          </div>
          
          <Button variant="outline" onClick={() => saveProject()}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button variant="default">
            <PlayCircle className="h-4 w-4 mr-2" />
            Play
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
          <TabsTrigger value="vocals">Vocals</TabsTrigger>
          <TabsTrigger value="mixing">Mixing</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Suggested next steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Suggested Next Steps
              </CardTitle>
              <CardDescription>
                Based on your project's current state, here are some recommended actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedNextSteps.map((suggestion, index) => (
                  <Card key={index} className="overflow-hidden border border-muted">
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getModuleIcon(suggestion.module)}
                        {suggestion.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end">
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => navigateToModule(suggestion.module)}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Go
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Project summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Creative elements */}
            <Card>
              <CardHeader>
                <CardTitle>Creative Elements</CardTitle>
                <CardDescription>
                  Components that make up your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-primary" />
                      <span className="font-medium">Music Tracks</span>
                    </div>
                    <span>{project.tracks.length} tracks</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <PenTool className="h-5 w-5 text-primary" />
                      <span className="font-medium">Lyrics</span>
                    </div>
                    <span>{project.lyrics.length} sets</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Mic2 className="h-5 w-5 text-primary" />
                      <span className="font-medium">Vocal Profiles</span>
                    </div>
                    <span>{project.vocalProfiles.length} profiles</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab('music')}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
            
            {/* Creative parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Creative Parameters</CardTitle>
                <CardDescription>
                  Current mood and genre settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <span className="font-medium">Mood</span>
                    </div>
                    <span className="capitalize">{project.moodParameters.emotionalTone}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      <span className="font-medium">Genre</span>
                    </div>
                    <span className="capitalize">{project.genreParameters.primaryGenre}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-medium">Tempo</span>
                    </div>
                    <span>{project.moodParameters.tempo} BPM</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigateToModule('mood_music')}>
                  Adjust Parameters
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Module access */}
          <Card>
            <CardHeader>
              <CardTitle>Creative Modules</CardTitle>
              <CardDescription>
                Direct access to any part of the creative process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start flex-col items-center"
                  onClick={() => navigateToModule('ai_music')}
                >
                  <div className="p-2 rounded-full bg-primary/10 mb-2">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">AI Music Generation</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start flex-col items-center"
                  onClick={() => navigateToModule('lyrics')}
                >
                  <div className="p-2 rounded-full bg-primary/10 mb-2">
                    <PenTool className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Lyrics Integration</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start flex-col items-center"
                  onClick={() => navigateToModule('voice_cloning')}
                >
                  <div className="p-2 rounded-full bg-primary/10 mb-2">
                    <Mic2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Voice Cloning</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start flex-col items-center"
                  onClick={() => navigateToModule('virtual_studio')}
                >
                  <div className="p-2 rounded-full bg-primary/10 mb-2">
                    <Sliders className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Virtual Studio</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start flex-col items-center"
                  onClick={() => navigateToModule('genre_mixing')}
                >
                  <div className="p-2 rounded-full bg-primary/10 mb-2">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Genre Mixing</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start flex-col items-center"
                  onClick={() => navigateToModule('mood_music')}
                >
                  <div className="p-2 rounded-full bg-primary/10 mb-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Mood-Based Music</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start flex-col items-center"
                  onClick={() => navigateToModule('ai_dj')}
                >
                  <div className="p-2 rounded-full bg-primary/10 mb-2">
                    <Headphones className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">AI DJ</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start flex-col items-center"
                  onClick={() => navigateToModule('music_education')}
                >
                  <div className="p-2 rounded-full bg-primary/10 mb-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Music Education</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Music Tab */}
        <TabsContent value="music" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Music Tracks</CardTitle>
              <CardDescription>
                Manage the musical tracks in your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.tracks.length > 0 ? (
                <div className="space-y-4">
                  {project.tracks.map((track, index) => (
                    <div key={track.id} className="flex justify-between items-center p-4 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Music className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{track.name || `Track ${index + 1}`}</h3>
                          <p className="text-sm text-muted-foreground">
                            {track.instrumentalLayers?.length || 0} layers
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigateToModule('virtual_studio', { trackId: track.id })}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => navigateToModule('lyrics', { trackId: track.id })}
                        >
                          Add Lyrics
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No tracks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by generating a music track using AI
                  </p>
                  <Button onClick={() => navigateToModule('ai_music')}>
                    Create Track
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigateToModule('ai_music')}
              >
                <Music className="h-4 w-4 mr-2" />
                Generate New Track
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Lyrics Tab */}
        <TabsContent value="lyrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lyrics</CardTitle>
              <CardDescription>
                Manage lyrics for your tracks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.lyrics.length > 0 ? (
                <div className="space-y-4">
                  {project.lyrics.map((lyric) => {
                    const track = project.tracks.find(t => t.id === lyric.trackId);
                    return (
                      <div key={lyric.id} className="flex justify-between items-center p-4 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <PenTool className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {track ? `Lyrics for ${track.name}` : 'Lyrics'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {lyric.content.slice(0, 50)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateToModule('lyrics', { lyricId: lyric.id })}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => navigateToModule('voice_cloning', { lyricId: lyric.id })}
                          >
                            Create Vocals
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <PenTool className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No lyrics yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add lyrics to your tracks to enhance your music
                  </p>
                  <Button 
                    onClick={() => project.tracks.length > 0 
                      ? navigateToModule('lyrics') 
                      : navigateToModule('ai_music')
                    }
                  >
                    {project.tracks.length > 0 ? 'Create Lyrics' : 'Create Track First'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Vocals Tab */}
        <TabsContent value="vocals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vocal Profiles</CardTitle>
              <CardDescription>
                Manage AI voice profiles for your tracks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.vocalProfiles.length > 0 ? (
                <div className="space-y-4">
                  {project.vocalProfiles.map((profile) => (
                    <div key={profile.id} className="flex justify-between items-center p-4 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Mic2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{profile.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Model: {profile.model}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateToModule('voice_cloning', { profileId: profile.id })}
                      >
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Mic2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No vocal profiles yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create AI vocal profiles to sing your lyrics
                  </p>
                  <Button onClick={() => navigateToModule('voice_cloning')}>
                    Create Vocal Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Mixing Tab */}
        <TabsContent value="mixing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mixing Tools</CardTitle>
              <CardDescription>
                Fine-tune your tracks in the virtual studio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Sliders className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">Virtual Studio</h3>
                <p className="text-muted-foreground mb-4">
                  Mix and master your tracks professionally with AI assistance
                </p>
                <Button onClick={() => navigateToModule('virtual_studio')}>
                  Open Virtual Studio
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Creative Presets</CardTitle>
              <CardDescription>
                Apply predefined creative settings to your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-muted overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-lg">Upbeat Pop</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-3">
                      Energetic, commercial pop sound with modern production
                    </p>
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mood:</span>
                        <span>Happy</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo:</span>
                        <span>128 BPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Genre:</span>
                        <span>Pop</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => applyPreset('upbeat_pop')} 
                      variant="outline" 
                      className="w-full"
                    >
                      Apply Preset
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-lg">Melancholic Indie</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-3">
                      Reflective, emotional indie sound with atmospheric elements
                    </p>
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mood:</span>
                        <span>Melancholic</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo:</span>
                        <span>85 BPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Genre:</span>
                        <span>Indie</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => applyPreset('melancholic_indie')} 
                      variant="outline" 
                      className="w-full"
                    >
                      Apply Preset
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-lg">Epic Cinematic</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-3">
                      Grand, orchestral sound with modern electronic elements
                    </p>
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mood:</span>
                        <span>Epic</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo:</span>
                        <span>110 BPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Genre:</span>
                        <span>Cinematic</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => applyPreset('epic_cinematic')} 
                      variant="outline" 
                      className="w-full"
                    >
                      Apply Preset
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-lg">Chill Lofi</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-3">
                      Relaxed, atmospheric beats with jazzy influences
                    </p>
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mood:</span>
                        <span>Relaxed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo:</span>
                        <span>80 BPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Genre:</span>
                        <span>Lofi</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => applyPreset('chill_lofi')} 
                      variant="outline" 
                      className="w-full"
                    >
                      Apply Preset
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-lg">Energetic EDM</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-3">
                      High-energy electronic dance music with modern production
                    </p>
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mood:</span>
                        <span>Energetic</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo:</span>
                        <span>140 BPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Genre:</span>
                        <span>EDM</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => applyPreset('energetic_edm')} 
                      variant="outline" 
                      className="w-full"
                    >
                      Apply Preset
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community</CardTitle>
              <CardDescription>
                Connect with other musicians, share your work, and access educational resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-muted overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-primary" />
                      Music Sharing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-6">
                      Share your compositions with the community and get feedback from fellow musicians
                    </p>
                    <Button 
                      onClick={() => router.push('/social')} 
                      className="w-full"
                    >
                      Share Music
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Social Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-6">
                      Connect with other artists, collaborate on projects, and join music challenges
                    </p>
                    <Button 
                      onClick={() => router.push('/social/community')} 
                      className="w-full"
                    >
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Educational Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-6">
                      Access tutorials, lessons, and resources to improve your music production skills
                    </p>
                    <Button 
                      onClick={() => router.push('/music_education')} 
                      className="w-full"
                    >
                      Explore Resources
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 