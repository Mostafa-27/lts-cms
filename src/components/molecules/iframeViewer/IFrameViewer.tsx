import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../ui/button';
import { RefreshCcw } from 'lucide-react';

interface IFrameViewerProps {
  url: string;
  title?: string;
  height?: string;
  className?: string;
  focusSection?: string;
}

const IFrameViewer: React.FC<IFrameViewerProps> = ({
  url,
  title = 'Website Preview',
  height = '100%',
  className = '',
  focusSection,
}) => {
  const [iframeKey, setIframeKey] = useState(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const handleRefresh = () => {
    // Update the key to force re-render of the iframe
    setIframeKey(Date.now());
  };
  
  // Function to scroll to a specific section within the iframe
  const scrollToSection = (sectionId: string) => {
    if (!iframeRef.current) return;
    
    try {
      const iframeWindow = iframeRef.current.contentWindow;
      if (!iframeWindow) return;
      
      // Wait for iframe to load
      setTimeout(() => {        // Try to find the section by ID and execute script in the iframe
        try {
          // Using postMessage for cross-origin communication
          iframeWindow.postMessage({ 
            type: 'scrollToSection', 
            sectionId: sectionId 
          }, '*');
        } catch (e) {
          console.error('Failed to scroll to section:', e);
        }
      }, 1000);
    } catch (error) {
      console.error("Error accessing iframe content:", error);
    }
  };
  
  // Scroll to section when it changes or iframe refreshes
  useEffect(() => {
    if (focusSection) {
      scrollToSection(focusSection);
    }
  }, [focusSection, iframeKey]);
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-center mb-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
        <h3 className="text-lg font-medium dark:text-gray-100">{title}</h3>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>
      <div className="flex-1 border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
        <iframe
          ref={iframeRef}
          key={iframeKey}
          src={url}
          title={title}
          width="100%"
          height={height}
          className="w-full h-full"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default IFrameViewer;
