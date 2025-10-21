'use client';

import { useEffect, useState } from 'react';

/**
 * This component fixes the CSS preload warning by ensuring the 'as' attribute
 * is properly set. It runs only on the client side and safely handles hydration.
 */
export default function StyleLoader() {
  const [isMounted, setIsMounted] = useState(false);

  // Only run after hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Skip if not mounted to prevent hydration issues
    if (!isMounted) return;
    
    // Find and fix any preloaded stylesheets
    const preloadLinks = document.querySelectorAll('link[rel="preload"][as=""]');
    preloadLinks.forEach(link => {
      if (link.getAttribute('href')?.includes('.css')) {
        link.setAttribute('as', 'style');
      }
    });

    // Add event listener for future links
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'LINK' && node instanceof HTMLLinkElement) {
              if (node.rel === 'preload' && !node.hasAttribute('as') && node.href.includes('.css')) {
                node.setAttribute('as', 'style');
              }
            }
          });
        }
      });
    });

    observer.observe(document.head, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [isMounted]); // Only run after mount

  return null;
} 