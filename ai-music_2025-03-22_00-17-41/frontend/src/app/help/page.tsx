"use client";

import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/Tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/Accordion';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { 
  HelpCircle, 
  Music, 
  Info, 
  Settings, 
  BookOpen, 
  Headphones, 
  Mic2, 
  Search, 
  FileText,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FuturisticThemeToggle } from '@/components/ui/FuturisticThemeToggle';

// FAQ data organized by category
const faqData = {
  general: [
    {
      question: "What is AI Music?",
      answer: "AI Music is a platform that uses artificial intelligence to help you create, customize, and share music. Our advanced algorithms can generate original compositions, help with lyrics, provide mixing suggestions, and more based on your inputs and preferences."
    },
    {
      question: "How do I get started?",
      answer: "After signing up, you can start creating music right away. Navigate to the dashboard and select 'New Project'. You can choose from various templates or start from scratch. Follow the guided prompts to create your first AI-generated track."
    },
    {
      question: "Is my music private?",
      answer: "Yes! By default, all your projects are private. You can choose to share them publicly or with specific people through our sharing options. You maintain full control over who can access your music."
    },
    {
      question: "What formats can I export my music in?",
      answer: "You can export your completed tracks in several formats including MP3, WAV, FLAC, and MIDI. Different subscription tiers offer different quality options and additional format choices."
    },
    {
      question: "Do I own the music I create?",
      answer: "Yes, you retain full ownership of the music you create with our platform. However, please note that some sample packs or preset sounds may have their own licensing terms."
    }
  ],
  features: [
    {
      question: "What is Voice Cloning?",
      answer: "Voice Cloning allows you to create a digital version of any voice (with proper consent). Upload voice samples, and our AI will learn to generate new vocals in that voice. This feature is available on our Pro and higher subscription plans."
    },
    {
      question: "How does the AI DJ work?",
      answer: "AI DJ analyzes your music library and preferences to create seamless mixes and transitions between tracks. It can match beats, harmonies, and even create creative mashups. You can set parameters like energy level, mood progression, and mix duration."
    },
    {
      question: "What is Mood-Based Music generation?",
      answer: "This feature allows you to create music based on emotions and moods. Select how you want your listeners to feel (energetic, relaxed, melancholic, etc.), and our AI will generate compositions designed to evoke those specific emotional responses."
    },
    {
      question: "Can I collaborate with others?",
      answer: "Absolutely! Our platform supports real-time collaboration. Invite other users to your project, and you can work together simultaneously. Each collaborator's contributions are tracked, and you can communicate through our built-in chat system."
    },
    {
      question: "What is Genre Mixing?",
      answer: "Genre Mixing allows you to blend elements from different musical styles to create unique cross-genre compositions. For example, you could combine classical orchestration with electronic beats or blend jazz improvisations with hip-hop rhythms."
    }
  ],
  account: [
    {
      question: "How do I change my password?",
      answer: "Navigate to Settings → Profile, and select the 'Security' tab. You can update your password there. We recommend using a strong, unique password for your account security."
    },
    {
      question: "Can I use multiple devices?",
      answer: "Yes, you can access your account from multiple devices simultaneously. Changes sync automatically across all your devices, allowing you to start a project on your computer and continue on your tablet or phone."
    },
    {
      question: "How do I update my subscription?",
      answer: "Go to Settings → Billing & Payments to view and modify your current subscription. You can upgrade, downgrade, or cancel your subscription at any time. Changes to your subscription will take effect at the start of your next billing cycle."
    },
    {
      question: "Can I download my data?",
      answer: "Yes, you can request a complete export of your account data including your projects, settings, and usage history. Go to Settings → Data Privacy to initiate a data export request."
    },
    {
      question: "How do I delete my account?",
      answer: "Account deletion can be initiated from Settings → Data Privacy → Account Deletion. Please note that this action is permanent and will remove all your data from our systems after the required retention period."
    }
  ],
  troubleshooting: [
    {
      question: "My audio isn't playing properly",
      answer: "First, check your device's audio settings and ensure the correct output is selected. If the issue persists, try clearing your browser cache or using a different web browser. For mobile devices, ensure the app has permission to access your audio hardware."
    },
    {
      question: "The generation process is taking too long",
      answer: "AI music generation can be resource-intensive, especially for longer or more complex compositions. Generation time depends on server load and your subscription tier. Premium subscribers receive priority processing. If a generation has been pending for more than 10 minutes, try refreshing or submitting with simpler parameters."
    },
    {
      question: "I can't export my project",
      answer: "Ensure your project contains valid content and has been saved. Check your subscription limits to confirm you haven't exceeded your monthly export quota. If you're still having issues, try exporting a smaller section first or using a different export format."
    },
    {
      question: "The collaboration features aren't working",
      answer: "Ensure all collaborators have active accounts and proper permissions. Check your internet connection, as real-time collaboration requires stable connectivity. If issues persist, try having all participants leave and rejoin the project, or create a new collaboration session."
    },
    {
      question: "My project isn't saving",
      answer: "Our system auto-saves your work, but connectivity issues might interrupt this process. Ensure you have a stable internet connection. You can also manually trigger saves by clicking the save icon. If problems persist, try duplicating your project or exporting your current progress as a backup."
    }
  ]
};

// Video tutorials data
const videoTutorials = [
  {
    title: "Getting Started with AI Music",
    description: "Learn the basics of navigating the platform and creating your first track",
    duration: "5:32",
    thumbnail: "/tutorials/getting-started.jpg",
    url: "/tutorials/getting-started"
  },
  {
    title: "Advanced Composition Techniques",
    description: "Discover how to fine-tune AI generations for professional results",
    duration: "12:18",
    thumbnail: "/tutorials/advanced-composition.jpg",
    url: "/tutorials/advanced-composition"
  },
  {
    title: "Lyrics Generation Masterclass",
    description: "Learn how to prompt the AI for compelling lyrics that match your music",
    duration: "8:45",
    thumbnail: "/tutorials/lyrics-masterclass.jpg",
    url: "/tutorials/lyrics-masterclass"
  },
  {
    title: "Voice Cloning Essentials",
    description: "A comprehensive guide to creating and using voice clones ethically",
    duration: "15:23",
    thumbnail: "/tutorials/voice-cloning.jpg",
    url: "/tutorials/voice-cloning"
  },
  {
    title: "Collaborative Projects",
    description: "How to effectively collaborate with others in real-time",
    duration: "7:56",
    thumbnail: "/tutorials/collaboration.jpg",
    url: "/tutorials/collaboration"
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  
  // Filter FAQ items based on search query
  const filteredFaqItems = searchQuery 
    ? Object.values(faqData).flat().filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqData[activeCategory as keyof typeof faqData];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Help Center</h1>
              <p className="text-muted-foreground">Find answers to your questions about Retoone AI</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:inline-block">Try our new theme:</span>
              <FuturisticThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Search & Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <HelpCircle className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground max-w-2xl">
            Find answers to common questions, learn through tutorials, and get the support you need to make the most of AI Music.
          </p>
          
          <div className="w-full max-w-md mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Browse our comprehensive FAQ collection or search for specific topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchQuery ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredFaqItems.length} results for "{searchQuery}"
                  </p>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqItems.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  {filteredFaqItems.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No results found. Try a different search term or browse categories.</p>
                    </div>
                  )}
                </div>
              ) : (
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="general">
                      <Info className="h-4 w-4 mr-2" />
                      General
                    </TabsTrigger>
                    <TabsTrigger value="features">
                      <Music className="h-4 w-4 mr-2" />
                      Features
                    </TabsTrigger>
                    <TabsTrigger value="account">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </TabsTrigger>
                    <TabsTrigger value="troubleshooting">
                      <Settings className="h-4 w-4 mr-2" />
                      Troubleshooting
                    </TabsTrigger>
                  </TabsList>
                  {Object.entries(faqData).map(([category, items]) => (
                    <TabsContent key={category} value={category} className="mt-0">
                      <Accordion type="single" collapsible className="w-full">
                        {items.map((item, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground">{item.answer}</p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Headphones className="h-5 w-5 mr-2" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <Button className="w-full">Submit a Support Ticket</Button>
                <div className="text-sm text-muted-foreground">
                  <p>Support hours:</p>
                  <p>Monday-Friday: 9am-6pm EST</p>
                  <p>Weekend: 10am-4pm EST</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Explore our comprehensive guides and reference materials.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    User Guide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    API Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Feature Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mic2 className="h-5 w-5 mr-2" />
              Video Tutorials
            </CardTitle>
            <CardDescription>
              Learn through our step-by-step video guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videoTutorials.map((tutorial, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {/* Tutorial thumbnail would be here in a real implementation */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Button variant="secondary" size="sm" className="rounded-full h-10 w-10 p-0">
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {tutorial.duration}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{tutorial.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{tutorial.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Play icon component for video tutorials
function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
} 