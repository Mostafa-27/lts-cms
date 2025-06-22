// Environment configuration utilities
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://linktalentsupport.com/lts-backend/api',
  MEDIA_BASE_URL: import.meta.env.VITE_MEDIA_BASE_URL || 'https://linktalentsupport.com/lts-backend/',
} as const;

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, remove it to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${ENV.MEDIA_BASE_URL}/${cleanPath}`;
};

// Helper function to extract relative path from full URL
export const getRelativeImagePath = (fullUrl: string): string => {
  if (!fullUrl) return '';
  
  // If it's already a relative path, return as is
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    return fullUrl;
  }
  
  // Extract the path after the media base URL
  if (fullUrl.startsWith(ENV.MEDIA_BASE_URL)) {
      return fullUrl.replace(`${ENV.MEDIA_BASE_URL}`, '');
    }
    // console.log('Full URL:', fullUrl.replace(`${ENV.MEDIA_BASE_URL}`, ''));
  
  return fullUrl;
};
