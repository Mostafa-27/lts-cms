import React, { useEffect, useRef, useState } from 'react';
// import { Button } from '../../../ui/button';
import { X, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullscreenModalProps {
  isOpen: boolean;
  isExiting: boolean;
  isLoading: boolean;
  section: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  onClose: () => void;
  children: React.ReactNode;
}

export const FullscreenModal: React.FC<FullscreenModalProps> = React.memo(({
  isOpen,
  isExiting,
  isLoading,
  section,
  onClose,
  children,
}) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  // Store the previously focused element and restore focus on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setIsEntering(true);
      setHasEntered(false);
      
      // Start entrance animation
      const enterTimer = setTimeout(() => {
        setIsEntering(false);
        setHasEntered(true);
      }, 30);
      
      // Focus the modal container after animation settles
      const focusTimer = setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 250);
      
      return () => {
        clearTimeout(enterTimer);
        clearTimeout(focusTimer);
      };
    } else {
      setHasEntered(false);
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        // F11 or Ctrl+Shift+F to toggle maximize
        if (e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
          e.preventDefault();
          toggleMaximize();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, toggleMaximize]);

  if (!isOpen) return null;
  return (
    <>      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ease-out ${
          isEntering ? 'fullscreen-backdrop-enter opacity-0' : isExiting ? 'fullscreen-backdrop-exit opacity-0' : 'opacity-100'
        }`}
        onClick={onClose}
        aria-label="Close fullscreen modal"
      />

      {/* Modal Content */}
      <div 
        ref={modalRef}
        className={`${isMaximized ? 'fixed inset-0 p-0' : 'fixed inset-0 flex items-center justify-center p-1 sm:p-2'} z-50 perspective-1000 ${
          isEntering 
            ? 'fullscreen-enter' 
            : isExiting 
              ? 'fullscreen-exit' 
              : 'opacity-100 transform scale-100 translate-y-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fullscreen-title"
        tabIndex={-1}
      >
        <div className={`${isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none' : 'w-full h-full max-w-[95vw] max-h-[95vh] rounded-lg'} bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden fullscreen-element transform-style-3d ${
          isEntering ? 'shadow-none' : 'shadow-2xl'
        }`}>          {/* Header */}
          <div className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fullscreen-content ${
            isEntering ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
          }`} style={{ transitionDelay: isEntering ? '0ms' : '80ms' }}>
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">              <div className={`fullscreen-element ${
                isEntering ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
              }`} style={{ transitionDelay: isEntering ? '0ms' : '120ms' }}>
                <section.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              </div>
              <h2 
                id="fullscreen-title"
                className={`text-sm sm:text-lg font-semibold text-gray-800 dark:text-gray-200 truncate fullscreen-content ${
                  isEntering ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
                }`}
                style={{ transitionDelay: isEntering ? '0ms' : '140ms' }}
              >
                {section.name}  
              </h2>
              <span className={`hidden md:inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full flex-shrink-0 fullscreen-element ${
                isEntering ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
              }`} style={{ transitionDelay: isEntering ? '0ms' : '160ms' }}>
                Fullscreen Mode
              </span>
            </div>
            
            <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 fullscreen-content ${
              isEntering ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
            }`} style={{ transitionDelay: isEntering ? '0ms' : '300ms' }}><span className="hidden lg:inline text-xs text-gray-500 dark:text-gray-400 mr-1 sm:mr-2">
                ESC: exit • F11: maximize
              </span>
                <Button
                variant="ghost" 
                size="sm"
                onClick={toggleMaximize}
                className="rounded-md px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                aria-label={isMaximized ? "Restore window" : "Maximize window"}
                title={isMaximized ? "Restore window (F11)" : "Maximize to full viewport (F11)"}
              >
                {isMaximized ? <Minimize className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
              
              <Button
                variant="ghost" 
                size="sm"
                onClick={onClose}
                className="rounded-md px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                aria-label="Exit fullscreen mode"
                autoFocus
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline text-xs sm:text-sm">Exit</span>
              </Button>
            </div>
          </div>          {/* Content */}
          <div className={`flex-1 h-[calc(100%-49px)] sm:h-[calc(100%-57px)] relative fullscreen-content ${
            isEntering ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'
          }`} style={{ transitionDelay: isEntering ? '0ms' : '250ms' }}>
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 flex items-center justify-center transition-all duration-300">
                <div className={`flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 fullscreen-element ${
                  isLoading ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 fullscreen-element"></div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 fullscreen-content">
                      Loading {section.name} Section
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 fullscreen-content">
                      Preparing fullscreen view...
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className={`h-full fullscreen-content ${
              isEntering || isLoading ? 'opacity-60 scale-98' : 'opacity-100 scale-100'
            }`} style={{ transitionDelay: isEntering ? '0ms' : '300ms' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
