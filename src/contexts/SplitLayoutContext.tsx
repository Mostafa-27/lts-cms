import React, { createContext, useContext, type ReactNode } from 'react';

interface SplitLayoutContextType {
  refreshPreview: () => void;
}

const SplitLayoutContext = createContext<SplitLayoutContextType | null>(null);

export const useSplitLayout = () => {
  const context = useContext(SplitLayoutContext);
  if (!context) {
    // Return a no-op function if context is not available
    return { refreshPreview: () => {} };
  }
  return context;
};

interface SplitLayoutProviderProps {
  children: ReactNode;
  refreshPreview: () => void;
}

export const SplitLayoutProvider: React.FC<SplitLayoutProviderProps> = ({
  children,
  refreshPreview,
}) => {
  return (
    <SplitLayoutContext.Provider value={{ refreshPreview }}>
      {children}
    </SplitLayoutContext.Provider>
  );
};
