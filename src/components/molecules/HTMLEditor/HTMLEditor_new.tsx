import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-dark-theme.css';
import { ImagePickerDialog } from '../imagePickerDialog';
import SimpleImageResize from './SimpleImageResize';

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

  // Optimized content change handler with proper cleanup
  const handleChange = useCallback((content: string) => {
    // Enhanced image URL fixing with better regex
    const fixedContent = content.replace(
      /<img([^>]*)src="([^"]+)"([^>]*)>/g, 
      (match, before, src, after) => {
        // Preserve existing data-src or add it if missing
        if (!match.includes('data-src') && src) {
          return `<img${before}src="${src}"${after} data-src="${src}">`;
        }
        return match;
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
        quill.insertEmbed(position, 'image', imageUrl);
        
        // Position cursor after image and focus
        quill.setSelection(position + 1, 0);
        quill.focus();
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
  }, []);

  // Memoized modules configuration for performance
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
    'link', 'image', 'video'
  ], []);

  return (
    <div className="w-full">
      {/* Enhanced container with vertical resize capability */}
      <div 
        ref={editorContainerRef}
        className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 relative"
        style={{ 
          resize: 'vertical', 
          overflow: 'hidden',
          minHeight: '300px',
          maxHeight: '800px'
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
          }}
        />
      </div>

      {/* Simple Image Resize Component */}
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
