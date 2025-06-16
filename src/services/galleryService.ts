import axios from 'axios';
import { BrowserStorage } from '@/utils/browserStorage';
import { TOKEN_COOKIE_KEY } from '@/utils/constants';
import { ENV } from '@/utils/env';

const API_URL = ENV.API_BASE_URL;

// Types for gallery responses
export interface GalleryImage {
  id: number;
  filename: string;
  url: string;
  alt: string;
  size?: number;
  mime_type?: string;
}

export interface GalleryFolder {
  name: string;
  hasImages?: boolean;
  images?: GalleryImage[];
}

// Function to fetch all galleries and their contents
export const fetchAllGalleries = async (): Promise<GalleryFolder[]> => {
  try {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const response = await axios.get(`${API_URL}/galleries/all`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
};

// Function to fetch contents of a specific gallery folder
export const fetchGalleryContents = async (folderName: string): Promise<GalleryImage[]> => {
  try {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const response = await axios.get(`${API_URL}/galleries/all/${folderName}`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching contents of gallery '${folderName}':`, error);
    throw error;
  }
};

// Function to create a new gallery folder
export const createGalleryFolder = async (galleryName: string): Promise<{ message: string; galleryName: string }> => {
  try {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const response = await axios.post(
      `${API_URL}/galleries`,
      { galleryName },
      {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating gallery folder:', error);
    throw error;
  }
};

// Function to upload an image to a gallery folder
export const uploadImage = async (
  galleryName: string | null,
  imageFile: File,
  alt: string
): Promise<{ message: string; image: GalleryImage }> => {
  try {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('alt', alt);

    // Determine the endpoint based on whether a gallery name is provided
    const endpoint = galleryName
      ? `${API_URL}/galleries/${galleryName}/images`
      : `${API_URL}/galleries/{galleryName}/images`;

    const response = await axios.post(endpoint, formData, {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Function to delete a gallery folder
export const deleteGalleryFolder = async (folderName: string): Promise<{ message: string }> => {
  try {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const response = await axios.delete(`${API_URL}/galleries/${folderName}`, {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting gallery folder '${folderName}':`, error);
    throw error;
  }
};

// Function to delete an image
export const deleteImage = async (imageId: number): Promise<{ message: string }> => {
  try {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const response = await axios.delete(`${API_URL}/galleries/images/${imageId}`, {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting image with ID ${imageId}:`, error);
    throw error;
  }
};

// Function to update image alt text
export const updateImageAlt = async (imageId: number, alt: string): Promise<GalleryImage> => {
  try {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const response = await axios.put(
      `${API_URL}/galleries/images/${imageId}/alt`,
      { alt },
      {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating alt text for image with ID ${imageId}:`, error);
    throw error;
  }
};
