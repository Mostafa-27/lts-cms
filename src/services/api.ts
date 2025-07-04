import { BrowserStorage } from '@/utils/browserStorage';
import { TOKEN_COOKIE_KEY } from '@/utils/constants';
import { ENV } from '@/utils/env';
import axios from 'axios';

const API_URL = ENV.API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      BrowserStorage.deleteLocalStorage(TOKEN_COOKIE_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

// Email settings services
export const emailSettingsService = {
  // Get default CV email
  getDefaultCvEmail: async () => {
    const response = await api.get('/constants/default_cv_email');
    return response.data;
  },
  // Update default CV email
  updateDefaultCvEmail: async (email: string) => {
    const response = await api.put('/constants/default_cv_email', { value: email });
    return response.data;
  },
  // Get default user data (opinion) email
  getDefaultUserDataEmail: async () => {
    const response = await api.get('/constants/default_user_data_email');
    return response.data;
  },
  // Update default user data (opinion) email
  updateDefaultUserDataEmail: async (email: string) => {
    const response = await api.put('/constants/default_user_data_email', { value: email });
    return response.data;
  }
};

// Section services
export const sectionService = {
  getSectionContent: async (sectionId: number, langId: number) => {
    const response = await api.get(`/content/${sectionId}/${langId}`);
    return response.data;
  },
  updateSectionContent: async (sectionId: number, langId: number, content: any) => {
    const response = await api.put(`/aggregated/section/${sectionId}/language/${langId}`, { content });
    return response.data;
  }
};

export default api;