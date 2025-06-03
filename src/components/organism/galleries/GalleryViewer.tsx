import React, { useState, useEffect } from 'react';
import { 
  fetchAllGalleries, 
  fetchGalleryContents, 
  createGalleryFolder, 
  uploadImage, 
  deleteImage,
  updateImageAlt,
  type GalleryFolder,
  type GalleryImage,
  deleteGalleryFolder
 
} from '../../../services/galleryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../hooks/use-confirm-dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter
} from '@/components/ui/sheet';
import { 
  Folder,
  Plus, 
  Upload, 
  ArrowLeft, 
  Trash2,
  RefreshCw,
  Edit,
  Save,
  Copy
} from 'lucide-react';
 
interface GalleryViewerProps {
  onSelectImage?: (image: GalleryImage) => void;
  isSelectionMode?: boolean;
}

const GalleryViewer: React.FC<GalleryViewerProps> = ({ 
  onSelectImage,
  isSelectionMode = false
}) => {
  const [galleries, setGalleries] = useState<GalleryFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentImages, setCurrentImages] = useState<GalleryImage[]>([]);
  
  const [ConfirmDialog, confirmDialog] = useConfirmDialog();
  
  // States for dialogs
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState<boolean>(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState<string>('');
  
  // State for image detail sheet
  const [isImageDetailOpen, setIsImageDetailOpen] = useState<boolean>(false);
  const [detailImage, setDetailImage] = useState<GalleryImage | null>(null);
  const [isEditingAlt, setIsEditingAlt] = useState<boolean>(false);
  const [newAltText, setNewAltText] = useState<string>('');

  // Load all galleries on component mount
  useEffect(() => {
    loadGalleries();
  }, []);

  // When current folder changes, load its contents
  useEffect(() => {
    if (currentFolder) {
      loadFolderContents(currentFolder);
    } else {
      // If we're at the root, extract images from the "galleries" folder
      const rootImages = galleries.find(g => g.name === 'galleries')?.images || [];
      setCurrentImages(rootImages);
    }
  }, [currentFolder, galleries]);

  const loadGalleries = async () => {
    try {
      setLoading(true);
      const data = await fetchAllGalleries();
      setGalleries(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load galleries', error);
      toast?.error('Failed to load galleries');
      setLoading(false);
    }
  };

  const loadFolderContents = async (folderName: string) => {
    try {
      setLoading(true);
      const images = await fetchGalleryContents(folderName);
      setCurrentImages(images);
      setLoading(false);
    } catch (error) {
      console.error(`Failed to load contents of folder ${folderName}`, error);
      toast?.error(`Failed to load folder contents`);
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast?.error('Please enter a folder name');
      return;
    }

    try {
      await createGalleryFolder(newFolderName);
      toast?.success(`Folder "${newFolderName}" created successfully`);
      setNewFolderName('');
      setIsNewFolderDialogOpen(false);
      // Reload galleries to show the new folder
      loadGalleries();
    } catch (error) {
      console.error('Failed to create folder', error);
      toast?.error('Failed to create folder');
    }
  };

  const handleUploadImage = async () => {
    if (!uploadFile) {
      toast?.error('Please select a file');
      return;
    }

    try {
      await uploadImage(currentFolder, uploadFile, uploadAlt || uploadFile.name);
      toast?.success('Image uploaded successfully');
      setUploadFile(null);
      setUploadAlt('');
      setIsUploadDialogOpen(false);
      
      // Reload current contents
      if (currentFolder) {
        loadFolderContents(currentFolder);
      } else {
        loadGalleries();
      }
    } catch (error) {
      console.error('Failed to upload image', error);
      toast?.error('Failed to upload image');
    }
  };
  const handleDeleteImage = async (image: GalleryImage) => {
    const confirmed = await confirmDialog({
      title: "Delete Image",
      description: "Are you sure you want to delete this image? This action cannot be undone.",
      confirmButtonText: "Delete",
      confirmButtonVariant: "destructive"
    });
    
    if (!confirmed) return;
    
    try {
      await deleteImage(image.id);
      toast?.success('Image deleted successfully');
      
      // Reload current contents
      if (currentFolder) {
        loadFolderContents(currentFolder);
      } else {
        loadGalleries();
      }
      
      // Clear selection if the deleted image was selected
      if (selectedImage?.id === image.id) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Failed to delete image', error);
      toast?.error('Failed to delete image');
    }
  };

  const handleSelectImage = (image: GalleryImage) => {
    setSelectedImage(image);
    if (onSelectImage) {
      onSelectImage(image);
    }
  };

  const handleOpenFolder = (folderName: string) => {
    setCurrentFolder(folderName);
  };

  const handleGoBack = () => {
    setCurrentFolder(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadAlt(e.target.files[0].name); // Set default alt text to filename
    }
  };

  // Function to open image detail sheet
  const handleOpenImageDetail = (image: GalleryImage) => {
    setDetailImage(image);
    setNewAltText(image.alt);
    setIsImageDetailOpen(true);
  };

  // Function to handle saving alt text changes
  const handleSaveAlt = async () => {
    if (!detailImage || newAltText === detailImage.alt) return;
    
    try {
      const updatedImage = await updateImageAlt(detailImage.id, newAltText);
      
      // Update the image in the current images list
      setCurrentImages(currentImages.map(img => 
        img.id === updatedImage.id ? { ...img, alt: updatedImage.alt } : img
      ));
      
      // Update the detail image
      setDetailImage(updatedImage);
      setIsEditingAlt(false);
      toast?.success('Alt text updated successfully');
    } catch (error) {
      console.error('Failed to update alt text', error);
      toast?.error('Failed to update alt text');
    }
  };
const handleDeleteFolder = async (folderName: string) => {
    const confirmed = await confirmDialog({
      title: "Delete Folder",
      description: `Are you sure you want to delete the folder "${folderName}"? This will delete all images within the folder and cannot be undone.`,
      confirmButtonText: "Delete",
      confirmButtonVariant: "destructive"
    });

    if (!confirmed) return;

    try {
      await deleteGalleryFolder(folderName);
      toast?.success(`Folder "${folderName}" deleted successfully`);
      
      if (currentFolder === folderName) {
        setCurrentFolder(null); // Go back to root if current folder is deleted
      }
      loadGalleries(); // Reload all galleries to reflect the deletion
    } catch (error) {
      console.error('Failed to delete folder', error);
      toast?.error('Failed to delete folder');
    }
  };  return (
    <div className="flex flex-col h-full dark:bg-gray-900">
      <ConfirmDialog />
      {/* Header with actions */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {currentFolder && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Galleries
            </Button>
          )}
          
          <h2 className="text-xl font-semibold dark:text-gray-100">
            {currentFolder ? `Gallery: ${currentFolder}` : 'All Galleries'}
          </h2>
        </div>
        
        <div className="flex space-x-2">
            {currentFolder && (
            <Button variant="destructive" onClick={() => handleDeleteFolder(currentFolder)}>
              Delete Folder
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => loadGalleries()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => setIsNewFolderDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          
          <Button 
            size="sm"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </div>

      {/* Gallery content */}      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="dark:text-gray-300">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Folders (only shown at root level) */}            {!currentFolder && galleries
              .filter(gallery => gallery.name !== 'galleries') // Filter out the special "galleries" folder
              .map((folder) => (
                <div 
                  key={folder.name}
                  className="border dark:border-gray-700 rounded-md p-3 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center dark:bg-gray-800"
                  onClick={() => handleOpenFolder(folder.name)}
                >
                  <Folder className="h-16 w-16 text-blue-400 dark:text-blue-300" />
                  <p className="mt-2 text-sm font-medium truncate w-full text-center dark:text-gray-200">{folder.name}</p>
                </div>
              ))
            }
              {/* Images */}
            {currentImages.map((image) => (
              <div 
                key={image.id}
                className={`border dark:border-gray-700 rounded-md overflow-hidden hover:shadow-md dark:hover:shadow-gray-800 transition-all relative ${
                  selectedImage?.id === image.id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                }`}
              >
                <div 
                  className="aspect-square relative"
                  onClick={() => isSelectionMode ? handleSelectImage(image) : handleOpenImageDetail(image)}
                >
                  <img 
                    src={image.url} 
                    alt={image.alt} 
                    className="w-full h-full object-cover"
                  />
                  
                  {!isSelectionMode && (
                    <button 
                      className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-300" />
                    </button>
                  )}
                </div>
                
                <div className="p-2 bg-white dark:bg-gray-800">
                  <p className="text-xs truncate dark:text-gray-300" title={image.filename}>
                    {image.filename}
                  </p>
                </div>
              </div>
            ))}
              {!loading && currentImages.length === 0 && !currentFolder && galleries.length === 0 && (
              <div className="col-span-full text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">No galleries or images found</p>
              </div>
            )}
            
            {!loading && currentImages.length === 0 && currentFolder && (
              <div className="col-span-full text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">This gallery is empty</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Gallery Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Image Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>              <p className="mb-2 text-sm font-medium dark:text-gray-200">
                Upload to: {currentFolder ? `${currentFolder}` : 'Root gallery'}
              </p>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                dark:file:bg-violet-900 dark:file:text-violet-300
                hover:file:bg-violet-100 dark:hover:file:bg-violet-800"
              />
            </div>
            <div>
              <Input
                placeholder="Alt text"
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
              />
            </div>            {uploadFile && (
              <div className="mt-2 flex items-center">
                <div className="h-16 w-16 rounded border dark:border-gray-700 overflow-hidden">
                  <img 
                    src={URL.createObjectURL(uploadFile)} 
                    alt="Preview" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium truncate dark:text-gray-200">{uploadFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{Math.round(uploadFile.size / 1024)} KB</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadImage} disabled={!uploadFile}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Detail Sheet */}
      <Sheet open={isImageDetailOpen} onOpenChange={setIsImageDetailOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Image Details</SheetTitle>            <SheetDescription>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage image details and settings.
              </p>
            </SheetDescription>
          </SheetHeader>
            <div className="py-4">
            {detailImage && (
              <div className="space-y-6">                <div className="rounded-lg overflow-hidden border dark:border-gray-700 mb-4">
                  <img 
                    src={detailImage.url} 
                    alt={detailImage.alt} 
                    className="object-contain max-h-[350px] w-full"
                  />
                </div>
                  <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Filename</p>
                    <p className="text-sm text-gray-900 dark:text-gray-200">{detailImage.filename}</p>
                  </div>
                  
                  {/* <div>
                    <p className="text-xs font-medium text-gray-700">Image URL</p>
                    <div className="flex items-center mt-1">
                      <Input 
                        value={detailImage.url}
                        readOnly
                        className="pr-10"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-[-40px]"
                        onClick={() => {
                          navigator.clipboard.writeText(detailImage.url)
                            .then(() => toast?.success('URL copied to clipboard'))
                            .catch(() => toast?.error('Failed to copy URL'));
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div> */}
                    {!isEditingAlt ? (
                     <div className='flex justify-between dark:text-gray-200'>     {detailImage.alt} 
                <Button 
                  variant="default"
                  onClick={() => setIsEditingAlt(true)}
                >
                  <Edit className="h-4 w-4" />
   
                </Button></div>
              ) : (
                  <div>
              
                    {isEditingAlt ? (
                      <div className="flex flex-col space-y-2">
                      
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={newAltText}
                            onChange={(e) => setNewAltText(e.target.value)}
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={handleSaveAlt}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setIsEditingAlt(false);
                              setNewAltText(detailImage.alt); // Reset to original alt text
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900 truncate mt-1" title={detailImage.alt}>
                        {detailImage.alt || <span className="text-gray-400 italic">No alt text</span>}
                      </p>
                    )}
                  </div> )}
                  
                </div>
              </div>
            )}
          </div>
            <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex">              <Button 
                variant="destructive"
                onClick={async () => {
                  if (!detailImage) return;
                  
                  const confirmed = await confirmDialog({
                    title: "Delete Image",
                    description: "Are you sure you want to delete this image? This action cannot be undone.",
                    confirmButtonText: "Delete",
                    confirmButtonVariant: "destructive"
                  });
                  
                  if (confirmed) {
                    handleDeleteImage(detailImage);
                    setIsImageDetailOpen(false);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Image
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsImageDetailOpen(false)}
              >
                Close
              </Button>
              
              
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GalleryViewer;
