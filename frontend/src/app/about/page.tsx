"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Globe,
  Users,
  Heart,
  BarChart,
  Sparkles,
  Music,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { FuturisticUIDemo } from '@/components/FuturisticUIDemo';

// Team member type
type TeamMember = {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
};

// Company values type
type CompanyValue = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function AboutPage() {
  // Leadership team
  const teamMembers: TeamMember[] = [
    {
      name: "Alex Chen",
      role: "CEO & Founder",
      bio: "Former ML engineer at Spotify with 10+ years experience in audio processing and music production. Alex founded Retoone to democratize music creation.",
      imageSrc: "/placeholder-team-1.jpg",
      social: {
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
      },
    },
    {
      name: "Maya Rodriguez",
      role: "CTO",
      bio: "PhD in Music Information Retrieval from Stanford. Led AI teams at major tech companies before joining to build the technology behind Retoone.",
      imageSrc: "/placeholder-team-2.jpg",
      social: {
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
      },
    },
    {
      name: "David Kim",
      role: "Head of Product",
      bio: "Professional music producer turned product leader. Combines practical music industry experience with product design expertise to create intuitive tools.",
      imageSrc: "/placeholder-team-3.jpg",
      social: {
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
      },
    },
    {
      name: "Sarah Johnson",
      role: "VP of Marketing",
      bio: "15 years of experience in music tech marketing. Previously led growth strategies for multiple successful music startups.",
      imageSrc: "/placeholder-team-4.jpg",
      social: {
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
      },
    },
  ];

  // Company values
  const companyValues: CompanyValue[] = [
    {
      title: "Innovation",
      description: "We push the boundaries of what's possible in AI music generation, constantly evolving our technology to unlock new creative possibilities.",
      icon: <Sparkles className="h-10 w-10 text-primary" />,
    },
    {
      title: "Accessibility",
      description: "We believe everyone should have access to powerful music creation tools, regardless of technical skill or background.",
      icon: <Globe className="h-10 w-10 text-primary" />,
    },
    {
      title: "Community",
      description: "We foster a supportive community of creators who share knowledge and inspire each other to explore new musical frontiers.",
      icon: <Users className="h-10 w-10 text-primary" />,
    },
    {
      title: "Ethical AI",
      description: "We develop our AI systems responsibly, with careful consideration of artists' rights and the cultural impact of our technology.",
      icon: <Heart className="h-10 w-10 text-primary" />,
    },
    {
      title: "Quality",
      description: "We maintain the highest standards in both our technology and user experience, ensuring professional-grade results.",
      icon: <BarChart className="h-10 w-10 text-primary" />,
    },
    {
      title: "Musical Authenticity",
      description: "We respect music's cultural heritage while exploring its future, creating tools that honor musical traditions.",
      icon: <Music className="h-10 w-10 text-primary" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                About Retoone AI
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                We're on a mission to democratize music creation through AI, making it accessible to everyone regardless of musical background.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Futuristic UI Demo Section */}
      <section className="py-12 md:py-16 bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
              Experience Our New Interface
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              We've refreshed our design with a futuristic light mode that complements our existing dark theme.
            </p>
          </div>
          <FuturisticUIDemo />
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Retoone began in 2021 when founder Alex Chen, a machine learning engineer and lifelong musician, became fascinated with the potential of AI to transform music creation.
                </p>
                <p>
                  Frustrated with the limitations of existing music tools, Alex assembled a team of musicians, engineers, and designers to create a platform that would make professional-quality music production accessible to everyone, regardless of their technical skills or formal training.
                </p>
                <p>
                  What started as a simple prototype quickly evolved into a comprehensive suite of AI-powered music creation tools. After a successful beta program with over 10,000 early users, Retoone officially launched in 2022.
                </p>
                <p>
                  Today, our platform serves over 250,000 creators worldwide, from hobbyists making their first tracks to professional producers streamlining their workflow. We remain committed to our founding vision: democratizing music creation through thoughtfully designed, powerful AI tools.
                </p>
              </div>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl border border-border">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-primary/5"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <h3 className="text-3xl font-bold mb-4">250,000+</h3>
                  <p className="text-xl">Creators worldwide</p>
                  <hr className="my-8 border-primary/30" />
                  <h3 className="text-3xl font-bold mb-4">15 million+</h3>
                  <p className="text-xl">Tracks created</p>
                  <hr className="my-8 border-primary/30" />
                  <h3 className="text-3xl font-bold mb-4">45+</h3>
                  <p className="text-xl">Team members across 12 countries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-8">Our Mission & Vision</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Mission</h3>
                <p className="text-lg text-muted-foreground">
                  To democratize music creation by providing intelligent, accessible tools that empower everyone to express themselves musically without technical barriers.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">Vision</h3>
                <p className="text-lg text-muted-foreground">
                  A world where anyone can transform their musical ideas into professional-quality compositions, fostering a more creative and expressive society through the universal language of music.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at Retoone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyValues.map((value, index) => (
              <div 
                key={index} 
                className="p-6 rounded-lg border border-border bg-gradient-to-br from-background to-background/70 hover:border-primary/20 transition-colors"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Meet Our Leadership Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate experts behind Retoone, combining expertise in music, technology, and product design.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-background border border-border rounded-lg overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-square relative bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                    {/* Replace with actual images when available */}
                    <span className="text-7xl font-bold text-primary/10">{member.name.charAt(0)}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary mb-4">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                  <div className="flex space-x-3">
                    {member.social.twitter && (
                      <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s Twitter`} className="text-muted-foreground hover:text-primary transition-colors">
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s LinkedIn`} className="text-muted-foreground hover:text-primary transition-colors">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {member.social.github && (
                      <a href={member.social.github} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s GitHub`} className="text-muted-foreground hover:text-primary transition-colors">
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              And over 45 team members across engineering, design, marketing, and customer support.
            </p>
            <Button variant="outline" asChild>
              <Link href="/careers">View Career Opportunities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            <div className="border-l-2 border-primary/30 ml-4 md:ml-6 space-y-12 pl-4 md:pl-8 relative">
              <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary"></div>
              
              {/* Timeline items */}
              <div>
                <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-bold">2021</h3>
                <h4 className="text-lg font-medium text-primary mb-2">The Beginning</h4>
                <p className="text-muted-foreground">
                  Alex Chen founded Retoone with a small seed investment, assembling a team of 5 engineers to develop the initial prototype.
                </p>
              </div>

              <div>
                <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-bold">2022</h3>
                <h4 className="text-lg font-medium text-primary mb-2">Private Beta Launch</h4>
                <p className="text-muted-foreground">
                  After a year of development, we invited 10,000 beta users to test our platform. Their feedback shaped our product development.
                </p>
              </div>

              <div>
                <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-bold">2022</h3>
                <h4 className="text-lg font-medium text-primary mb-2">Series A Funding</h4>
                <p className="text-muted-foreground">
                  Secured $12M in Series A funding to expand our team and enhance our AI models.
                </p>
              </div>

              <div>
                <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-bold">2023</h3>
                <h4 className="text-lg font-medium text-primary mb-2">Public Launch</h4>
                <p className="text-muted-foreground">
                  Officially launched to the public, reaching 100,000 users within the first six months.
                </p>
              </div>

              <div>
                <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-bold">2023</h3>
                <h4 className="text-lg font-medium text-primary mb-2">Voice Cloning Feature</h4>
                <p className="text-muted-foreground">
                  Released our groundbreaking voice cloning technology, setting new standards for AI vocal synthesis.
                </p>
              </div>

              <div>
                <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-bold">2024</h3>
                <h4 className="text-lg font-medium text-primary mb-2">Today</h4>
                <p className="text-muted-foreground">
                  250,000+ active users, 45+ team members, and continuing to pioneer the future of AI-powered music creation.
                </p>
              </div>

              <div className="absolute left-[-8px] bottom-0 w-4 h-4 rounded-full bg-primary"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join us on our mission
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Whether you're a musician, producer, or just passionate about music, there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                Contact Our Team
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 