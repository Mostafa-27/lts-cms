import React, { useState } from "react";
import { GalleryViewer } from "../organism/galleries";
import { Card, CardContent } from "../ui/card";
import type { GalleryImage } from "@/services/galleryService";
import { toast } from "sonner";

const GalleryPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  // console.log("GalleryPage rendered with selectedImage:", selectedImage);
    const handleImageSelected = (image: GalleryImage) => {
    setSelectedImage(image);
    // You could copy the image URL to clipboard or show notification
    navigator.clipboard.writeText(image.url)
      .then(() => {
        toast.success(`Image URL copied to clipboard: ${image.url}`);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
        toast.error('Failed to copy image URL to clipboard');
      });
  };
  return (
    <div className="p-4 w-full dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">Media Gallery</h1>
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <GalleryViewer 
            onSelectImage={handleImageSelected}
            isSelectionMode={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryPage;
