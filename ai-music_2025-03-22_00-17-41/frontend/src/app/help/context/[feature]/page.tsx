"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, HelpCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Context-sensitive help data mapped by feature ID
const contextualHelpData: Record<string, {
  title: string;
  description: string;
  content: string[];
  relatedLinks: Array<{ title: string; url: string }>;
  video?: { title: string; url: string };
}> = {
  'ai_music_generation': {
    title: 'AI Music Generation',
    description: 'Learn how to create original music with our AI tools',
    content: [
      'Our AI music generation uses advanced neural networks to create unique compositions based on your parameters.',
      'Start by selecting a genre, mood, and tempo to guide the AI. You can also provide reference tracks or specific instruments to include.',
      'Once generated, you can further refine your track with our editing tools, adjusting individual elements like melody, harmony, and rhythm.',
      'Pro tip: For best results, provide clear, specific prompts. Instead of "make happy music," try "create an upbeat pop track with piano and guitar at 120bpm."'
    ],
    relatedLinks: [
      { title: 'Advanced Generation Settings', url: '/help#advanced-generation' },
      { title: 'Understanding Music Parameters', url: '/help#music-parameters' },
      { title: 'Editing Generated Tracks', url: '/help#editing-tracks' }
    ],
    video: { title: 'Getting Started with AI Music Generation', url: '/tutorials/ai-music-generation' }
  },
  'voice_cloning': {
    title: 'Voice Cloning',
    description: 'Create digital replicas of voices with proper consent',
    content: [
      'Voice cloning creates a digital model of a person\'s voice that can be used to generate new vocals.',
      'Begin by uploading high-quality audio samples of the voice you want to clone. For best results, use clear recordings with minimal background noise.',
      'Our system requires explicit consent from the voice owner. Always ensure you have proper permission before uploading voice samples.',
      'Once your voice model is trained, you can generate new vocals by typing lyrics or importing text files. You can adjust expressiveness, pitch, and other parameters.'
    ],
    relatedLinks: [
      { title: 'Ethical Voice Cloning Guidelines', url: '/help#ethical-voice-cloning' },
      { title: 'Voice Model Training Tips', url: '/help#voice-training' },
      { title: 'Adjusting Voice Parameters', url: '/help#voice-parameters' }
    ],
    video: { title: 'Voice Cloning Essentials', url: '/tutorials/voice-cloning' }
  },
  'ai_dj': {
    title: 'AI DJ',
    description: 'Create seamless mixes with intelligent track transitions',
    content: [
      'AI DJ analyzes your tracks and creates professional-quality mixes with seamless transitions.',
      'Select the tracks you want to include in your mix, or let AI DJ choose from your library based on mood or genre.',
      'Set parameters like mix duration, energy curve, and transition style to customize your experience.',
      'For advanced users: You can manually adjust transition points and even create custom transition effects that the AI will incorporate.'
    ],
    relatedLinks: [
      { title: 'Understanding BPM and Key Matching', url: '/help#bpm-key-matching' },
      { title: 'Creating Energy Curves', url: '/help#energy-curves' },
      { title: 'Custom Transition Effects', url: '/help#custom-transitions' }
    ],
    video: { title: 'Mastering AI DJ Features', url: '/tutorials/ai-dj' }
  },
  'lyrics_generation': {
    title: 'Lyrics Generation',
    description: 'Create compelling lyrics with AI assistance',
    content: [
      'Our lyrics generation system creates original lyrics that match your musical style and theme.',
      'Start by specifying a theme, mood, genre, and optional keywords to guide the AI. You can also set structural parameters like verse/chorus patterns.',
      'Generated lyrics can be edited, refined, or used as inspiration for your own writing.',
      'Pro tip: Try generating multiple versions and mixing elements from different outputs to create the perfect lyrics.'
    ],
    relatedLinks: [
      { title: 'Lyrical Styles and Structures', url: '/help#lyrical-styles' },
      { title: 'Theme Development in Lyrics', url: '/help#theme-development' },
      { title: 'Refining AI-Generated Lyrics', url: '/help#refining-lyrics' }
    ],
    video: { title: 'Lyrics Generation Masterclass', url: '/tutorials/lyrics-masterclass' }
  },
  'genre_mixing': {
    title: 'Genre Mixing',
    description: 'Blend different musical styles for unique compositions',
    content: [
      'Genre Mixing allows you to combine elements from different musical styles to create innovative cross-genre tracks.',
      'Select two or more genres to blend, and adjust the influence level of each genre on the final composition.',
      'You can specify which elements to take from each genre - for example, rhythm from hip-hop, harmonies from jazz, and instrumentation from electronic music.',
      'Experiment with unexpected combinations for the most creative results!'
    ],
    relatedLinks: [
      { title: 'Popular Genre Combinations', url: '/help#genre-combinations' },
      { title: 'Element-Specific Mixing', url: '/help#element-mixing' },
      { title: 'Balancing Multiple Genres', url: '/help#balancing-genres' }
    ],
    video: { title: 'The Art of Genre Fusion', url: '/tutorials/genre-fusion' }
  }
};

export default function ContextualHelp() {
  const params = useParams();
  const router = useRouter();
  const [helpData, setHelpData] = useState<typeof contextualHelpData[string] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const featureId = typeof params.feature === 'string' ? params.feature : Array.isArray(params.feature) ? params.feature[0] : '';
  
  useEffect(() => {
    if (featureId && contextualHelpData[featureId]) {
      setHelpData(contextualHelpData[featureId]);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [featureId]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading help information...</p>
        </div>
      </div>
    );
  }
  
  if (notFound) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 mb-4"
          onClick={() => router.push('/help')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Button>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Help Topic Not Found</CardTitle>
            <CardDescription>
              We couldn't find help information for the specified feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-center text-muted-foreground">
              The help topic you're looking for may have been moved or doesn't exist.
            </p>
            <Button 
              onClick={() => router.push('/help')}
              className="mt-4"
            >
              Browse All Help Topics
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2"
        onClick={() => router.push('/help')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Help Center
      </Button>
      
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">{helpData?.title}</CardTitle>
            <CardDescription>{helpData?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {helpData?.content.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground">
                {paragraph}
              </p>
            ))}
            
            {helpData?.video && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Video Tutorial</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Button>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch: {helpData.video.title}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {helpData?.relatedLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.url} 
                      className="text-primary hover:underline flex items-center"
                    >
                      <span className="mr-2">→</span>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you still have questions about this feature, our support team is ready to assist you.
              </p>
              <Button className="w-full">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 