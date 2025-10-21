'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Music, Shield, Zap, Download, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const scrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo/Brand */}
          <div className="flex justify-center mb-8">
            <Music className="h-16 w-16 text-indigo-600" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Create Professional AI Music
            <span className="block text-indigo-600">in Seconds</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            100% Royalty-Free • Studio-Quality • No Music Theory Required
          </p>

          {/* USPs */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-md">
              <Shield className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">100% Copyright Safe</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-md">
              <Zap className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Generated in Seconds</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-md">
              <Download className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">MP3, WAV, STEMS</span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => scrollTo('#instant-trial')}
            >
              Try Free - No Signup Required
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>

          {/* Trust Signals */}
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • 5 free generations per month
          </p>
        </div>
      </div>
    </section>
  );
}
