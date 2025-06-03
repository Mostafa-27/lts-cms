import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GalleryViewer } from '@/components/organism/galleries';
import type { GalleryImage } from '@/services/galleryService';
import { CheckCircle } from 'lucide-react';

interface ImagePickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (image: GalleryImage) => void;
  title?: string;
}

const ImagePickerDialog: React.FC<ImagePickerDialogProps> = ({
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
      onImageSelected(selectedImage);
      onClose();
      // Reset the selection after dialog is closed
      setTimeout(() => setSelectedImage(null), 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <GalleryViewer 
            onSelectImage={handleSelectImage}
            isSelectionMode={true} 
          />
        </div>
          <DialogFooter className="mt-4 flex items-center justify-between border-t dark:border-gray-700 pt-4">
          <div className="text-sm">
            {selectedImage ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="dark:text-gray-200">Selected: <strong>{selectedImage.filename}</strong></span>
              </div>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">No image selected yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedImage}
              className={selectedImage ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {selectedImage ? "Use Selected Image" : "Select an Image"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePickerDialog;
