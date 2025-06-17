import React, { useState, useEffect } from 'react';
import { IFrameViewer } from '../../../molecules/iframeViewer';
import { Button } from '../../../ui/button';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SplitLayoutProvider } from '../../../../contexts/SplitLayoutContext';

interface SplitLayoutProps {
  children: React.ReactNode;
  previewUrl?: string;
  focusSection?: string;
  fullscreenSection?: boolean;
  exitFullscreen: () => void; // Optional exitFullscreen function
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ 
  children, 
  previewUrl = 'https://gh-website-nu.vercel.app/',
  focusSection,
  fullscreenSection,
  exitFullscreen
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(fullscreenSection);
  const [isIframeCollapsed, setIsIframeCollapsed] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(previewUrl);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  
  // Update iframe URL when previewUrl prop changes
  useEffect(() => {
    setIframeUrl(previewUrl);
  }, [previewUrl]);
  
  // Function to refresh the iframe
  const refreshPreview = () => {
    setRefreshKey(Date.now());
    exitFullscreen2(); // Exit fullscreen when refreshing
  };
    const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsCollapsed(false); // Reset collapse state when toggling fullscreen
    setIsIframeCollapsed(false); // Reset iframe collapse when toggling fullscreen
  };
  
  const exitFullscreen2 = () => {
    // console.log("Exiting fullscreen");
    setIsFullscreen(false);
    setIsCollapsed(false);
    setIsIframeCollapsed(false);
    exitFullscreen()
  };  return (
    <SplitLayoutProvider 
      refreshPreview={refreshPreview}
      isFullscreen={isFullscreen||false}
      toggleFullscreen={toggleFullscreen}
      exitFullscreen={exitFullscreen2}
    >
      <div className={`${fullscreenSection ? 'h-full' : 'h-[calc(100vh-120px)]'} transition-all duration-300 ease-in-out`}>
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          <ResizablePanel 
            defaultSize={50}
            minSize={10}
            style={{ 
              display: isCollapsed || isIframeCollapsed ? "none" : "block",
              transition: "all 0.3s ease-in-out"
            }}
            className="transition-all duration-300 ease-in-out"
          >            <div className={`${fullscreenSection ? 'p-2 sm:p-3' : 'p-4'} h-full overflow-auto dark:bg-gray-900 relative transition-all duration-300`}>
              {/* Content controls for fullscreen mode */}
              {/* {fullscreenSection && (
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-full h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                    title={isCollapsed ? "Show editor" : "Hide editor"}
                  >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsIframeCollapsed(!isIframeCollapsed)}
                    className="rounded-full h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                    title={isIframeCollapsed ? "Show preview" : "Hide preview"}
                    disabled={isCollapsed}
                  >
                    {!isIframeCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                </div>
              )} */}
              
              {children}
            </div>
          </ResizablePanel>
        
        {/* <div className="flex items-center absolute left-[calc(50%-12px)] top-1/2 transform -translate-y-1/2 z-10">
          <div className="flex flex-col gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-full h-8 w-8 bg-gray-200 hover:bg-gray-300"
              title={isCollapsed ? "Show editor" : "Hide editor"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleFullscreen}
              className="rounded-full h-8 w-8 bg-gray-200 hover:bg-gray-300 mt-2"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen mode"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsIframeCollapsed(!isIframeCollapsed)}
              className="rounded-full h-8 w-8 bg-gray-200 hover:bg-gray-300 mt-2"
              title={isIframeCollapsed ? "Show preview" : "Hide preview"}
              disabled={isCollapsed}
            >
              {!isIframeCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div> */}        <ResizableHandle withHandle className="transition-opacity duration-300 hover:opacity-100" />
        
        <ResizablePanel 
          defaultSize={50}
          minSize={10}
          style={{ 
            display: isIframeCollapsed || isCollapsed ? "none" : "block",
            transition: "all 0.3s ease-in-out" 
          }}
          className="transition-all duration-300 ease-in-out"
        >        
          <IFrameViewer 
            url={iframeUrl} 
            title="Website Preview" 
            height="100%" 
            className="h-full w-full transition-all duration-300"
            focusSection={focusSection}
            key={refreshKey}
          />
        </ResizablePanel></ResizablePanelGroup>
      </div>
    </SplitLayoutProvider>
  );
};

export default SplitLayout;
