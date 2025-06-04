import { useState, useEffect, useCallback } from 'react';

interface FullscreenSection {
  section: any;
  SectionComponent: React.ComponentType;
}

interface UseFullscreenReturn {
  fullscreenSection: FullscreenSection | null;
  isExiting: boolean;
  isLoading: boolean;
  enterFullscreen: (section: any, SectionComponent: React.ComponentType) => void;
  exitFullscreen: () => void;
}

export const useFullscreen = (): UseFullscreenReturn => {
  const [fullscreenSection, setFullscreenSection] = useState<FullscreenSection | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const enterFullscreen = useCallback((section: any, SectionComponent: React.ComponentType) => {
    // Prevent multiple rapid calls
    if (fullscreenSection || isLoading) return;
    
    setIsLoading(true);
    setFullscreenSection({ section, SectionComponent });
    
    // Prevent body scroll when in fullscreen
    document.body.style.overflow = 'hidden';
    document.body.classList.add('fullscreen-active');    // Add subtle animation delay for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350); // Reduced for faster animation

    return () => clearTimeout(timer);
  }, [fullscreenSection, isLoading]);

  const exitFullscreen = useCallback(() => {
    if (!fullscreenSection || isExiting) return;
    
    setIsExiting(true);
    
    // Restore body scroll
    document.body.style.overflow = 'unset';
    document.body.classList.remove('fullscreen-active');
      // Delay the actual state change to allow exit animation
    const timer = setTimeout(() => {
      setFullscreenSection(null);
      setIsExiting(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [fullscreenSection, isExiting]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenSection && !isExiting) {
        e.preventDefault();
        exitFullscreen();
      }
    };

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && fullscreenSection) {
        // Basic focus trap - can be enhanced with more sophisticated logic
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    if (fullscreenSection) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleFocusTrap);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleFocusTrap);
      };
    }
  }, [fullscreenSection, exitFullscreen, isExiting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('fullscreen-active');
    };
  }, []);

  return {
    fullscreenSection,
    isExiting,
    isLoading,
    enterFullscreen,
    exitFullscreen,
  };
};
