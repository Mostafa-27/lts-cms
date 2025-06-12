import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Delta } from 'quill';
import Quill from 'quill';
import { 
  isImageValid, 
  safelyApplyStyles, 
  safelyApplyAttributes,
  safelyGetImageDimensions,
  persistImageSize
} from './image-safety';

// Helper function to find an image position in Quill content
const findImageInQuillContent = (quill: any, imgSrc: string): number => {
  try {
    const contents = quill.getContents();
    let imageIndex = -1;
    
    if (!contents || !contents.ops) {
      return -1;
    }
    
    let index = 0;
    for (let i = 0; i < contents.ops.length; i++) {
      const op = contents.ops[i];
      
      // Skip text inserts
      if (typeof op.insert === 'string') {
        index += op.insert.length;
        continue;
      }
      
      // Check if this is an image
      if (op.insert && op.insert.image) {
        // Check if this is our target image
        if (op.insert.image === imgSrc) {
          imageIndex = index;
          break;
        }
      }
      
      // Each non-text insert counts as 1 position
      index += 1;
    }
    
    return imageIndex;
  } catch (error) {
    console.error('Error finding image in Quill content:', error);
    return -1;
  }
};

interface SimpleImageResizeProps {
  quillRef: React.RefObject<any>;
}

const SimpleImageResize: React.FC<SimpleImageResizeProps> = ({ quillRef }) => {
  // State declarations
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });
  const [showPreview, setShowPreview] = useState(false);
  
  // Refs
  const controlsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Helper function to calculate position for controls - returns position object instead of manipulating DOM
  const calculateControlsPosition = useCallback((imageElement: HTMLImageElement | null, controlsHeight = 90, controlsWidth = 320) => {
    // Default position
    let position = { top: 100, left: 100 };
    
    if (!imageElement || !document.body.contains(imageElement)) {
      return position;
    }
    
    try {
      const rect = imageElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      console.log('Control dimensions:', { height: controlsHeight, width: controlsWidth });
      console.log('Image rect:', rect);
      
      // Position above the image by default with a safe margin
      let top = Math.max(10, rect.top - controlsHeight - 15);
      
      // If there's not enough space above, position below with offset
      if (top < 10) {
        top = Math.min(viewportHeight - controlsHeight - 10, rect.bottom + 15);
      }
      
      // Ensure controls are always within viewport
      if (top + controlsHeight > viewportHeight - 10) {
        top = Math.max(10, viewportHeight - controlsHeight - 20);
      }
      
      // Center horizontally relative to the image
      let left = rect.left + (rect.width / 2) - (controlsWidth / 2);
      
      // Keep within viewport bounds
      if (left + controlsWidth > viewportWidth - 10) {
        left = viewportWidth - controlsWidth - 10;
      }
      if (left < 10) {
        left = 10;
      }
      
      position = { 
        top: Math.round(top),
        left: Math.round(left)
      };
      
      console.log('Calculated controls position:', position);
    } catch (error) {
      console.error('Error calculating control position:', error);
    }
    
    return position;
  }, []);

  // Function to safely update the position of the controls panel
  const updateControlsPosition = useCallback((controlsElement: HTMLDivElement, imageElement: HTMLImageElement | null) => {
    if (!controlsElement || !imageElement || !document.body.contains(imageElement)) {
      return;
    }

    try {
      const position = calculateControlsPosition(imageElement);
      
      // Apply position updates via style properties
      controlsElement.style.top = `${position.top}px`;
      controlsElement.style.left = `${position.left}px`;
      controlsElement.style.display = 'block';
      controlsElement.style.visibility = 'visible';
      
      // Add active class for transition effects
      controlsElement.classList.add('active');
    } catch (error) {
      console.error('Error updating controls position:', error);
    }
  }, [calculateControlsPosition]);

  // Helper function to update the preview overlay showing resize results
  const updatePreviewOverlay = useCallback((imageElement: HTMLImageElement, width: number, height: number) => {
    if (!imageElement || !document.body.contains(imageElement)) {
      return;
    }
    
    try {
      // Create or get the preview overlay
      let previewOverlay = document.querySelector('.image-resize-preview') as HTMLDivElement;
      
      if (!previewOverlay) {
        previewOverlay = document.createElement('div');
        previewOverlay.className = 'image-resize-preview';
        document.body.appendChild(previewOverlay);
      }
      
      // Position and size the overlay based on the image
      const rect = imageElement.getBoundingClientRect();
      
      // Set overlay styles
      previewOverlay.style.position = 'absolute';
      previewOverlay.style.border = '2px dashed #2196F3';
      previewOverlay.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';  
      previewOverlay.style.pointerEvents = 'none';
      previewOverlay.style.zIndex = '9998';
      previewOverlay.style.top = `${rect.top}px`;
      previewOverlay.style.left = `${rect.left}px`;
      previewOverlay.style.width = `${width}px`;
      previewOverlay.style.height = `${height}px`;
      previewOverlay.style.display = 'block';
      
      // Store a reference
      if (previewRef) {
        previewRef.current = previewOverlay;
      }
    } catch (error) {
      console.error('Error updating preview overlay:', error);
    }
  }, []);
  
  // Clear the preview overlay
  const clearPreviewOverlay = useCallback(() => {
    try {
      const previewOverlay = document.querySelector('.image-resize-preview');
      if (previewOverlay) {
        previewOverlay.remove();
      }
      setShowPreview(false);
    } catch (error) {
      console.error('Error clearing preview overlay:', error);
    }
  }, []);
  
  // Update controls position whenever selectedImage or showControls change
  useEffect(() => {
    if (controlsRef.current && selectedImage && showControls) {
      // Wait until after React's rendering cycle is complete
      setTimeout(() => {
        if (controlsRef.current && selectedImage && document.body.contains(selectedImage)) {
          updateControlsPosition(controlsRef.current, selectedImage);
        }
      }, 0);
    }
  }, [selectedImage, showControls, updateControlsPosition]);

  // Clean up any DOM elements on unmount
  useEffect(() => {
    return () => {
      // Clean up any lingering UI state
      document.body.classList.remove('resizing-active');
      
      // Remove classes from any selected images
      document.querySelectorAll('img.selected-for-resize').forEach(img => {
        try {
          img.classList.remove('selected-for-resize');
          (img as HTMLElement).style.outline = '';
        } catch (e) {
          // Ignore errors on cleanup - the node might already be gone
        }
      });
      
      // Clean up preview overlay
      try {
        const previewOverlay = document.querySelector('.image-resize-preview');
        if (previewOverlay) {
          previewOverlay.remove();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      
      // Make sure we reset component state to avoid lingering references
      setSelectedImage(null);
      setShowControls(false);
      setHasChanges(false);
      
      // Hide the controls panel if it exists
      if (controlsRef.current) {
        controlsRef.current.style.display = 'none';
        controlsRef.current.style.visibility = 'hidden';
      }
    };
  }, []);

  // Image click handler
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
      
      // Clear any previous preview
      clearPreviewOverlay();
      
      // Update dimensions using our safe utility
      const { width, height } = safelyGetImageDimensions(imgElement);
      
      // Update state dimensions
      setDimensions({ width, height });
      setPreviewDimensions({ width, height });
      
      // Ensure data attributes are set for consistency
      safelyApplyAttributes(imgElement, {
        'data-width': width.toString(),
        'data-height': height.toString()
      });
      
      // Remove selection from other images
      if (quillRef.current) {
        const editor = quillRef.current.getEditor().root;
        editor.querySelectorAll('img').forEach((img: HTMLImageElement) => {
          safelyApplyStyles(img, { 'outline': '' });
          img.classList.remove('selected-for-resize');
        });
      }
      
      // Highlight selected image and add a CSS class for styling
      safelyApplyStyles(imgElement, { 'outline': '2px solid #007bff' });
      imgElement.classList.add('selected-for-resize');
    }
  }, [quillRef, clearPreviewOverlay]);

  // Outside click handler
  const handleClickOutside = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    
    if (document.body.classList.contains('resizing-active') || 
        document.querySelector('.resize-controls.active')) {
      console.log('Skipping outside click during active resize operation');
      return;
    }
    
    if (target.tagName !== 'IMG' && 
        !target.closest('.resize-controls') && 
        !target.closest('.ql-editor button')) {
      
      if (target.tagName === 'BUTTON' && 
          (target.closest('.resize-controls') || 
           target.textContent?.match(/W[\+\-]|H[\+\-]|Reset|Save/))) {
        console.log('Clicked a resize control button, keeping panel open');
        return;
      }
      
      // First remove highlight from images
      if (quillRef.current) {
        const editor = quillRef.current.getEditor().root;
        editor.querySelectorAll('img').forEach((img: HTMLImageElement) => {
          safelyApplyStyles(img, { 'outline': '' });
          img.classList.remove('selected-for-resize');
        });
      }
      
      // Clear any preview overlay
      clearPreviewOverlay();
      
      // Then hide controls and reset state to prevent race conditions
      if (controlsRef.current) {
        controlsRef.current.classList.remove('active');
        controlsRef.current.style.display = 'none';
        controlsRef.current.style.visibility = 'hidden';
      }
      
      // Finally update the state
      setSelectedImage(null);
      setShowControls(false);
      setHasChanges(false);
    }
  }, [quillRef, clearPreviewOverlay]);

  // Window resize handler
  useEffect(() => {
    if (!selectedImage || !showControls) return;

    const handleWindowResize = () => {
      if (controlsRef.current && selectedImage) {
        updateControlsPosition(controlsRef.current, selectedImage);
      }
      
      // Also update preview overlay if active
      if (showPreview && selectedImage) {
        updatePreviewOverlay(selectedImage, previewDimensions.width, previewDimensions.height);
      }
    };
    
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [selectedImage, showControls, showPreview, previewDimensions, updateControlsPosition, updatePreviewOverlay]);

  // Setup event listeners
  useEffect(() => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const editor = quill.root;

    // Use click event for more reliable interaction
    editor.addEventListener('click', handleImageClick);
    
    // Delay outside click handling to prevent conflicts with resize operations
    const handleOutsideClickWithDelay = (e: Event) => {
      // Skip handling if we're in resize mode or controls are active
      if (document.body.classList.contains('resizing-active') ||
          document.querySelector('.resize-controls.active')) {
        console.log('Skipping outside click during active resize');
        return;
      }
      
      // Add a more significant delay to allow other click handlers to complete
      setTimeout(() => {
        // Double check we're not in resize mode before proceeding
        if (!document.body.classList.contains('resizing-active') &&
            !document.querySelector('.resize-controls.active')) {
          handleClickOutside(e);
        }
      }, 50);
    };
    
    document.addEventListener('click', handleOutsideClickWithDelay);

    return () => {
      editor.removeEventListener('click', handleImageClick);
      document.removeEventListener('click', handleOutsideClickWithDelay);
    };
  }, [quillRef, handleImageClick, handleClickOutside]);
  
  // Image dimension restoration
  useEffect(() => {
    if (!quillRef.current) return;

    const restoreImageDimensions = () => {
      if (!quillRef.current) return;
      
      try {
        const quill = quillRef.current.getEditor();
        const editor = quill.root;
        const images = editor.querySelectorAll('img[data-resized="true"]');
        
        images.forEach((img: HTMLImageElement) => {
          if (!isImageValid(img)) return;
          
          const savedWidth = img.getAttribute('data-width');
          const savedHeight = img.getAttribute('data-height');
          
          if (savedWidth && savedHeight) {
            const currentWidth = img.offsetWidth;
            const currentHeight = img.offsetHeight;
            
            if (Math.abs(currentWidth - parseInt(savedWidth)) > 2 || 
                Math.abs(currentHeight - parseInt(savedHeight)) > 2) {
              
              console.log(`Restoring image dimensions: ${savedWidth}x${savedHeight}`);
              // Use our dedicated helper to apply dimensions consistently
              persistImageSize(img, parseInt(savedWidth), parseInt(savedHeight));
              
              // Store dimensions as properties on the element for faster access
              (img as any).__permanentWidth = savedWidth;
              (img as any).__permanentHeight = savedHeight;
              (img as any).__isPermanentlyResized = true;
            }
          }
        });
      } catch (error) {
        console.error("Error restoring image dimensions:", error);
      }
    };

    restoreImageDimensions();

    const observer = new MutationObserver(() => {
      setTimeout(restoreImageDimensions, 50);
    });

    observer.observe(quillRef.current.getEditor().root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'width', 'height']
    });

    const intervalId = setInterval(restoreImageDimensions, 2000);

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
  }, [quillRef]);  

  // Handler for resizing an image - only updates preview dimensions without modifying the actual image
  const handleResize = useCallback((direction: 'width' | 'height', delta: number) => {
    console.log(`HandleResize called: ${direction}, delta: ${delta}`);
    
    if (!selectedImage || !selectedImage.src) {
      console.warn('No valid image selected');
      return;
    }
    
    // Mark as resizing active to prevent other events
    document.body.classList.add('resizing-active');
    
    // Use existing preview dimensions or fall back to original dimensions
    const currentWidth = previewDimensions.width || dimensions.width || 0;
    const currentHeight = previewDimensions.height || dimensions.height || 0;
    
    console.log('Current dimensions:', { width: currentWidth, height: currentHeight });
    
    // Calculate new dimensions
    let newWidth: number;
    let newHeight: number;

    if (direction === 'width') {
      newWidth = Math.max(50, currentWidth + delta);
      // Maintain aspect ratio
      const aspectRatio = currentHeight / currentWidth;
      newHeight = Math.round(newWidth * aspectRatio);
    } else {
      newHeight = Math.max(30, currentHeight + delta);
      // Maintain aspect ratio
      const aspectRatio = currentWidth / currentHeight;
      newWidth = Math.round(newHeight * aspectRatio);
    }
    
    const roundedWidth = Math.round(newWidth);
    const roundedHeight = Math.round(newHeight);
    
    console.log('New dimensions:', { width: roundedWidth, height: roundedHeight });
    
    // Update preview dimensions in state - don't modify the actual image yet
    setPreviewDimensions({
      width: roundedWidth,
      height: roundedHeight
    });
    
    // Mark that the image has unsaved changes
    selectedImage.classList.add('has-unsaved-resize');
    
    // Show a preview overlay over the image
    updatePreviewOverlay(selectedImage, roundedWidth, roundedHeight);
    
    // Mark that we have changes
    setHasChanges(true);
    console.log('Setting preview dimensions to:', { width: roundedWidth, height: roundedHeight });
    
    // Update controls position with a slight delay
    setTimeout(() => {
      if (controlsRef.current && selectedImage) {
        updateControlsPosition(controlsRef.current, selectedImage);
      }
    }, 100);
  }, [selectedImage, updateControlsPosition, dimensions, previewDimensions, updatePreviewOverlay]);
  
  // Handler for resetting image size
  const resetSize = useCallback(() => {
    if (!selectedImage) return;
    
    console.log('Reset size called');
    
    try {
      if (!isImageValid(selectedImage)) {
        console.warn('Cannot reset image: Image is no longer valid');
        return;
      }
      
      // Save the current outline for later restoration
      const originalOutline = selectedImage.style.outline;
      
      // Reset all styling properties safely
      const propertiesToRemove = ['width', 'height', 'max-width', 'max-height', 'object-fit'];
      propertiesToRemove.forEach(prop => {
        try {
          selectedImage.style.removeProperty(prop);
        } catch (e) {
          console.warn(`Error removing property ${prop}:`, e);
        }
      });
      
      // Remove all size-related attributes safely
      const attributesToRemove = ['width', 'height', 'data-width', 'data-height', 'data-resized'];
      attributesToRemove.forEach(attr => {
        try {
          selectedImage.removeAttribute(attr);
        } catch (e) {
          console.warn(`Error removing attribute ${attr}:`, e);
        }
      });
      
      // Remove any resize-related classes safely
      try {
        selectedImage.classList.remove('resized-image-saved');
        selectedImage.classList.remove('has-unsaved-resize');
      } catch (e) {
        console.warn('Error removing classes:', e);
      }
      
      // Apply default responsive behavior safely
      safelyApplyStyles(selectedImage, {
        'max-width': '100%',
        'height': 'auto',
        'width': 'auto'
      });
      
      // Force a reflow to ensure the browser recognizes the changes
      void selectedImage.offsetHeight;
      
      // After a brief delay to let the browser compute natural dimensions
      setTimeout(() => {
        if (selectedImage && isImageValid(selectedImage)) {
          // Update the dimensions state with the new natural dimensions
          const { width, height } = safelyGetImageDimensions(selectedImage);
          
          const roundedWidth = Math.round(width);
          const roundedHeight = Math.round(height);
          
          // Update both dimensions and preview dimensions
          setDimensions({
            width: roundedWidth,
            height: roundedHeight
          });
          
          setPreviewDimensions({
            width: roundedWidth,
            height: roundedHeight
          });
          
          // Update the preview overlay to match the reset dimensions
          updatePreviewOverlay(selectedImage, roundedWidth, roundedHeight);
          
          // Update the control panel position
          if (controlsRef.current) {
            updateControlsPosition(controlsRef.current, selectedImage);
          }
        }
      }, 100);
      
      // Mark that we have changes
      setHasChanges(true);
      
      // Visual feedback for the reset
      safelyApplyStyles(selectedImage, {
        'outline': '2px dashed #ff9800'
      });
      
      setTimeout(() => {
        if (selectedImage && isImageValid(selectedImage)) {
          safelyApplyStyles(selectedImage, {
            'outline': originalOutline || ''
          });
        }
      }, 1000);
    } catch (error) {
      console.error('Error when resetting image size:', error);
    }
  }, [selectedImage, updateControlsPosition, updatePreviewOverlay]);

  // Handler for saving image changes - applies the preview dimensions to the actual image
  const saveChanges = useCallback(() => {
    console.log('Save changes called, hasChanges:', hasChanges);
    
    if (!quillRef.current || !hasChanges) {
      console.log('No changes to save or no quill ref');
      return;
    }
    
    if (!selectedImage || !isImageValid(selectedImage)) {
      console.log('Selected image is no longer valid, attempting to recover');
      // We'll try to find the image in the editor below
    }
    
    try {
      const quill = quillRef.current.getEditor();
      
      // Use the preview dimensions that we've been tracking
      const currentWidth = previewDimensions.width || dimensions.width;
      const currentHeight = previewDimensions.height || dimensions.height;
      
      // Make sure we have valid dimensions
      if (!currentWidth || !currentHeight) {
        console.warn('Invalid dimensions, aborting save');
        return;
      }
      
      console.log('Saving dimensions:', currentWidth, currentHeight);
      
      // Get image source for identification
      let imgSrc = '';
      let currentSelectedImage: HTMLImageElement | null = selectedImage;
      
      // If the selected image is no longer valid, try to find it in the editor
      if (!selectedImage || !isImageValid(selectedImage)) {
        // We need to find the image in the editor
        const images = quillRef.current.getEditor().root.querySelectorAll('img.has-unsaved-resize');
        if (images.length > 0) {
          currentSelectedImage = images[0] as HTMLImageElement;
          setSelectedImage(currentSelectedImage); // Update our reference
          console.log('Recovered image reference');
        } else {
          console.warn('Could not find image to save');
          return;
        }
      }
      
      // At this point currentSelectedImage should be valid, but let's double-check
      if (!currentSelectedImage || !isImageValid(currentSelectedImage)) {
        console.warn('Invalid image reference even after recovery attempt');
        return;
      }
      
      imgSrc = currentSelectedImage.getAttribute('src') || '';
      if (!imgSrc) {
        console.warn('No image source found, aborting save');
        return;
      }
      
      // Create a function to safely update image attributes & style
      const updateImageSize = (img: HTMLImageElement) => {
        if (!isImageValid(img)) return;
        
        console.log('Persisting image dimensions:', currentWidth, currentHeight);
        
        // Use our dedicated helper to ensure consistent application of size
        persistImageSize(img, currentWidth, currentHeight);
        
        // Force a browser repaint to ensure the changes are applied
        void img.offsetHeight;
      };
      
      // NOW we update the selected image with the preview dimensions
      // At this point currentSelectedImage is guaranteed to be non-null because of our checks
      updateImageSize(currentSelectedImage as HTMLImageElement);
      safelyApplyStyles(currentSelectedImage, {
        'max-height': 'none !important',
        'display': 'block'
      });
      
      // Update React-friendly way
      currentSelectedImage.classList.remove('has-unsaved-resize');
      currentSelectedImage.classList.add('resized-image-saved');
        
      // Force Quill to register our changes by directly updating the HTML
      setTimeout(() => {
        if (quillRef.current) {
          try {
            console.log('Starting save process with dimensions:', currentWidth, currentHeight);
            
            // Use Quill's delta API
            const quill = quillRef.current.getEditor();
            
            // First, identify the image in the document
            const imageIndex = findImageInQuillContent(quill, imgSrc);
            
            if (imageIndex !== -1) {
              // Store the current selection
              const range = quill.getSelection();
              
              // Create a Delta to update just the image attributes
              const delta = new Delta();
              delta.retain(imageIndex);
              delta.retain(1, { 
                attributes: { 
                  width: currentWidth.toString(),
                  height: currentHeight.toString()
                } 
              });
              
              // Apply the delta
              console.log('Applying delta to update image at index', imageIndex);
              quill.updateContents(delta, 'api');
              
              // Force the browser to redraw
              void document.body.offsetHeight;
              
              // Restore selection if it existed
              if (range) {
                quill.setSelection(range);
              }
              
              console.log('✅ Updated image via Quill delta');
            } else {
              // Fallback to innerHTML approach if Delta fails
              console.log('Fallback to innerHTML approach');
              const html = quillRef.current.getEditor().root.innerHTML;
              quillRef.current.getEditor().root.innerHTML = html;
            }
            
            // Re-select the image to maintain the active state
            setTimeout(() => {
              const images = quillRef.current.getEditor().root.querySelectorAll(`img[src="${imgSrc}"]`);
              if (images.length > 0) {
                const updatedImage = images[0] as HTMLImageElement;
                // Apply current dimensions again to ensure they're properly set
                updateImageSize(updatedImage);
                setSelectedImage(updatedImage);
                
                // Re-apply the resize properties to ensure they stick
                safelyApplyStyles(updatedImage, {
                  'width': `${currentWidth}px !important`,
                  'height': `${currentHeight}px !important`,
                  'max-width': 'none !important',
                  'max-height': 'none !important'
                });
              }
            }, 50);
          } catch (error) {
            console.error('Error during save process:', error);
            // Fallback to a simpler approach
            const html = quillRef.current.getEditor().root.innerHTML;
            quillRef.current.getEditor().root.innerHTML = html;
          }
        }
      }, 10);
      
      // Trigger parent onChange handler with a larger delay to ensure DOM updates first
      setTimeout(() => {
        if (!quillRef.current) return;
        
        try {
          // Force update all images with data-resized attribute
          const images = quillRef.current.getEditor().root.querySelectorAll('img[data-resized="true"]');
          images.forEach((img: HTMLImageElement) => {
            const width = img.getAttribute('data-width');
            const height = img.getAttribute('data-height');
            if (width && height) {
              persistImageSize(img, parseInt(width), parseInt(height));
            }
          });
          
          // Get the final HTML after all our changes
          const finalHTML = quillRef.current.getEditor().root.innerHTML;
          
          if (quillRef.current.props?.onChange) {
            quillRef.current.props.onChange(finalHTML);
            console.log('⚡ Triggered onChange via React props with final HTML');
          }
        } catch (error) {
          console.error('Error in final onChange trigger:', error);
        }
      }, 200);
      
      // Update our dimensions state with the applied dimensions
      setDimensions({
        width: currentWidth,
        height: currentHeight
      });
      
      // Clear the preview overlay
      clearPreviewOverlay();
      setHasChanges(false);
      setShowPreview(false);
      
      console.log('✅ Image size saved with HTML attributes:',` width="${currentWidth}" height="${currentHeight}"`);
      
      // Show visual feedback
      if (currentSelectedImage && isImageValid(currentSelectedImage)) {
        // Store current outline for later restoration
        const originalOutline = currentSelectedImage.style.outline;
        
        // Apply success highlight
        safelyApplyStyles(currentSelectedImage, {
          'outline': '3px solid #28a745'
        });
        
        // Capture source to find the image later if needed
        const savedImgSrc = imgSrc;
        
        setTimeout(() => {
          // Get a fresh reference to the image if needed
          let imageToUpdate = currentSelectedImage;
          
          if (!imageToUpdate || !isImageValid(imageToUpdate)) {
            // Try to find the image by src
            if (quillRef.current && savedImgSrc) {
              const images = quillRef.current.getEditor().root.querySelectorAll(`img[src="${savedImgSrc}"]`);
              if (images && images.length > 0) {
                imageToUpdate = images[0] as HTMLImageElement;
                // Update our reference if it's valid
                if (isImageValid(imageToUpdate)) {
                  setSelectedImage(imageToUpdate);
                }
              }
            }
          }
          
          // Reset outline if we have a valid image reference
          if (imageToUpdate && isImageValid(imageToUpdate)) {
            safelyApplyStyles(imageToUpdate, {
              'outline': originalOutline || ''
            });
          }
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error saving image resize changes:', error);
      
      // Fallback approach for error cases
      try {
        if (isImageValid(selectedImage)) {
          const { width, height } = safelyGetImageDimensions(selectedImage);
          
          safelyApplyAttributes(selectedImage, {
            'width': width.toString(),
            'height': height.toString(),
            'data-width': width.toString(),
            'data-height': height.toString(),
            'data-resized': 'true'
          });
          
          safelyApplyStyles(selectedImage, {
            'width': `${width}px`,
            'height': `${height}px`,
            'max-width': 'none',
            'max-height': 'none'
          });
          
          console.log('Applied fallback save with dimensions:', width, height);
          setHasChanges(false);
          clearPreviewOverlay();
        }
      } catch (fallbackError) {
        console.error('Even fallback save failed:', fallbackError);
      }
    }
  }, [quillRef, hasChanges, selectedImage, dimensions, previewDimensions, clearPreviewOverlay]);
  
  // Don't return null - instead render a hidden component to avoid unmounting/remounting issues
  const isVisible = Boolean(showControls && selectedImage);
  
  // Get dimensions to display
  const displayWidth = previewDimensions.width || dimensions.width || 0;
  const displayHeight = previewDimensions.height || dimensions.height || 0;
    
  // Render resize controls - always render but conditionally show/hide
  return (
    <div 
      ref={controlsRef}
      className={`resize-controls ${document.body.classList.contains('resizing-active') ? 'active' : ''}`}
      style={{
        position: 'fixed',
        top: '100px', // Default position, will be updated by updateControlsPosition
        left: '100px', // Default position, will be updated by updateControlsPosition
        zIndex: 9999,
        display: isVisible ? 'block' : 'none',
        visibility: isVisible ? 'visible' : 'hidden',
        opacity: isVisible ? '1' : '0',
        pointerEvents: isVisible ? 'all' : 'none',
        background: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      <div className="flex flex-col gap-2 text-sm">
        {/* Dimensions display - more prominent with better styling */}        
        <div className="dimensions-display">
          <span>{displayWidth} × {displayHeight}</span>
          {hasChanges ? (
            <span className="text-orange-500 text-xs font-medium ml-2">
              ● Unsaved
            </span>
          ) : null}
        </div>
          
        {/* Resize controls */}
        <div className="flex gap-1 flex-wrap justify-between">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              document.body.classList.add('resizing-active');
              if (controlsRef.current) controlsRef.current.classList.add('active');
              if (selectedImage) handleResize('width', -10);
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            title="Decrease width"
            type="button"
          >
            W-
          </button>
          <button              
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              document.body.classList.add('resizing-active');
              if (controlsRef.current) controlsRef.current.classList.add('active');
              if (selectedImage) handleResize('width', 10);
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            title="Increase width"
            type="button"
          >
            W+
          </button>
          <button            
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              document.body.classList.add('resizing-active');
              if (controlsRef.current) controlsRef.current.classList.add('active');
              if (selectedImage) handleResize('height', -10);
            }}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            title="Decrease height"
            type="button"
          >
            H-
          </button>
          <button            
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              document.body.classList.add('resizing-active');
              if (controlsRef.current) controlsRef.current.classList.add('active');
              if (selectedImage) handleResize('height', 10);
            }}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            title="Increase height"
            type="button"
          >
            H+
          </button>
          <button            
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              document.body.classList.add('resizing-active');
              if (controlsRef.current) controlsRef.current.classList.add('active');
              if (selectedImage) resetSize();
              setTimeout(() => {
                document.body.classList.remove('resizing-active');
              }, 150);
            }}
            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
            title="Reset size"
            type="button"
          >
            Reset
          </button>
        </div>
        
        {/* Save button row - separated for emphasis */}
        <div className="flex justify-end mt-2">
          <button            
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              document.body.classList.add('resizing-active');
              if (controlsRef.current) controlsRef.current.classList.add('active');
              
              try {
                if (hasChanges && selectedImage) {
                  // Save the current dimensions from state to ensure correct saving
                  saveChanges();
                }
              } catch (error) {
                console.error('Failed to save image changes:', error);
              }
              
              setTimeout(() => {
                document.body.classList.remove('resizing-active');
              }, 300);
            }}
            className={`px-4 py-1 rounded text-xs font-medium transition-colors ${
              hasChanges 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                : 'bg-gray-300 text-gray-600 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300'
            }`}
            title={hasChanges ? "Save changes" : "No changes to save"}
            type="button"
            disabled={!hasChanges}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleImageResize;
