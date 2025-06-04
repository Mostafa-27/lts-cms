import React, { createContext, useContext, type ReactNode } from 'react';

interface SplitLayoutContextType {
  refreshPreview: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  exitFullscreen: () => void;
}

const SplitLayoutContext = createContext<SplitLayoutContextType | null>(null);

export const useSplitLayout = () => {
  const context = useContext(SplitLayoutContext);
  if (!context) {
    // Return no-op functions if context is not available
    return { 
      refreshPreview: () => {},
      isFullscreen: false,
      toggleFullscreen: () => {},
      exitFullscreen: () => {}
    };
  }
  return context;
};

interface SplitLayoutProviderProps {
  children: ReactNode;
  refreshPreview: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  exitFullscreen: () => void;
}

export const SplitLayoutProvider: React.FC<SplitLayoutProviderProps> = ({
  children,
  refreshPreview,
  isFullscreen,
  toggleFullscreen,
  exitFullscreen,
}) => {
  return (
    <SplitLayoutContext.Provider value={{ 
      refreshPreview, 
      isFullscreen, 
      toggleFullscreen, 
      exitFullscreen 
    }}>
      {children}
    </SplitLayoutContext.Provider>
  );
};
