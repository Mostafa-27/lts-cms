import { BrowserStorage } from "@/utils/browserStorage";
import { TOKEN_COOKIE_KEY } from "@/utils/constants";
import { ENV } from "@/utils/env";

const API_BASE_URL = ENV.API_BASE_URL;

export interface Language {
  id: number;
  name: string;
  code: string;
  icon: string;
  active?: boolean;
  added?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLanguageData {
  name: string;
  code: string;
  icon: string;
}

export interface UpdateLanguageData {
  name: string;
  icon: string;
}

export interface LanguageStatusUpdate {
  active?: boolean;
  added?: boolean;
}

const getAuthHeaders = (): HeadersInit => {
  const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
  const headers: HeadersInit = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const languageManagementService = {
  // Get all languages
  getLanguages: async (): Promise<Language[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/languages`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  },

  // Get not-added languages
  getNotAddedLanguages: async (): Promise<Language[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/languages/all/not-added`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching not-added languages:', error);
      throw error;
    }
  },

  // Get added languages
  getAddedLanguages: async (): Promise<Language[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/languages/all/added`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching added languages:', error);
      throw error;
    }
  },

  // Update language added status
  updateLanguageAddedStatus: async (code: string, added: boolean): Promise<Language> => {
    try {
      const response = await fetch(`${API_BASE_URL}/languages/code/${code}/added`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ added }),
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
      console.error('Error updating language added status:', error);
      throw error;
    }
  },

  // Update language active status
  updateLanguageActiveStatus: async (code: string, active: boolean): Promise<Language> => {
    try {
      const response = await fetch(`${API_BASE_URL}/languages/code/${code}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ active }),
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
      console.error('Error updating language active status:', error);
      throw error;
    }
  },

  // Create a new language
  createLanguage: async (languageData: CreateLanguageData): Promise<Language> => {
    try {
      const response = await fetch(`${API_BASE_URL}/languages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(languageData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error('Create operation did not return success or data.');
    } catch (error) {
      console.error('Error creating language:', error);
      throw error;
    }
  },

  // Update an existing language
  updateLanguage: async (code: string, languageData: UpdateLanguageData): Promise<Language> => {
    try {
      const response = await fetch(`${API_BASE_URL}/languages/code/${code}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(languageData),
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
      console.error('Error updating language:', error);
      throw error;
    }
  },

  // Delete a language
  deleteLanguage: async (code: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/languages/code/${code}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Delete operation did not return success.');
      }
    } catch (error) {
      console.error('Error deleting language:', error);
      throw error;
    }
  },
};
// export default languageManagementService;