/**
 * TypeScript declarations for hydration fix extensions to the Window interface
 */

interface HydrationFixObserver extends MutationObserver {
  cleanup?: NodeJS.Timeout;
}

interface HydrationFix {
  observer?: HydrationFixObserver;
  [key: string]: any;
}

declare global {
  interface Window {
    __hydrationFix?: HydrationFix;
  }
}

export {}; 