"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/Label';
import { useToast } from '@/components/ui/useToast';
import { 
  ArrowLeft, 
  MusicIcon,
  Sparkles
} from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useCreativeParameters } from '@/hooks/useCreativeParameters';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select';

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createNewProject } = useProject();
  const { applyPreset } = useCreativeParameters();
  
  const [projectTitle, setProjectTitle] = useState('Untitled Project');
  const [selectedPreset, setSelectedPreset] = useState('none');
  
  const handleCreateProject = () => {
    if (!projectTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a project title',
      });
      return;
    }
    
    createNewProject(projectTitle);
    
    // Apply preset if one is selected and not "none"
    if (selectedPreset && selectedPreset !== 'none') {
      applyPreset(selectedPreset);
    }
    
    toast({
      title: 'Project Created',
      description: 'Your new project has been created',
    });
    
    router.push('/project/dashboard');
  };
  
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/')}
        className="mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground mt-2">
          Start your creative journey with a new music project
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Enter basic information about your new project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input 
              id="title" 
              placeholder="My Awesome Music Project" 
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preset">Creative Preset (Optional)</Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger id="preset">
                <SelectValue placeholder="Select a preset style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="upbeat_pop">Upbeat Pop</SelectItem>
                <SelectItem value="melancholic_indie">Melancholic Indie</SelectItem>
                <SelectItem value="epic_cinematic">Epic Cinematic</SelectItem>
                <SelectItem value="chill_lofi">Chill Lofi</SelectItem>
                <SelectItem value="energetic_edm">Energetic EDM</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Presets configure mood, tempo, and genre settings to give you a head start
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProject}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Create Project
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Want to start with a specific module instead? 
          <Button variant="link" className="px-1" onClick={() => router.push('/ai_music')}>
            Go to AI Music Generation
          </Button>
        </p>
      </div>
    </div>
  );
} 