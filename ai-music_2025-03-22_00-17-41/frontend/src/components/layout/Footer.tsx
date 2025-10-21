"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Github, 
  Mail, 
  Phone, 
  MapPin,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Footer() {
  return (
    <footer className="bg-background/70 backdrop-blur-sm border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and about */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary p-1">
                <Music className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Retoone</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Create, collaborate, and innovate with AI-powered music creation tools.
              Transform your musical ideas into reality with our cutting-edge platform.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-4 pt-4">
              <Link href="https://twitter.com/retoone" target="_blank" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://instagram.com/retoone" target="_blank" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://youtube.com/retoone" target="_blank" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="https://linkedin.com/company/retoone" target="_blank" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="https://github.com/retoone" target="_blank" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-medium text-base">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Products */}
          <div className="space-y-4">
            <h3 className="font-medium text-base">Our Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/ai_music" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  AI Music Generation
                </Link>
              </li>
              <li>
                <Link href="/voice_cloning" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Voice Cloning
                </Link>
              </li>
              <li>
                <Link href="/ai_dj" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  AI DJ
                </Link>
              </li>
              <li>
                <Link href="/lyrics" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Lyrics Generation
                </Link>
              </li>
              <li>
                <Link href="/virtual_studio" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Virtual Studio
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h3 className="font-medium text-base">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  support@retoone.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  +1 (555) 123-4567
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  123 Music Lane, San Francisco, CA 94103
                </span>
              </li>
            </ul>
            <div className="pt-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom section with copyright and legal links */}
        <div className="border-t mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Retoone. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 