import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GalleryViewer } from '@/components/organism/galleries';
import type { GalleryImage } from '@/services/galleryService';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (imageUrl: string, imageAlt?: string) => void;
  title?: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  isOpen,
  onClose,
  onImageSelected,
  title = 'Select an image',
}) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const handleSelectImage = (image: GalleryImage) => {
    setSelectedImage(image);
  };
  const handleConfirm = () => {
    if (selectedImage) {
      onImageSelected(selectedImage.url, selectedImage.alt);
      onClose();
      // Reset the selection after dialog is closed
      setTimeout(() => setSelectedImage(null), 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <GalleryViewer 
            onSelectImage={handleSelectImage}
            isSelectionMode={true} 
          />
        </div>
        
        <DialogFooter className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="text-sm">
            {selectedImage ? (
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 border rounded overflow-hidden">
                  <img 
                    src={selectedImage.url} 
                    alt={selectedImage.alt} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium truncate max-w-[200px]">{selectedImage.filename}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{selectedImage.alt || 'No alt text'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No image selected</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedImage}
            >
              Select Image
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditor;
