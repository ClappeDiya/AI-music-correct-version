"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { 
  Music, 
  PenTool, 
  Mic2, 
  Globe,
  BarChart3, 
  Sliders, 
  Waves,
  UserPlus,
  ArrowRight,
  Layers,
  Construction,
  Sparkles
} from 'lucide-react';
import { FuturisticThemeToggle } from '@/components/ui/FuturisticThemeToggle';

export default function HomePage() {
  const router = useRouter();
  
  return (
    <main className="flex flex-col w-full px-4 py-12 space-y-12">
      <div className="container mx-auto">
        {/* Hero section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Retoone AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Create, collaborate, and innovate with AI-powered music creation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              onClick={() => router.push('/project/dashboard')}
              className="gap-2 glow-primary"
            >
              <Sparkles className="h-5 w-5" />
              Start Creating Music
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => router.push('/features')}
            >
              Explore Features
            </Button>
          </div>
        </div>
        
        {/* Futuristic Theme Showcase */}
        <div className="mt-16 text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Experience Our New Futuristic Theme
          </h2>
          <p className="text-muted-foreground">
            Toggle between dark and light mode to experience our sleek new interface
          </p>
          
          <div className="flex flex-col items-center gap-8 mt-8">
            <div className="relative flex items-center justify-center w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl rounded-full"></div>
              <div className="relative flex items-center justify-center gap-4 p-4 rounded-lg bg-card">
                <div className="p-2 flex flex-col items-center">
                  <span className="text-sm mb-2">Dark Mode</span>
                  <div className="w-12 h-12 rounded-lg dark:bg-[#1A1A2E] dark:text-[#E81D6E] light:bg-[#F8F9FA] light:text-[#00FFFF] flex items-center justify-center border border-muted">
                    🌙
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <FuturisticThemeToggle />
                </div>
                
                <div className="p-2 flex flex-col items-center">
                  <span className="text-sm mb-2">Light Mode</span>
                  <div className="w-12 h-12 rounded-lg dark:bg-[#1A1A2E] dark:text-[#E81D6E] light:bg-[#F8F9FA] light:text-[#00FFFF] flex items-center justify-center border border-muted">
                    ☀️
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
              <Card className="light:neon-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-primary" />
                    Futuristic UI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Experience our sleek, modern interface with eye-catching neon accents and subtle animations.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="light:neon-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" />
                    Seamless Switching
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode seamlessly with our smooth transition effects.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="light:neon-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Accessible Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Both themes are designed with accessibility in mind, ensuring great readability for all users.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Project-based workflow */}
        <section className="space-y-6 mt-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">
              The Unified Creative Experience
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Our project-based approach brings together all creative modules for a seamless music creation workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="gradient-bg">
              <CardHeader>
                <div className="p-2 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Unified Projects</CardTitle>
                <CardDescription>
                  Manage all aspects of your music in one place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create cohesive projects that bring together tracks, lyrics, vocals, and more in a centralized dashboard.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" onClick={() => router.push('/project/dashboard')} className="gap-2 hover:text-primary">
                  <span>Try it now</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="gradient-bg">
              <CardHeader>
                <div className="p-2 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <Construction className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Creative Parameters</CardTitle>
                <CardDescription>
                  Shared settings between modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Set mood, genre, and style parameters once, and have them applied intelligently across all creative modules.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" onClick={() => router.push('/mood_music?integrated=true')} className="gap-2 hover:text-primary">
                  <span>Explore parameters</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="gradient-bg">
              <CardHeader>
                <div className="p-2 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Intelligent Suggestions</CardTitle>
                <CardDescription>
                  AI-guided creative workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive contextual suggestions for your next creative steps based on your project's current state.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" onClick={() => router.push('/project/dashboard')} className="gap-2 hover:text-primary">
                  <span>Get started</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        
        {/* Creative modules */}
        <section className="space-y-6 mt-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">
              Powerful Creative Modules
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Each module can be used independently or as part of a unified project
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="overflow-hidden border border-muted/20 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">AI Music Generation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Create original music tracks with AI-powered generation
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start hover:text-primary">
                  <Link href="/ai_music">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>Explore</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border border-muted/20 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Lyrics Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Generate and edit lyrics that match your music's style and mood
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start hover:text-primary">
                  <Link href="/lyrics">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>Explore</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border border-muted/20 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Mic2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Voice Cloning</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Create realistic vocals with AI voice synthesis technology
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start hover:text-primary">
                  <Link href="/voice_cloning">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>Explore</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border border-muted/20 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Virtual Studio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Mix and master your tracks with professional-grade tools
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start hover:text-primary">
                  <Link href="/virtual_studio">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>Explore</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border border-muted/20 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Genre Mixing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Blend different musical styles to create innovative sounds
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start hover:text-primary">
                  <Link href="/genre_mixing">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>Explore</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border border-muted/20 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Mood-Based Music</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Create music that captures specific emotions and atmospheres
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start hover:text-primary">
                  <Link href="/mood_music">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>Explore</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border border-muted/20 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">AI DJ</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Mix tracks and create smooth transitions with AI assistance
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start hover:text-primary">
                  <Link href="/ai_dj">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>Explore</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border border-muted/20 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Music Education</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Learn music production concepts with interactive tutorials
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start hover:text-primary">
                  <Link href="/music_education">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>Explore</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        
        {/* Call to action */}
        <section className="max-w-3xl mx-auto text-center mt-16">
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-8">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Start Creating Today
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Experience the future of music creation with our unified Retoone AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/project/dashboard')}
                className="gap-2 glow-primary"
              >
                <Sparkles className="h-5 w-5" />
                <span>Create New Project</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="gap-2 glow-secondary"
              >
                <span>Sign In</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
