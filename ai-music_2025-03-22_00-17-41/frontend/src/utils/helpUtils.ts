/**
 * Help utilities for providing context-sensitive help throughout the application
 */

/**
 * Types of features that have dedicated help pages
 */
export type HelpFeature = 
  | 'ai_music_generation'
  | 'voice_cloning'
  | 'ai_dj'
  | 'lyrics_generation'
  | 'genre_mixing';

/**
 * Open the help center in a new tab
 */
export const openHelpCenter = () => {
  window.open('/help', '_blank');
};

/**
 * Open a specific help page for a feature
 * @param feature The feature to get help for
 * @param newTab Whether to open in a new tab (default: true)
 */
export const openFeatureHelp = (feature: HelpFeature, newTab = true) => {
  const url = `/help/context/${feature}`;
  if (newTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
};

/**
 * Get the URL for a help page
 * @param feature The feature to get help for
 * @returns The URL to the help page
 */
export const getHelpUrl = (feature: HelpFeature): string => {
  return `/help/context/${feature}`;
};

/**
 * Help icons and tooltips for common features
 */
export const helpResources = {
  ai_music_generation: {
    title: 'AI Music Generation',
    description: 'Learn how to create original music with our AI tools',
    url: getHelpUrl('ai_music_generation')
  },
  voice_cloning: {
    title: 'Voice Cloning',
    description: 'Create digital replicas of voices with proper consent',
    url: getHelpUrl('voice_cloning')
  },
  ai_dj: {
    title: 'AI DJ',
    description: 'Create seamless mixes with intelligent track transitions',
    url: getHelpUrl('ai_dj')
  },
  lyrics_generation: {
    title: 'Lyrics Generation',
    description: 'Create compelling lyrics with AI assistance',
    url: getHelpUrl('lyrics_generation')
  },
  genre_mixing: {
    title: 'Genre Mixing',
    description: 'Blend different musical styles for unique compositions',
    url: getHelpUrl('genre_mixing')
  }
}; 