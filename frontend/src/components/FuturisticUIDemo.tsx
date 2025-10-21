"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FuturisticThemeToggle } from '@/components/ui/FuturisticThemeToggle';
import { cn } from '@/lib/utils';
import { Sparkles, Zap, Lightbulb } from 'lucide-react';

interface FuturisticUIDemoProps {
  className?: string;
  showToggle?: boolean;
}

export function FuturisticUIDemo({ className, showToggle = true }: FuturisticUIDemoProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {showToggle && (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <h3 className="text-xl font-semibold">Experience our new theme</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Dark</span>
            <FuturisticThemeToggle />
            <span className="text-sm text-muted-foreground">Light</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Toggle between our futuristic light and dark themes to experience different visual styles.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Futuristic Card 1 */}
        <Card className="overflow-hidden border-transparent light:neon-border">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary w-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Futuristic Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Experience a sleek UI with dynamic neon accents and smooth animations.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full light:glow-primary">
              Explore
            </Button>
          </CardFooter>
        </Card>
        
        {/* Futuristic Card 2 */}
        <Card className="overflow-hidden border-transparent light:neon-border">
          <div className="h-2 bg-gradient-to-r from-secondary to-primary w-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Dynamic Effects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Subtle glow effects and gradient overlays create a high-tech visual experience.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full light:glow-secondary">
              Try Now
            </Button>
          </CardFooter>
        </Card>
        
        {/* Futuristic Card 3 */}
        <Card className="overflow-hidden border-transparent light:neon-border md:col-span-2 lg:col-span-1">
          <div className="h-2 neon-gradient w-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Light/Dark Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Seamlessly switch between light and dark modes with smooth transitions.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              Learn More
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 