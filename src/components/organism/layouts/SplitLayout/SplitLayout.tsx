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
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ 
  children, 
  previewUrl = 'https://gh-website-nu.vercel.app/',
  focusSection
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsCollapsed(false); // Reset collapse state when toggling fullscreen
    setIsIframeCollapsed(false); // Reset iframe collapse when toggling fullscreen
  };  return (
    <SplitLayoutProvider refreshPreview={refreshPreview}>
      <div className={`${isFullscreen ? 'h-screen fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'h-[calc(100vh-120px)]'}`}>
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          <ResizablePanel 
            defaultSize={50}
            minSize={10}
            style={{ 
              display: isCollapsed || isIframeCollapsed ? "none" : "block",
              transition: "all 0.3s"
            }}
            className="transition-all duration-300"
          >
            <div className="p-4 h-full overflow-auto dark:bg-gray-900">
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
        </div> */}

        <ResizableHandle withHandle />
        
        <ResizablePanel 
          defaultSize={50}
          minSize={10}
          style={{ 
            display: isIframeCollapsed || isCollapsed ? "none" : "block",
            transition: "all 0.3s" 
          }}
          className="transition-all duration-300"
        >          <IFrameViewer 
            url={iframeUrl} 
            title="Website Preview" 
            height="100%" 
            className="h-full w-full"
            focusSection={focusSection}
            key={refreshKey}
          />
        </ResizablePanel>        </ResizablePanelGroup>
      </div>
    </SplitLayoutProvider>
  );
};

export default SplitLayout;
