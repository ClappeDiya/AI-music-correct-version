"use client";

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { HelpFeature, openFeatureHelp, openHelpCenter } from '@/utils/helpUtils';

interface HelpButtonProps {
  /**
   * Specific feature to get help for
   * If not provided, opens the general help center
   */
  feature?: HelpFeature;
  
  /**
   * Optional custom tooltip text
   * If not provided, will use default text based on the feature
   */
  tooltipText?: string;
  
  /**
   * Size of the button
   * @default "icon"
   */
  size?: 'icon' | 'sm' | 'default';
  
  /**
   * Should the help open in a new tab?
   * @default true
   */
  newTab?: boolean;
  
  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * A reusable help button that can be placed throughout the application
 * to provide context-sensitive help
 */
export function HelpButton({
  feature,
  tooltipText,
  size = 'icon',
  newTab = true,
  className = '',
}: HelpButtonProps) {
  const handleClick = () => {
    if (feature) {
      openFeatureHelp(feature, newTab);
    } else {
      openHelpCenter();
    }
  };
  
  // Determine default tooltip text based on feature
  let defaultTooltipText = 'Get help';
  if (feature) {
    switch (feature) {
      case 'ai_music_generation':
        defaultTooltipText = 'Learn about AI Music Generation';
        break;
      case 'voice_cloning':
        defaultTooltipText = 'Learn about Voice Cloning';
        break;
      case 'ai_dj':
        defaultTooltipText = 'Learn about AI DJ features';
        break;
      case 'lyrics_generation':
        defaultTooltipText = 'Learn about Lyrics Generation';
        break;
      case 'genre_mixing':
        defaultTooltipText = 'Learn about Genre Mixing';
        break;
      default:
        defaultTooltipText = 'Get help with this feature';
    }
  }
  
  const finalTooltipText = tooltipText || defaultTooltipText;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            onClick={handleClick}
            className={`text-muted-foreground hover:text-foreground ${className}`}
            aria-label={finalTooltipText}
          >
            <HelpCircle className={size === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'} />
            {size !== 'icon' && 'Help'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{finalTooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 