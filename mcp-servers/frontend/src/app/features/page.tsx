"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Music, 
  Mic2, 
  Edit3,
  Sliders, 
  Headphones,
  Globe,
  Users,
  Zap,
  RefreshCw,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  Code
} from 'lucide-react';
import { FuturisticUIDemo } from '@/components/FuturisticUIDemo';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative bg-gradient-to-b from-background to-background/80 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Features & Capabilities
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the powerful tools and innovative technologies that make Retoone the leading platform for AI-powered music creation.
          </p>
        </div>
        <div className="absolute inset-0 grid grid-cols-12 gap-4 opacity-[0.015] pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="col-span-1 h-full border-r border-foreground/10" />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="col-span-12 w-full border-b border-foreground/10" />
          ))}
        </div>
      </section>

      {/* Futuristic Theme Showcase */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">New Futuristic Interface</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've refined our user experience with a new light theme option that complements our classic dark mode.
            </p>
          </div>
          <FuturisticUIDemo />
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Core Features</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive suite of AI-powered tools enables you to create professional-quality music from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Music Generation */}
            <Card className="bg-gradient-to-br from-background to-background/70 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Music Generation</CardTitle>
                <CardDescription>
                  Create original compositions with advanced AI algorithms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Generate full tracks or individual stems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Fine-tune by genre, mood, tempo, and instrumentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Influence generation with reference tracks</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/ai_music">
                    Try AI Music Generation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Voice Cloning */}
            <Card className="bg-gradient-to-br from-background to-background/70 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Mic2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Voice Cloning</CardTitle>
                <CardDescription>
                  Create realistic vocals with AI voice synthesis technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Train models on voice samples (with proper consent)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Adjust expressiveness, pitch, and delivery style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Generate vocals for any lyrics or melody</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/voice_cloning">
                    Try Voice Cloning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Lyrics Generation */}
            <Card className="bg-gradient-to-br from-background to-background/70 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Edit3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Lyrics Generation</CardTitle>
                <CardDescription>
                  Create compelling lyrics that match your musical style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Generate complete lyrics by theme and genre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Structured verse/chorus format with rhyme schemes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Edit and refine with AI-powered suggestions</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/lyrics">
                    Try Lyrics Generation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Virtual Studio */}
            <Card className="bg-gradient-to-br from-background to-background/70 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sliders className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Virtual Studio</CardTitle>
                <CardDescription>
                  Professional mixing and mastering tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Multi-track mixing environment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Studio-quality effects and processors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">AI-assisted mixing and mastering</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/virtual_studio">
                    Try Virtual Studio
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI DJ */}
            <Card className="bg-gradient-to-br from-background to-background/70 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI DJ</CardTitle>
                <CardDescription>
                  Create seamless mixes with intelligent transitions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Automatic beat matching and key synchronization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Create dynamic DJ sets with mood progression</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Live mixing capabilities with AI assistance</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/ai_dj">
                    Try AI DJ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Genre Mixing */}
            <Card className="bg-gradient-to-br from-background to-background/70 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Genre Mixing</CardTitle>
                <CardDescription>
                  Blend different musical styles for unique compositions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Combine elements from multiple genres</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Control influence levels of each genre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Discover new cross-genre sounds</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/genre_mixing">
                    Try Genre Mixing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Platform Benefits</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Beyond our core features, Retoone provides a comprehensive ecosystem for musicians, producers, and creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Collaboration */}
            <Card className="border border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <CardTitle>Real-time Collaboration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Work together with team members anywhere in the world. Multiple users can edit projects simultaneously with real-time updates.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Share projects with fine-grained permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">In-app messaging and commenting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Version history and change tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Multi-platform */}
            <Card className="border border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  <CardTitle>Multi-platform Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access your projects from any device, anywhere. Our platform works seamlessly across desktop, tablet, and mobile devices.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Cloud-based storage with automatic syncing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Responsive design for all screen sizes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Native apps for mobile and desktop</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Project Management */}
            <Card className="border border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Layers className="h-6 w-6 text-primary" />
                  <CardTitle>Comprehensive Project Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Keep your creative process organized with powerful project management tools designed specifically for music creation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Project templates for quick starts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Task assignment and progress tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Project snapshots and revisions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Export & Integration */}
            <Card className="border border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Code className="h-6 w-6 text-primary" />
                  <CardTitle>Export & Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Seamlessly integrate with your existing workflow and export your projects in industry-standard formats.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Export to WAV, MP3, FLAC, and MIDI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">DAW integration (Ableton, Logic, FL Studio)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">API access for custom integrations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to transform your music creation process?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of musicians and producers already using Retoone to create amazing music.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <Zap className="h-5 w-5" />
              <span>Get Started Free</span>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">
                View Pricing Plans
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 