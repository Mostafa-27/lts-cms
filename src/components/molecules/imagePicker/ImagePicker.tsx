import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageEditor } from '@/components/molecules/imageEditor';
import { Image, Upload, X } from 'lucide-react';
import { getImageUrl, getRelativeImagePath } from '@/utils/env';


interface ImageData {
  imageUrl: string;
  imageAlt: string;
}

interface Props {
  id?: string;
  label?: string;
  value?: ImageData | string;
  onImageChange?: (value: ImageData) => void;
  className?: string;
}

const ImagePicker: React.FC<Props> = ({ 
  id, 
  label, 
  value, 
  onImageChange,
  className = '' 
})=> {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [directUploadMode, setDirectUploadMode] = useState(false);
  const handleDirectFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onImageChange && event.target.files && event.target.files[0]) {
      // For simplicity, let's assume we handle the upload elsewhere
      // and onImageChange expects a URL or a base64 string.
      // Here, we'll just use the file name as a placeholder.
      onImageChange({
        imageUrl: event.target.files[0].name,
        imageAlt: event.target.files[0].name // Default alt to filename
      });
    } else if (onImageChange) {
      onImageChange({
        imageUrl: '',
        imageAlt: ''
      });
    }
  };

  const handleOpenGallery = () => {
    setIsDialogOpen(true);
  };   const handleImageSelected = (imageUrl: string, imageAlt?: string) => {
    console.log('Selected Image:', imageUrl, imageAlt);
    if (onImageChange) {
      // Store only the relative path, not the full URL
      const relativePath = getRelativeImagePath(imageUrl);
      onImageChange({
        imageUrl: relativePath,
        imageAlt: imageAlt || ''
      });
    }
    setIsDialogOpen(false);
  };
  const handleClearImage = () => {
    if (onImageChange) {
      onImageChange({
        imageUrl: '',
        imageAlt: ''
      });
    }
  };
  return (
    <div className={`${className}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}        {(value && ((typeof value === 'string' && value) || (typeof value === 'object' && value.imageUrl))) ? (
        // Show the currently selected image
        <div className="mt-1">          <div className="relative border rounded-md overflow-hidden w-32 h-24 bg-gray-100 dark:bg-gray-700 mb-3">      
            <img 
              src={getImageUrl(typeof value === 'object' ? value?.imageUrl || '' : (value || ''))} 
              className="w-full h-full object-cover"
            />          
          </div>
          <div className="space-y-2">            
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={typeof value === 'string' ? value : (value?.imageUrl || '')}>
              {typeof value === 'string' ? value.split('-')[1] : (value?.imageUrl.split('-')[1] || '')}
            </p>
            {typeof value !== 'string' && value?.imageAlt && (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate" title={value.imageAlt}>
                Alt: {value.imageAlt}
              </p>
            )}
            <div className="flex space-x-2">
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={handleOpenGallery}
              >
                <Image className="h-4 w-4 mr-2" />
                Change
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                onClick={handleClearImage} 
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // No image selected yet, show options to select one
        <div className="mt-1 space-y-2">
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleOpenGallery}
              className="flex-1"
            >
              <Image className="h-4 w-4 mr-2" />
              Select from Gallery
            </Button>
            
             
          </div>
          
           
        </div>
      )}
        <ImageEditor
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onImageSelected={handleImageSelected}
        title="Select an image from gallery"
      />
    </div>
  );
};

export default ImagePicker;
