'use client';

/**
 * Utility to clean up DOM attributes added by browser extensions
 * that cause hydration errors in Next.js
 */
export function removeBrowserExtensionAttributes() {
  if (typeof window === 'undefined') return;
  
  // Execute after a small delay to ensure DOM is fully loaded
  setTimeout(() => {
    try {
      // Function to clean up problematic attributes
      const cleanupAttributes = () => {
        // Remove cz-shortcut-listen attribute which is known to cause hydration issues
        document.querySelectorAll('[cz-shortcut-listen]').forEach(el => {
          el.removeAttribute('cz-shortcut-listen');
        });
        
        // Remove other problematic attributes from extensions
        const problematicAttrs = [
          'data-ms-editor', 
          'data-gramm', 
          'data-lt-installed',
          'data-grammarly',
          'data-mce-style',
          'spellcheck',
          'autocorrect',
          'autocomplete',
          'data-skrollr-data'
        ];
        
        problematicAttrs.forEach(attr => {
          document.querySelectorAll(`[${attr}]`).forEach(el => {
            // Skip inputs and textareas for attributes that might be legitimate there
            if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && 
                ['spellcheck', 'autocorrect', 'autocomplete'].includes(attr)) {
              return;
            }
            el.removeAttribute(attr);
          });
        });

        // Handle body element separately
        if (document.body.hasAttribute('cz-shortcut-listen')) {
          document.body.removeAttribute('cz-shortcut-listen');
        }
      };

      // First cleanup pass
      cleanupAttributes();
      
      // Set up a MutationObserver to handle attributes added after initial load
      const observer = new MutationObserver((mutations) => {
        let shouldCleanup = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes') {
            const attributeName = mutation.attributeName;
            if (attributeName === 'cz-shortcut-listen' || 
                attributeName?.startsWith('data-') || 
                ['spellcheck', 'autocorrect', 'autocomplete'].includes(attributeName || '')) {
              shouldCleanup = true;
            }
          }
        });
        
        if (shouldCleanup) {
          // Debounce the cleanup to avoid excessive processing
          if (observer.cleanup) {
            clearTimeout(observer.cleanup);
          }
          
          observer.cleanup = setTimeout(() => {
            cleanupAttributes();
            delete observer.cleanup;
          }, 50);
        }
      });
      
      // Start observing the document with the configured parameters
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['cz-shortcut-listen', 'data-ms-editor', 'data-gramm', 'data-lt-installed']
      });
      
      // Store observer in window object to prevent garbage collection
      window.__hydrationFix = { observer };
      
    } catch (error) {
      console.error('Error cleaning up browser extension attributes:', error);
    }
  }, 0);

  // Also add a special stylesheet to hide elements with problematic attributes during hydration
  if (typeof document !== 'undefined' && !document.getElementById('hydration-fix-style')) {
    const style = document.createElement('style');
    style.id = 'hydration-fix-style';
    style.textContent = `
      [cz-shortcut-listen], 
      [data-ms-editor], 
      [data-gramm], 
      [data-lt-installed], 
      [data-grammarly] {
        opacity: 0 !important;
        transition: opacity 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    // Remove the style after hydration is complete
    setTimeout(() => {
      const styleEl = document.getElementById('hydration-fix-style');
      if (styleEl) {
        styleEl.remove();
      }
    }, 1000);
  }
} 