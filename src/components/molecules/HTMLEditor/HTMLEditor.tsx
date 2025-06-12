import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-dark-theme.css';
import './image-resize.css'; // Import custom image resize styles
import './resize-controls.css'; // Import resize controls styles
import './image-resize-handles.css'; // Import resize handles styles
import { ImagePickerDialog } from '../imagePickerDialog';
import SimpleImageResize from './SimpleImageResize';
import ResizableImageBlot from './ResizableImageBlot';

// Register the custom image blot with Quill
Quill.register('formats/resizable-image', ResizableImageBlot);

interface Props {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

const HTMLEditor: React.FC<Props> = ({ value = '', onChange, id }) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState(value);
  const quillRef = useRef<ReactQuill>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  // Sync external value changes with proper dependency handling
  useEffect(() => {
    if (value !== editorContent) {
      setEditorContent(value);
    }
  }, [value]);
  
  // Function to ensure resized images maintain their dimensions
  const ensureImageDimensions = useCallback(() => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor().root;
    const images = editor.querySelectorAll('img');
    
    images.forEach((img: HTMLImageElement) => {
      // Check for width/height attributes or data-width/data-height attributes
      const width = img.getAttribute('width') || img.getAttribute('data-width');
      const height = img.getAttribute('height') || img.getAttribute('data-height');
      
      if (width && height) {
        // Force the dimensions using !important to override Quill's styles
        img.style.setProperty('width', `${width}px`, 'important');
        img.style.setProperty('height', `${height}px`, 'important');
        img.style.setProperty('max-width', 'none', 'important');
        img.style.setProperty('max-height', 'none', 'important');
        
        // Mark as resized for our CSS selectors to target
        if (!img.hasAttribute('data-resized')) {
          img.setAttribute('data-resized', 'true');
        }
        if (!img.hasAttribute('data-width')) {
          img.setAttribute('data-width', width);
        }
        if (!img.hasAttribute('data-height')) {
          img.setAttribute('data-height', height);
        }
      }
    });
  }, []);
  
  // Run the dimension enforcement on mount and after any changes
  useEffect(() => {
    ensureImageDimensions();
    
    // Set up a MutationObserver to watch for any changes to images
    if (!quillRef.current) return;
    
    const observer = new MutationObserver(() => {
      setTimeout(ensureImageDimensions, 50);
    });
    
    observer.observe(quillRef.current.getEditor().root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'width', 'height']
    });
    
    return () => {
      observer.disconnect();
    };
  }, [ensureImageDimensions]);
  
  // Handle resize observer for better editor resizing experience
  useEffect(() => {
    if (!editorContainerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      // Trigger a window resize event to help Quill adjust its layout
      window.dispatchEvent(new Event('resize'));
    });
    
    resizeObserver.observe(editorContainerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  // Restore image dimensions after content changes
  useEffect(() => {
    if (!quillRef.current) return;
    
    const restoreImageDimensions = () => {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;
      
      const images = quill.root.querySelectorAll('img[data-resized="true"]');
      
      images.forEach((element: Element) => {
        const img = element as HTMLImageElement;
        const savedWidth = img.getAttribute('data-width') || img.getAttribute('width');
        const savedHeight = img.getAttribute('data-height') || img.getAttribute('height');
        
        if (savedWidth && savedHeight) {
          console.log(`Restoring image dimensions: ${savedWidth}x${savedHeight}`);
          img.style.width = `${savedWidth}px`;
          img.style.height = `${savedHeight}px`;
          img.style.maxWidth = 'none';
          img.style.maxHeight = 'none';
        }
      });
    };
    
    // Restore dimensions after a short delay to ensure DOM is ready
    setTimeout(restoreImageDimensions, 100);
  }, [editorContent]);  // Optimized content change handler with proper cleanup
  const handleChange = useCallback((content: string) => {
    // Enhanced image URL fixing with better regex and preserve dimensions
    console.log('Handling content change:', content);
    const fixedContent = content.replace(
      /<img([^>]*)src="([^"]+)"([^>]*)>/g, 
      (match, before, src, after) => {
        // Start with the original match
        let result = match;
        
        // Add data-src attribute if missing
        if (!match.includes('data-src') && src) {
          result = `<img${before}src="${src}"${after} data-src="${src}">`;
        }
        
        // Extract width/height/data-resize attributes from the image tag
        const widthMatch = match.match(/width="(\d+)"/);
        const heightMatch = match.match(/height="(\d+)"/);
        const dataResizedMatch = match.match(/data-resized="true"/);
        const dataWidthMatch = match.match(/data-width="(\d+)"/);
        const dataHeightMatch = match.match(/data-height="(\d+)"/);
        
        // If this is a resized image, ensure all necessary attributes are preserved
        if (widthMatch || heightMatch || dataResizedMatch || dataWidthMatch || dataHeightMatch) {
          // Get the dimensions (using any available source)
          const width = widthMatch?.[1] || dataWidthMatch?.[1];
          const height = heightMatch?.[1] || dataHeightMatch?.[1];
          
          // Only log if we have dimensions to preserve
          if (width && height) {
            console.log('Preserving image dimensions:', { width, height });
          }
          
          // Don't need to modify the tag if it already has the attributes we need
          return result;
        }
        
        return result;
      }
    );
    
    setEditorContent(fixedContent);
    onChange(fixedContent);
  }, [onChange]);
  // Enhanced image selection handler with error handling
  const handleImageSelected = useCallback((image: { url: string; alt?: string; filename?: string }) => {
    if (!quillRef.current) {
      console.warn('Quill editor reference not available');
      return;
    }
    
    try {
      const quill = quillRef.current.getEditor();
      
      // Get current selection with fallback
      const range = quill.getSelection(true);
      const position = range?.index ?? quill.getLength();

      // Enhanced URL validation and construction
      let imageUrl = image.url;
      if (imageUrl && !/^(https?:\/\/|data:)/.test(imageUrl)) {
        // Handle relative URLs more robustly
        imageUrl = imageUrl.startsWith('/') 
          ? `https://dist-ten-gold.vercel.app${imageUrl}` 
          : `https://dist-ten-gold.vercel.app/${imageUrl}`;
      }

      // Insert image with error handling
      if (imageUrl) {
        // Use our custom resizable-image blot instead of the standard 'image' format
        quill.insertEmbed(position, 'resizable-image', {
          src: imageUrl,
          alt: image.alt || image.filename || ''
        });
        
        // Position cursor after image and focus
        quill.setSelection(position + 1, 0);
        quill.focus();
        
        console.log('Image inserted with custom blot:', imageUrl);
      }
    } catch (error) {
      console.error('Error inserting image:', error);
    } finally {
      setIsImageDialogOpen(false);
    }
  }, []);

  // Image picker handler with loading state consideration
  const handleOpenImagePicker = useCallback(() => {
    setIsImageDialogOpen(true);
  }, []);  // Memoized modules configuration for performance
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: handleOpenImagePicker
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), [handleOpenImagePicker]);
  // Memoized formats array
  const formats = useMemo(() => [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'resizable-image', 'video'
  ], []);
  return (
    <div className="w-full relative"> {/* Added relative positioning to the parent container */}
      {/* Enhanced container with vertical resize capability */}
      <div 
        ref={editorContainerRef}
        className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
        style={{ 
          resize: 'vertical', 
          overflow: 'hidden',
          minHeight: '300px',
          maxHeight: '800px',
          position: 'relative' /* Ensure relative positioning for absolute children */
        }}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={editorContent}
          onChange={handleChange}
          id={id}
          modules={modules}
          formats={formats}
          preserveWhitespace={true}
          className="h-full dark:text-gray-100"
          style={{ 
            height: 'calc(100% - 2px)',
            display: 'flex',
            flexDirection: 'column'
          }}        />      </div>

      {/* Simple Image Resize Component - inside the relative container */}
      <SimpleImageResize quillRef={quillRef} />

      {/* Image picker dialog with proper z-index */}
      <ImagePickerDialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onImageSelected={handleImageSelected}
        title="Select an image to insert"
      />
    </div>
  );
};

export default HTMLEditor;
