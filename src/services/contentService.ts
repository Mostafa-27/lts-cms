import { BrowserStorage } from "@/utils/browserStorage";
import { TOKEN_COOKIE_KEY } from "@/utils/constants";

const API_BASE_URL = 'https://dist-ten-gold.vercel.app/api';

interface SectionContent {
  // Define a more specific type if possible, based on the JSON structure
  [key: string]: any; 
}

interface Language {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches content for a specific section and language.
 * @param sectionId The ID of the section (maps to a specific part of the page, e.g., hero, aboutUs).
 * @param langId The ID of the language.
 * @returns The content object for the section.
 */
export const fetchContent = async (sectionId: number, langId: number): Promise<SectionContent | null> => {
  try {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const headers: HeadersInit = {
      'accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/content/${sectionId}/${langId}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && result.data) {
      return result.data; // Assuming the actual page content is in result.data.content
    }
    console.warn('Fetch content was not successful or data is missing:', result);
    return null;
  } catch (error) {
    console.error('Error fetching section content:', error);
    throw error;
  }
};

/**
 * Fetches all available languages.
 * @returns A list of language objects.
 */
export const fetchLanguages = async (): Promise<Language[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/languages`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    console.warn('Fetch languages was not successful or data is not an array:', result);
    return []; // Return empty array on failure or unexpected format
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};

/**
 * Updates content for a specific section and language using the aggregated endpoint.
 * @param sectionId The ID of the section (used in the path, but the body contains the actual structured content).
 * @param langId The ID of the language.
 * @param content The new content object for the entire page or a major part of it.
 * @returns The updated content data.
 */
export const updateSectionContent = async (sectionId: number, langId: number, content: SectionContent): Promise<any> => {
  try {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const headers: HeadersInit = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(JSON.stringify({ content }))
    const response = await fetch(`${API_BASE_URL}/aggregated/section/${sectionId}/language/${langId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify( { content} ), // The API expects the content to be wrapped in a "content" field
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`);
    }
    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    throw new Error('Update operation did not return success or data.');
  } catch (error) {
    console.error('Error updating section content:', error);
    throw error;
  }
};
