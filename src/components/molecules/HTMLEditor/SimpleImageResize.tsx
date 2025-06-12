import React, { useEffect, useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { Delta } from 'quill';
import Quill from 'quill';
import { 
  isImageValid, 
  safelyApplyStyles, 
  safelyApplyAttributes,
  safelyGetImageDimensions,
  persistImageSize
} from './image-safety';
import './image-resize-handles.css';

// Debounce utility for preventing multiple calls 
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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
  
  // New state for mouse-based resizing
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartDimensions, setDragStartDimensions] = useState({ width: 0, height: 0 });
  const [currentHandlePosition, setCurrentHandlePosition] = useState<string | null>(null);
  
  // Refs
  const controlsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  
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
      // Find the editor container
      const editorContainer = imageElement.closest('.ql-editor')?.parentElement?.parentElement?.parentElement;
      
      if (editorContainer) {
        // Position at the top right of the editor container
        controlsElement.style.top = '0';
        controlsElement.style.right = '0';
        controlsElement.style.left = 'auto';
      } else {
        // Fallback to calculated position if editor container not found
        const position = calculateControlsPosition(imageElement);
        controlsElement.style.top = `${position.top}px`;
        controlsElement.style.left = `${position.left}px`;
        controlsElement.style.right = 'auto';
      }
      
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
      const editorContainer = imageElement.closest('.ql-editor')?.parentElement?.parentElement?.parentElement;
      
      if (!previewOverlay) {
        previewOverlay = document.createElement('div');
        previewOverlay.className = 'image-resize-preview';
        // Append to editor container if possible, otherwise fallback to document.body
        if (editorContainer) {
          editorContainer.appendChild(previewOverlay);
        } else {
          document.body.appendChild(previewOverlay);
        }
      }
      
      // Position and size the overlay based on the image
      const rect = imageElement.getBoundingClientRect();
      const editorRect = editorContainer ? editorContainer.getBoundingClientRect() : { top: 0, left: 0 };
      
      // Calculate position relative to editor container
      const top = rect.top - (editorContainer ? editorRect.top : 0);
      const left = rect.left - (editorContainer ? editorRect.left : 0);
      
      // Set overlay styles
      previewOverlay.style.position = 'absolute';
      previewOverlay.style.border = '2px dashed #2196F3';
      previewOverlay.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';  
      previewOverlay.style.pointerEvents = 'none';
      previewOverlay.style.zIndex = '9998';
      previewOverlay.style.top = `${top}px`;
      previewOverlay.style.left = `${left}px`;
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
      // Look for preview overlay in the editor container first, then fall back to document
      const previewOverlays = document.querySelectorAll('.image-resize-preview');
      previewOverlays.forEach(overlay => {
        overlay.remove();
      });
      setShowPreview(false);
    } catch (error) {
      console.error('Error clearing preview overlay:', error);
    }
  }, []);
    // Utility function to close the resize controller
  const closeResizeController = useCallback((keepSelectedImage: boolean = false) => {
    // Remove active classes from body
    document.body.classList.remove('resizing-active');
    
    // Hide the control panel
    if (controlsRef.current) {
      controlsRef.current.classList.remove('active');
      controlsRef.current.style.display = 'none';
      controlsRef.current.style.visibility = 'hidden';
      controlsRef.current.style.opacity = '0';
    }
    
    // Clear any preview overlay
    clearPreviewOverlay();
    
    // Clear resize handles
    document.querySelectorAll('.image-resize-handle').forEach(handle => {
      handle.remove();
    });
    
    // Remove resize wrapper
    const wrapper = document.querySelector('.image-resize-wrapper');
    if (wrapper) {
      wrapper.remove();
    }
    
    // Reset state
    setShowControls(false);
    setHasChanges(false);
    setShowPreview(false);
    setIsDragging(false);
    setCurrentHandlePosition(null);
    
    // Optionally clear selected image reference
    if (!keepSelectedImage) {
      setSelectedImage(null);
    }  }, [clearPreviewOverlay]);

  // Update controls position effect moved below after renderResizeHandles is defined// Clean up any DOM elements on unmount
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
      
      // Clean up resize handles
      try {
        document.querySelectorAll('.image-resize-handle').forEach(handle => {
          handle.remove();
        });
        
        const wrapper = document.querySelector('.image-resize-wrapper');
        if (wrapper) {
          wrapper.remove();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      
      // Clean up any event listeners for resize operations
      try {
        document.removeEventListener('mousemove', handleResizeDragMove);
        document.removeEventListener('mouseup', handleResizeDragEnd);
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
    };  }, []);

  // Define the resize handle positions
  const resizeHandlePositions = useMemo(() => [
    'top-left', 'top', 'top-right',
    'right',             'left', 
    'bottom-left', 'bottom', 'bottom-right'
  ], []);

  // Function to handle the start of a resize drag
  const handleResizeDragStart = useCallback((e: MouseEvent, handlePosition: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedImage || !isImageValid(selectedImage)) return;
    
    console.log('Starting drag for handle:', handlePosition);
    
    // Mark as dragging
    setIsDragging(true);
    setCurrentHandlePosition(handlePosition);
    
    // Mark as resizing active to prevent other events
    document.body.classList.add('resizing-active');
    
    // Save starting position
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    // Save starting dimensions
    const currentWidth = previewDimensions.width || dimensions.width;
    const currentHeight = previewDimensions.height || dimensions.height;
    setDragStartDimensions({ width: currentWidth, height: currentHeight });
    
    // Add dragging class to the handle
    const handle = e.target as HTMLElement;
    handle.classList.add('dragging');
    
    console.log('Drag start setup complete');
  }, [selectedImage, previewDimensions, dimensions]);

  // Function to render resize handles around the selected image
  const renderResizeHandles = useCallback(() => {
    if (!selectedImage || !isImageValid(selectedImage)) return;
    
    // Remove any existing handles first
    document.querySelectorAll('.image-resize-handle').forEach(handle => {
      handle.remove();
    });

    // Get image position and dimensions
    const rect = selectedImage.getBoundingClientRect();
    const editorContainer = selectedImage.closest('.ql-editor')?.parentElement?.parentElement?.parentElement;
    const editorRect = editorContainer ? editorContainer.getBoundingClientRect() : { top: 0, left: 0 };
    
    // Create or get the resize wrapper
    let wrapper = document.querySelector('.image-resize-wrapper') as HTMLDivElement;
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'image-resize-wrapper';
      if (editorContainer) {
        editorContainer.appendChild(wrapper);
      } else {
        document.body.appendChild(wrapper);
      }
    }

    // Position the wrapper around the image
    const top = rect.top - (editorContainer ? editorRect.top : 0);
    const left = rect.left - (editorContainer ? editorRect.left : 0);
    
    wrapper.style.position = 'absolute';
    wrapper.style.top = `${top}px`;
    wrapper.style.left = `${left}px`;
    wrapper.style.width = `${rect.width}px`;
    wrapper.style.height = `${rect.height}px`;
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '9998';

    // Set the reference
    wrapperRef.current = wrapper;
    
    // Create handles
    resizeHandlePositions.forEach(position => {
      const handle = document.createElement('div');
      handle.className = `image-resize-handle ${position}`;
      handle.dataset.position = position;
      handle.style.pointerEvents = 'all'; // Make handles interactive
      
      // Add event listeners for resizing
      handle.addEventListener('mousedown', (e: MouseEvent) => handleResizeDragStart(e, position));
      
      wrapper.appendChild(handle);
    });
  }, [selectedImage, resizeHandlePositions, handleResizeDragStart]);

  // Image click handler - with batched state updates to prevent multiple re-renders
  const handleImageClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      
      const imgElement = target as HTMLImageElement;
      console.log('Image clicked:', imgElement);
      
      // Clear any previous preview first
      clearPreviewOverlay();
      
      // Clean up any existing resize handles
      document.querySelectorAll('.image-resize-handle').forEach(handle => {
        handle.remove();
      });
      
      const wrapper = document.querySelector('.image-resize-wrapper');
      if (wrapper) {
        wrapper.remove();
      }
      
      // Reset drag state
      setIsDragging(false);
      setCurrentHandlePosition(null);
      
      // Update dimensions using our safe utility
      const { width, height } = safelyGetImageDimensions(imgElement);
      
      // Remove selection from other images
      if (quillRef.current) {
        const editor = quillRef.current.getEditor().root;
        editor.querySelectorAll('img').forEach((img: HTMLImageElement) => {
          safelyApplyStyles(img, { 'outline': '' });
          img.classList.remove('selected-for-resize');
        });
      }
      
      // Ensure data attributes are set for consistency
      safelyApplyAttributes(imgElement, {
        'data-width': width.toString(),
        'data-height': height.toString()
      });
        // Highlight selected image and add a CSS class for styling
      safelyApplyStyles(imgElement, { 'outline': '2px solid #007bff' });
      imgElement.classList.add('selected-for-resize');
      
      // Always add stretch class and attribute to images
      imgElement.classList.add('image-stretch');
      imgElement.setAttribute('data-stretch', 'true');
      
      // Apply stretch-specific styles
      safelyApplyStyles(imgElement, {
        'object-fit': 'fill',
        'object-position': 'center'
      });
        // Batch state updates in a single function to avoid multiple re-renders
      // React will batch these updates together in one render cycle
      const updateState = () => {
        setSelectedImage(imgElement);
        setDimensions({ width, height });
        setPreviewDimensions({ width, height });
        setHasChanges(false);
        setShowControls(true);
      };      // Execute the batched state updates
      updateState();
      
      // Use double requestAnimationFrame to ensure DOM updates are complete before rendering handles
      requestAnimationFrame(() => {
        // Additional frame to ensure React state updates are fully applied
        requestAnimationFrame(() => {
          renderResizeHandles();
        });
      });
    }
  }, [quillRef, clearPreviewOverlay]);
  // Outside click handler - improved to better detect outside clicks
  const handleClickOutside = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    
    // If we're in resizing active mode, don't close the panel
    if (document.body.classList.contains('resizing-active')) {
      console.log('Skipping outside click during active resize operation');
      return;
    }
    
    // Make sure this is actually a click outside, not a click caught during event bubbling
    // Check if click was on controls or inside controls
    const clickedOnControls = controlsRef.current && (
      controlsRef.current === target || 
      controlsRef.current.contains(target) || 
      target.closest('.resize-controls') !== null
    );
    
    // Check if we clicked on an image
    const clickedOnImage = target.tagName === 'IMG' || target.closest('img') !== null;
      // Check if we clicked on editor buttons
    const clickedOnEditorButton = target.closest('.ql-editor button') !== null;
    
    // If click is outside of all relevant elements, close the panel
    if (!clickedOnControls && !clickedOnImage && !clickedOnEditorButton) {
      console.log('Outside click detected, closing panel');
      
      // Prevent closing if we have unsaved changes
      if (hasChanges && selectedImage) {
        console.log('Panel has unsaved changes, consider showing a confirmation dialog');
        // Optionally add a confirmation dialog here if needed
      }
      
      // First remove highlight from images
      if (quillRef.current) {
        const editor = quillRef.current.getEditor().root;
        editor.querySelectorAll('img').forEach((img: HTMLImageElement) => {
          safelyApplyStyles(img, { 'outline': '' });
          img.classList.remove('selected-for-resize');
          img.classList.remove('has-unsaved-resize');
        });
      }
      
      // Clear any preview overlay
      clearPreviewOverlay();
      
      // Clear resize handles
      document.querySelectorAll('.image-resize-handle').forEach(handle => {
        handle.remove();
      });
      
      // Remove resize wrapper
      const wrapper = document.querySelector('.image-resize-wrapper');
      if (wrapper) {
        wrapper.remove();
      }
      
      // Then hide controls and reset state to prevent race conditions
      if (controlsRef.current) {
        controlsRef.current.classList.remove('active');
        controlsRef.current.style.display = 'none';
        controlsRef.current.style.visibility = 'hidden';
        controlsRef.current.style.opacity = '0';
      }
      
      // Ensure resizing-active class is removed from body
      document.body.classList.remove('resizing-active');
      
      // Finally update the state
      setSelectedImage(null);
      setShowControls(false);
      setHasChanges(false);
      setShowPreview(false);
      setIsDragging(false);
      setCurrentHandlePosition(null);
      
      // Reset preview dimensions
      setPreviewDimensions({ width: 0, height: 0 });    }
  }, [quillRef, clearPreviewOverlay, hasChanges, selectedImage]);

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
      // Improved handling of document clicks for more reliable outside click detection
    const handleDocumentClick = (e: MouseEvent) => {
      // If the click originated from inside the controls, don't process it as an outside click
      if (e.target && controlsRef.current && controlsRef.current.contains(e.target as Node)) {
        return;
      }
      
      // Skip handling if we're actively resizing to avoid accidental panel closures
      if (document.body.classList.contains('resizing-active')) {
        return;
      }
      
      // We need a small delay to allow other click handlers to complete first
      // This ensures we have the most up-to-date DOM state
      setTimeout(() => {
        handleClickOutside(e);
      }, 10);
    };
    
    // Use mousedown with capture phase for earlier interception of clicks
    document.addEventListener('mousedown', handleDocumentClick, { capture: true });
    
    // Also add a standard click handler as a backup with capture
    document.addEventListener('click', handleDocumentClick, { capture: true });    return () => {
      editor.removeEventListener('click', handleImageClick);
      document.removeEventListener('mousedown', handleDocumentClick, { capture: true });
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [quillRef, handleImageClick, handleClickOutside]);
  // Define restoreImageDimensions outside of useEffect to avoid invalid hook calls
  const restoreImageDimensions = useCallback(() => {
    // Skip if currently processing or editor not available
    if (!quillRef.current) return;
    
    // Use a closure variable instead of a ref to track processing state
    let isProcessingUpdates = false;
    if (isProcessingUpdates) return;
    
    try {
      isProcessingUpdates = true;
      const quill = quillRef.current.getEditor();
      const editor = quill.root;
      const images = editor.querySelectorAll('img[data-resized="true"]');
      
      // Use Map for caching instead of WeakMap for simplicity
      const processedImagesCache = new Map();
      
      images.forEach((img: HTMLImageElement) => {
        if (!isImageValid(img)) return;
        
        // Skip if this image was recently processed (in the last 500ms)
        const imgId = img.src || img.getAttribute('data-id') || Math.random().toString();
        const lastProcessedTime = processedImagesCache.get(imgId);
        const now = Date.now();
        if (lastProcessedTime && (now - lastProcessedTime) < 500) {
          return;
        }
        
        const savedWidth = img.getAttribute('data-width');
        const savedHeight = img.getAttribute('data-height');
        
        if (savedWidth && savedHeight) {
          const currentWidth = img.offsetWidth;
          const currentHeight = img.offsetHeight;
          
          // Only update if dimensions differ significantly
          if (Math.abs(currentWidth - parseInt(savedWidth)) > 2 || 
              Math.abs(currentHeight - parseInt(savedHeight)) > 2) {
            
            console.log(`Restoring image dimensions: ${savedWidth}x${savedHeight}`);
            // Use our dedicated helper to apply dimensions consistently
            persistImageSize(img, parseInt(savedWidth), parseInt(savedHeight));
            
            // Cache this operation to avoid redundant updates
            processedImagesCache.set(imgId, now);
            
            // Store dimensions as properties for faster access later
            (img as any).__permanentWidth = savedWidth;
            (img as any).__permanentHeight = savedHeight;
            (img as any).__isPermanentlyResized = true;
          }
        }
      });
      
      // Release the processing lock with a small delay
      setTimeout(() => {
        isProcessingUpdates = false;
      }, 50);
    } catch (error) {
      console.error("Error restoring image dimensions:", error);
      isProcessingUpdates = false;
    }
  }, [quillRef]);

  // Image dimension restoration with optimizations to prevent unnecessary updates
  useEffect(() => {
    if (!quillRef.current) return;

    // Initial restore
    restoreImageDimensions();

    // Efficient mutation observer with batch processing
    const debouncedRestore = debounce(restoreImageDimensions, 150);
    
    const observer = new MutationObserver((mutations) => {
      // Only process if we have relevant mutations
      const hasRelevantChanges = mutations.some(mutation => {
        // Check if the target is an image
        const isImage = mutation.target instanceof HTMLImageElement;
        
        // Check if it's an attribute change on style, width, or height
        const isRelevantAttributeChange = 
          mutation.type === 'attributes' && 
          ['style', 'width', 'height', 'data-width', 'data-height'].includes(mutation.attributeName || '');
        
        return isImage && isRelevantAttributeChange;
      });
      
      if (hasRelevantChanges) {
        debouncedRestore();
      }
    });

    observer.observe(quillRef.current.getEditor().root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'width', 'height', 'data-width', 'data-height']
    });

    // More efficient interval with reduced frequency
    const intervalId = setInterval(restoreImageDimensions, 5000);

    // Handle text changes efficiently
    const quill = quillRef.current.getEditor();
    const handleTextChange = debounce(() => {
      restoreImageDimensions();
    }, 200);
    
    quill.on('text-change', handleTextChange);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      quill.off('text-change', handleTextChange);
    };
  }, [quillRef, restoreImageDimensions]);
  
  // Handler for saving image changes - applies the preview dimensions to the actual image
  const saveChanges = useCallback(() => {
    console.log('Save changes called, hasChanges:', hasChanges);
    
    if (!quillRef.current || !hasChanges) {
      console.log('No changes to save or no quill ref');
      return;
    }
    
    // Use a local variable to track state changes
    // This prevents unnecessary re-renders during the save operation
    let shouldUpdateState = false;
    
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
          shouldUpdateState = true; // Mark for state update at the end
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
        
        // Add stretch attribute and class for consistent stretching behavior
        img.setAttribute('data-stretch', 'true');
        img.classList.add('image-stretch');
        
        // Apply stretch-specific styles
        safelyApplyStyles(img, {
          'object-fit': 'fill',
          'object-position': 'center'
        });
        
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
      
      // Clear the preview overlay
      clearPreviewOverlay();
      
      // Update our dimensions state with the applied dimensions
      setDimensions({
        width: currentWidth,
        height: currentHeight
      });
      
      console.log('✅ Image size saved with HTML attributes:', `width="${currentWidth}" height="${currentHeight}"`);
      
      // Show visual feedback
      if (currentSelectedImage && isImageValid(currentSelectedImage)) {
        // Store current outline for later restoration
        const originalOutline = currentSelectedImage.style.outline;
        
        // Apply success highlight
        safelyApplyStyles(currentSelectedImage, {
          'outline': '3px solid #28a745'
        });
        
        setTimeout(() => {
          // Reset outline if we have a valid image reference
          if (currentSelectedImage && isImageValid(currentSelectedImage)) {
            safelyApplyStyles(currentSelectedImage, {
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
          shouldUpdateState = true;
          clearPreviewOverlay();
        }
      } catch (fallbackError) {
        console.error('Even fallback save failed:', fallbackError);      }
    }
    
    // Hide resize handles after saving
    document.querySelectorAll('.image-resize-handle').forEach(handle => {
      handle.remove();
    });
    
    // Remove resize wrapper
    const wrapper = document.querySelector('.image-resize-wrapper');
    if (wrapper) {
      wrapper.remove();
    }
    
    // Apply all state updates at once to prevent multiple re-renders
    if (shouldUpdateState) {
      // Only update the selected image if we have a valid reference to it
      setHasChanges(false);
      setShowPreview(false);
    }
  }, [quillRef, hasChanges, selectedImage, dimensions, previewDimensions, clearPreviewOverlay]);
  
  // Handler for resizing an image - updates dimensions and auto-applies changes
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
    
    // Calculate new dimensions - allow free stretching
    let newWidth: number;
    let newHeight: number;

    if (direction === 'width') {
      newWidth = Math.max(50, currentWidth + delta);
      newHeight = currentHeight; // Keep height unchanged for width adjustments
    } else {
      newHeight = Math.max(30, currentHeight + delta);
      newWidth = currentWidth; // Keep width unchanged for height adjustments
    }
    
    const roundedWidth = Math.round(newWidth);
    const roundedHeight = Math.round(newHeight);
    
    console.log('New dimensions:', { width: roundedWidth, height: roundedHeight });
    
    // Update preview dimensions in state
    setPreviewDimensions({
      width: roundedWidth,
      height: roundedHeight
    });    // Mark that the image has unsaved changes
    selectedImage.classList.add('has-unsaved-resize');
    selectedImage.classList.add('image-stretch');
    selectedImage.setAttribute('data-stretch', 'true');
    
    // Apply stretch-specific styles
    safelyApplyStyles(selectedImage, {
      'object-fit': 'fill',
      'object-position': 'center'
    });
    
    // Show a preview overlay over the image
    updatePreviewOverlay(selectedImage, roundedWidth, roundedHeight);
    setShowPreview(true);
    
    // Mark that we have changes and auto-apply them
    setHasChanges(true);
    console.log('Setting preview dimensions to:', { width: roundedWidth, height: roundedHeight });
      // Auto-apply changes after a short delay to allow for multiple quick button clicks
    setTimeout(() => {
      if (selectedImage && (previewDimensions.width !== 0 || previewDimensions.height !== 0)) {
        console.log('Auto-applying button resize changes');
        saveChanges();
        
        // Hide resize handles after auto-apply
        document.querySelectorAll('.image-resize-handle').forEach(handle => {
          handle.remove();
        });
        
        // Remove resize wrapper
        const wrapper = document.querySelector('.image-resize-wrapper');
        if (wrapper) {
          wrapper.remove();
        }
        
        // Remove resizing-active state
        document.body.classList.remove('resizing-active');
        if (controlsRef.current) controlsRef.current.classList.remove('active');
      }
    }, 300); // 300ms delay to allow for multiple quick clicks
    
    // Update controls position with a slight delay
    setTimeout(() => {
      if (controlsRef.current && selectedImage) {
        updateControlsPosition(controlsRef.current, selectedImage);
      }
    }, 100);
  }, [selectedImage, updateControlsPosition, dimensions, previewDimensions, updatePreviewOverlay, saveChanges]);
  
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
    }  }, [selectedImage, updateControlsPosition, updatePreviewOverlay]);
    // Don't return null - instead render a hidden component to avoid unmounting/remounting issues
  const isVisible = Boolean(showControls && selectedImage);
  // Memoize dimensions to prevent unnecessary re-renders
  const displayDimensions = useMemo(() => {
    return {
      width: previewDimensions.width || dimensions.width || 0,
      height: previewDimensions.height || dimensions.height || 0
    };
  }, [previewDimensions.width, previewDimensions.height, dimensions.width, dimensions.height]);
    // Get dimensions to display
  const displayWidth = displayDimensions.width;
  const displayHeight = displayDimensions.height;

  // Handle drag movement during resize
  const handleResizeDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedImage || !currentHandlePosition) return;

    e.preventDefault();
    
    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;
    
    // Initial width and height
    const startWidth = dragStartDimensions.width;
    const startHeight = dragStartDimensions.height;
    
    // Calculate aspect ratio for corner handles (optional constraint)
    const aspectRatio = startHeight / startWidth;
    
    // New dimensions - allow free stretching for all handles
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    // Calculate new dimensions based on handle position
    switch (currentHandlePosition) {
      case 'top-left':
        newWidth = Math.max(50, startWidth - dx);
        newHeight = Math.max(30, startHeight - dy);
        break;
      case 'top':
        newHeight = Math.max(30, startHeight - dy);
        // Keep width unchanged for top/bottom handles
        break;
      case 'top-right':
        newWidth = Math.max(50, startWidth + dx);
        newHeight = Math.max(30, startHeight - dy);
        break;
      case 'right':
        newWidth = Math.max(50, startWidth + dx);
        // Keep height unchanged for left/right handles
        break;
      case 'bottom-right':
        newWidth = Math.max(50, startWidth + dx);
        newHeight = Math.max(30, startHeight + dy);
        break;
      case 'bottom':
        newHeight = Math.max(30, startHeight + dy);
        // Keep width unchanged for top/bottom handles
        break;
      case 'bottom-left':
        newWidth = Math.max(50, startWidth - dx);
        newHeight = Math.max(30, startHeight + dy);
        break;
      case 'left':
        newWidth = Math.max(50, startWidth - dx);
        // Keep height unchanged for left/right handles
        break;
    }
    
    // Round dimensions
    newWidth = Math.round(newWidth);
    newHeight = Math.round(newHeight);
    
    // Update preview dimensions
    setPreviewDimensions({
      width: newWidth,
      height: newHeight
    });
    
    // Show preview overlay
    updatePreviewOverlay(selectedImage, newWidth, newHeight);
    setShowPreview(true);
    
    // Mark image as having unsaved changes and add stretch class
    selectedImage.classList.add('has-unsaved-resize');
    selectedImage.classList.add('image-stretch');
    
    // Mark that we have changes
    setHasChanges(true);
    
    // Update resize wrapper and handles position immediately
    if (wrapperRef.current) {
      // Get the current image position
      const rect = selectedImage.getBoundingClientRect();
      const editorContainer = selectedImage.closest('.ql-editor')?.parentElement?.parentElement?.parentElement;
      const editorRect = editorContainer ? editorContainer.getBoundingClientRect() : { top: 0, left: 0 };
      
      // Update wrapper position and size to match new dimensions
      const top = rect.top - (editorContainer ? editorRect.top : 0);
      const left = rect.left - (editorContainer ? editorRect.left : 0);
      
      wrapperRef.current.style.top = `${top}px`;
      wrapperRef.current.style.left = `${left}px`;
      wrapperRef.current.style.width = `${newWidth}px`;
      wrapperRef.current.style.height = `${newHeight}px`;
      
      // Force re-render handles to match new wrapper size
      renderResizeHandles();
    }
  }, [isDragging, selectedImage, currentHandlePosition, dragStartPos, dragStartDimensions, updatePreviewOverlay, renderResizeHandles]);  // Handle end of resize drag operation
  const handleResizeDragEnd = useCallback(() => {
    console.log('Ending drag operation');
    
    // Auto-apply the changes immediately on mouse release
    if (hasChanges && selectedImage) {
      console.log('Auto-applying resize changes');
      saveChanges();
    }
    
    // Reset dragging state
    setIsDragging(false);
    setCurrentHandlePosition(null);
    
    // Remove dragging class from all handles
    document.querySelectorAll('.image-resize-handle.dragging').forEach(handle => {
      handle.classList.remove('dragging');
    });
    
    // Hide resize handles after mouse release
    document.querySelectorAll('.image-resize-handle').forEach(handle => {
      handle.remove();
    });
    
    // Remove resize wrapper
    const wrapper = document.querySelector('.image-resize-wrapper');
    if (wrapper) {
      wrapper.remove();
    }
    
    // Remove resizing-active class to allow normal interactions
    setTimeout(() => {
      document.body.classList.remove('resizing-active');
      if (controlsRef.current) controlsRef.current.classList.remove('active');
    }, 100);
    
    // Update controls position with a slight delay
    setTimeout(() => {
      if (controlsRef.current && selectedImage) {
        updateControlsPosition(controlsRef.current, selectedImage);
      }
    }, 150);  }, [selectedImage, updateControlsPosition, hasChanges, saveChanges]);

  // Effect to manage mouse event listeners during drag operations
  useEffect(() => {
    if (isDragging) {
      console.log('Adding global mouse event listeners for drag');
      document.addEventListener('mousemove', handleResizeDragMove);
      document.addEventListener('mouseup', handleResizeDragEnd);
      
      return () => {
        console.log('Cleaning up global mouse event listeners');
        document.removeEventListener('mousemove', handleResizeDragMove);
        document.removeEventListener('mouseup', handleResizeDragEnd);
      };
    }
  }, [isDragging, handleResizeDragMove, handleResizeDragEnd]);

  // Effect to render resize handles when an image is selected
  useEffect(() => {
    if (selectedImage && showControls && !isDragging) {
      renderResizeHandles();
    }
  }, [selectedImage, showControls, renderResizeHandles, isDragging]);
  
  // Render resize controls - always render but conditionally show/hide
  return (
    <div 
      ref={controlsRef}
      className={`resize-controls ${document.body.classList.contains('resizing-active') ? 'active' : ''}`}
      style={{
        position: 'absolute',
        top: '0', // Position at the top
        right: '0', // Position at the right
        zIndex: 9999,
        display: isVisible ? 'block' : 'none',
        visibility: isVisible ? 'visible' : 'hidden',
        opacity: isVisible ? '1' : '0',
        pointerEvents: isVisible ? 'all' : 'none',
        background: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        color: '#333'
      }}
      onMouseDown={(e) => {
        e.stopPropagation(); // Prevent mousedown from triggering outside click
        e.preventDefault();  // Prevent default browser behavior
      }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent click event from bubbling
      }}
    >      <div className="flex flex-col gap-2 text-sm">
        {/* Dimensions display - more prominent with better styling */}          <div className="dimensions-display p-1 border-b border-gray-200 mb-1">
          <span className="font-medium">{displayWidth} × {displayHeight}</span>
          {isDragging ? (
            <span className="text-blue-500 text-xs font-medium ml-2">
              ● Resizing
            </span>
          ) : null}
          <div className="text-xs text-gray-500 mt-1">
            Drag resize handles to stretch freely
          </div>
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
          </button>          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              document.body.classList.add('resizing-active');
              if (controlsRef.current) controlsRef.current.classList.add('active');
              if (selectedImage) resetSize();
              
              // Close resize controller after resetting
              setTimeout(() => {
                closeResizeController(true); // Keep the selected image reference
              }, 150);
            }}
            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
            title="Reset size"
            type="button"
          >            Reset
          </button>
        </div>
          {/* Status message showing auto-apply behavior */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          Changes auto-apply on mouse release
        </div>
      </div>
    </div>
  );
};

export default SimpleImageResize;
