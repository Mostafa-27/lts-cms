import React, { useEffect, useState, useCallback } from 'react';
import { Delta } from 'quill'; // Import Delta from Quill

interface SimpleImageResizeProps {
  quillRef: React.RefObject<any>;
}

const SimpleImageResize: React.FC<SimpleImageResizeProps> = ({ quillRef }) => {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleImageClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      
      const imgElement = target as HTMLImageElement;
      console.log('Image clicked:', imgElement);
      
      setSelectedImage(imgElement);
      setShowControls(true);
      setHasChanges(false);
      
      // Update dimensions display
      setDimensions({
        width: imgElement.offsetWidth,
        height: imgElement.offsetHeight
      });
      
      // Remove selection from other images
      if (quillRef.current) {
        const editor = quillRef.current.getEditor().root;
        editor.querySelectorAll('img').forEach((img: HTMLImageElement) => {
          img.style.outline = '';
        });
      }
      
      // Highlight selected image
      imgElement.style.outline = '2px solid #007bff';
    }
  }, [quillRef]);

  const handleClickOutside = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'IMG' && !target.closest('.resize-controls')) {
      setSelectedImage(null);
      setShowControls(false);
      setHasChanges(false);
      
      // Remove outlines from all images
      if (quillRef.current) {
        const editor = quillRef.current.getEditor().root;
        editor.querySelectorAll('img').forEach((img: HTMLImageElement) => {
          img.style.outline = '';
        });
      }
    }
  }, [quillRef]);
  useEffect(() => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const editor = quill.root;

    editor.addEventListener('click', handleImageClick);
    document.addEventListener('click', handleClickOutside);

    return () => {
      editor.removeEventListener('click', handleImageClick);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [quillRef, handleImageClick, handleClickOutside]);  // Add a useEffect to restore image dimensions - but only for properly saved images
  useEffect(() => {
    if (!quillRef.current) return;

    const restoreImageDimensions = () => {
      const quill = quillRef.current.getEditor();
      const editor = quill.root;
      const images = editor.querySelectorAll('img[data-resized="true"]');
      
      images.forEach((img: HTMLImageElement) => {
        const savedWidth = img.getAttribute('data-width');
        const savedHeight = img.getAttribute('data-height');
        
        // Only restore if image has been properly saved and dimensions are different
        if (savedWidth && savedHeight) {
          const currentWidth = img.offsetWidth;
          const currentHeight = img.offsetHeight;
          
          // Only restore if the current dimensions don't match saved dimensions
          if (Math.abs(currentWidth - parseInt(savedWidth)) > 2 || 
              Math.abs(currentHeight - parseInt(savedHeight)) > 2) {
            
            console.log(`Restoring image dimensions: ${savedWidth}x${savedHeight}`);
            
            // Force the image to maintain its saved dimensions
            img.setAttribute('width', savedWidth);
            img.setAttribute('height', savedHeight);
            img.style.setProperty('width', `${savedWidth}px`, 'important');
            img.style.setProperty('height', `${savedHeight}px`, 'important');
            img.style.setProperty('max-width', 'none', 'important');
            img.style.setProperty('max-height', 'none', 'important');
            
            // Additional enforcement
            (img as any).__permanentWidth = savedWidth;
            (img as any).__permanentHeight = savedHeight;
            (img as any).__isPermanentlyResized = true;
          }
        }
      });
    };

    // Restore dimensions immediately
    restoreImageDimensions();

    // Set up observer to catch any changes - but be less aggressive
    const observer = new MutationObserver(() => {
      setTimeout(restoreImageDimensions, 50);
    });

    observer.observe(quillRef.current.getEditor().root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'width', 'height']
    });

    // Less aggressive interval - only run every 2 seconds
    const intervalId = setInterval(restoreImageDimensions, 2000);

    // Listen for Quill text changes and restore after a delay
    const quill = quillRef.current.getEditor();
    const handleTextChange = () => {
      setTimeout(restoreImageDimensions, 100);
    };
    
    quill.on('text-change', handleTextChange);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      quill.off('text-change', handleTextChange);
    };
  }, [quillRef]);const handleResize = useCallback((direction: 'width' | 'height', delta: number) => {
    console.log(`HandleResize called: ${direction}, delta: ${delta}`);
    
    if (!selectedImage) {
      console.warn('No image selected');
      return;
    }

    // Get current dimensions from the image itself
    const rect = selectedImage.getBoundingClientRect();
    const currentWidth = rect.width;
    const currentHeight = rect.height;
    
    console.log(`Current dimensions: ${currentWidth}x${currentHeight}`);
    
    // Calculate new dimensions
    let newWidth: number;
    let newHeight: number;

    if (direction === 'width') {
      newWidth = Math.max(50, Math.min(800, currentWidth + delta));
      // Maintain aspect ratio
      if (selectedImage.naturalWidth && selectedImage.naturalHeight) {
        const aspectRatio = selectedImage.naturalHeight / selectedImage.naturalWidth;
        newHeight = newWidth * aspectRatio;
      } else {
        newHeight = (newWidth / currentWidth) * currentHeight;
      }
    } else {
      newHeight = Math.max(30, Math.min(600, currentHeight + delta));
      // Maintain aspect ratio
      if (selectedImage.naturalWidth && selectedImage.naturalHeight) {
        const aspectRatio = selectedImage.naturalWidth / selectedImage.naturalHeight;
        newWidth = newHeight * aspectRatio;
      } else {
        newWidth = (newHeight / currentHeight) * currentWidth;
      }
    }
    
    console.log(`New dimensions: ${Math.round(newWidth)}x${Math.round(newHeight)}`);
    
    // Apply new dimensions directly to the image
    selectedImage.style.width = `${Math.round(newWidth)}px`;
    selectedImage.style.height = `${Math.round(newHeight)}px`;
    selectedImage.style.maxWidth = 'none';
    selectedImage.style.maxHeight = 'none';

    // Update dimensions state for display
    setDimensions({
      width: Math.round(newWidth),
      height: Math.round(newHeight)
    });

    // Mark as having changes - MANUAL SAVE ONLY
    setHasChanges(true);
    console.log('Resize applied, changes marked as unsaved');
  }, [selectedImage]);  const resetSize = useCallback(() => {
    if (!selectedImage) return;
    
    console.log('Reset size called');
    
    // Remove all custom sizing styles
    selectedImage.style.removeProperty('width');
    selectedImage.style.removeProperty('height');
    selectedImage.style.removeProperty('max-width');
    selectedImage.style.removeProperty('max-height');
    selectedImage.style.removeProperty('object-fit');
    
    // Reset to editor defaults
    selectedImage.style.setProperty('max-width', '100%');
    selectedImage.style.setProperty('height', 'auto');
    
    // Update dimensions display
    setTimeout(() => {
      setDimensions({
        width: selectedImage.offsetWidth,
        height: selectedImage.offsetHeight
      });
    }, 100);
    
    // Mark as having changes - NO AUTO-SAVE
    setHasChanges(true);
    console.log('Size reset, changes marked as unsaved');
  }, [selectedImage]);  // Function to manually save changes - PRESERVE DIMENSIONS PERMANENTLY
  const saveChanges = useCallback(() => {
    console.log('Save changes called, hasChanges:', hasChanges);
    
    if (!quillRef.current || !hasChanges || !selectedImage) {
      console.log('No changes to save or no quill ref or no selected image');
      return;
    }
    
    try {
      const quill = quillRef.current.getEditor();
      
      // Get the current CSS dimensions
      const currentWidth = Math.round(selectedImage.offsetWidth);
      const currentHeight = Math.round(selectedImage.offsetHeight);
      
      console.log('Saving dimensions:', currentWidth, currentHeight);
      
      // Store the image source for later use
      const imgSrc = selectedImage.getAttribute('src') || '';
      
      // Simple approach: Set width/height attributes directly on the image
      // This avoids complex Quill operations that might fail
      selectedImage.setAttribute('width', currentWidth.toString());
      selectedImage.setAttribute('height', currentHeight.toString());
      selectedImage.setAttribute('data-resized', 'true');
      selectedImage.setAttribute('data-width', currentWidth.toString());
      selectedImage.setAttribute('data-height', currentHeight.toString());
      
      // Apply necessary CSS styles with !important to ensure they take precedence
      selectedImage.style.setProperty('width', `${currentWidth}px`, 'important');
      selectedImage.style.setProperty('height', `${currentHeight}px`, 'important');
      selectedImage.style.setProperty('max-width', 'none', 'important');
      selectedImage.style.setProperty('max-height', 'none', 'important');
      selectedImage.style.setProperty('display', 'block', 'important');
      
      // Ensure the HTML content is updated in the editor
      const updatedHTML = quill.root.innerHTML;
      
      // Update the editor content using clipboard API (safer than updateContents)
      quill.clipboard.dangerouslyPasteHTML(updatedHTML, 'api');
      
      // Now trigger the parent onChange handler to save changes
      setTimeout(() => {
        // This delay ensures React has time to process the DOM changes
        const finalHTML = quill.root.innerHTML;
        
        // Find the parent React component and trigger onChange
        if (quillRef.current && quillRef.current.props && quillRef.current.props.onChange) {
          quillRef.current.props.onChange(finalHTML);
          console.log('⚡ Triggered onChange via React props');
        }
      }, 50);
      
      // Reset changes flag
      setHasChanges(false);
      
      console.log('✅ Image size saved with HTML attributes:', `width="${currentWidth}" height="${currentHeight}"`);
      console.log('Image element after save:', selectedImage.outerHTML);
      
      // Show visual feedback on the image
      const originalOutline = selectedImage.style.outline;
      selectedImage.style.outline = '3px solid #28a745';
      setTimeout(() => {
        selectedImage.style.outline = originalOutline;
      }, 2000);
      
      // Apply a special class to the image that our CSS can target
      selectedImage.classList.add('resized-image-saved');
      
    } catch (error) {
      console.error('Error saving image resize changes:', error);
    }
  }, [quillRef, hasChanges, selectedImage]);if (!showControls || !selectedImage) return null;

  // Calculate position more reliably 
  const rect = selectedImage.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Position controls above image, but if not enough space, position below
  const controlsHeight = 60;
  let top = rect.top - controlsHeight - 10;
  if (top < 10) {
    top = rect.bottom + 10;
  }
  
  // Keep controls within viewport width
  let left = rect.left;
  if (left + 300 > viewportWidth) {
    left = viewportWidth - 310;
  }
  if (left < 10) {
    left = 10;
  }
  
  return (
    <div 
      className="resize-controls fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg z-50"
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
    ><div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 dark:text-gray-300">
          {Math.round(selectedImage.offsetWidth)} × {Math.round(selectedImage.offsetHeight)}px
        </span>
        
        {hasChanges && (
          <span className="text-orange-500 text-xs font-medium">
            ● Unsaved changes
          </span>
        )}        <div className="flex gap-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Decrease width clicked');
              handleResize('width', -10);
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            title="Decrease width"
            type="button"
          >
            W-
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Increase width clicked');
              handleResize('width', 10);
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            title="Increase width"
            type="button"
          >
            W+
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Decrease height clicked');
              handleResize('height', -10);
            }}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            title="Decrease height"
            type="button"
          >
            H-
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Increase height clicked');
              handleResize('height', 10);
            }}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            title="Increase height"
            type="button"
          >
            H+
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Reset clicked');
              resetSize();
            }}
            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
            title="Reset size"
            type="button"
          >
            Reset
          </button>
          
          {/* Save button - always visible but highlighted when there are changes */}      <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                saveChanges();
              } catch (error) {
                console.error('Failed to save image changes:', error);
                // Fallback direct save approach
                if (selectedImage) {
                  // Get dimensions
                  const width = Math.round(selectedImage.offsetWidth);
                  const height = Math.round(selectedImage.offsetHeight);
                  
                  // Apply attributes directly
                  selectedImage.setAttribute('width', width.toString());
                  selectedImage.setAttribute('height', height.toString());
                  selectedImage.style.width = `${width}px`;
                  selectedImage.style.height = `${height}px`;
                  
                  console.log('Applied fallback save with dimensions:', width, height);
                  setHasChanges(false);
                }
              }
            }}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              hasChanges 
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md' 
                : 'bg-gray-300 text-gray-600 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300'
            }`}
            title={hasChanges ? "Save changes" : "No changes to save"}
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleImageResize;
