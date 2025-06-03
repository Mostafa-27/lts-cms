export interface Language {
  id: number;
  name: string;
  created_at?: string; // Optional as it's not used in the components
  updated_at?: string; // Optional as it's not used in the components
}

export const fetchLanguages = async (): Promise<{ languages: Language[]; defaultLangId: number | null }> => {
  try {
    const response = await fetch('https://dist-ten-gold.vercel.app/api/languages');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.success && data.data.length > 0) {
      return { languages: data.data, defaultLangId: data.data[0].id };
    } else {
      console.warn('No languages found or data format incorrect:', data);
      return { languages: [], defaultLangId: null };
    }
  } catch (error) {
    console.error('Failed to fetch languages:', error);
    return { languages: [], defaultLangId: null }; // Return empty array and null ID on error
  }
};
