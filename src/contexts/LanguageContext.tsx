import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fetchLanguages, type Language } from '../services/languageService';

interface SectionLanguageState {
  sectionId: string;
  selectedLangId: number;
  languageName: string;
}

interface LanguageContextType {
  languages: Language[];
  isLoading: boolean;
  // Register a section with its initial language
  registerSection: (sectionId: string, initialLangId?: number) => void;
  // Update a section's language (only affects that section)
  updateSectionLanguage: (sectionId: string, langId: number) => void;
  // Get a specific section's language state
  getSectionLanguage: (sectionId: string) => SectionLanguageState | null;
  // Get active language name for a specific section (for preview URL)
  getActiveLanguageName: (sectionId?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Hook for individual sections to manage their own language state
export const useSectionLanguage = (sectionId: string) => {
  const { 
    languages, 
    registerSection, 
    updateSectionLanguage, 
    getSectionLanguage 
  } = useLanguage();
  
  const [localSelectedLangId, setLocalSelectedLangId] = useState<number | null>(null);
  
  // Initialize section language state
  useEffect(() => {
    if (languages.length > 0 && localSelectedLangId === null) {
      const defaultLangId = languages[0].id;
      setLocalSelectedLangId(defaultLangId);
      registerSection(sectionId, defaultLangId);
    }
  }, [languages, sectionId, localSelectedLangId, registerSection]);

  const handleLanguageChange = useCallback((langName: string) => {
    const lang = languages.find(l => l.name === langName);
    if (lang) {
      setLocalSelectedLangId(lang.id);
      updateSectionLanguage(sectionId, lang.id);
    }
  }, [languages, sectionId, updateSectionLanguage]);

  return {
    languages,
    selectedLangId: localSelectedLangId,
    handleTabChange: handleLanguageChange
  };
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Store section language states without causing re-renders
  const sectionStatesRef = useRef<Map<string, SectionLanguageState>>(new Map());
  
  // Force re-render state when language changes occur
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const loadLanguages = async () => {
      setIsLoading(true);
      try {
        const { languages: fetchedLanguages, defaultLangId } = await fetchLanguages();
        if (fetchedLanguages.length > 0) {
          setLanguages(fetchedLanguages);
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguages();
  }, []);

  const registerSection = useCallback((sectionId: string, initialLangId?: number) => {
    if (!sectionStatesRef.current.has(sectionId) && languages.length > 0) {
      const langId = initialLangId ?? languages[0].id;
      const language = languages.find(l => l.id === langId);
      if (language) {
        sectionStatesRef.current.set(sectionId, {
          sectionId,
          selectedLangId: langId,
          languageName: language.name
        });
      }
    }
  }, [languages]);
  const updateSectionLanguage = useCallback((sectionId: string, langId: number) => {
    const language = languages.find(l => l.id === langId);
    if (language) {
      sectionStatesRef.current.set(sectionId, {
        sectionId,
        selectedLangId: langId,
        languageName: language.name
      });
      // Force re-render of components that depend on language changes
      forceUpdate({});
    }
  }, [languages]);

  const getSectionLanguage = useCallback((sectionId: string) => {
    return sectionStatesRef.current.get(sectionId) || null;
  }, []);

  const getActiveLanguageName = useCallback((sectionId?: string) => {
    if (sectionId) {
      const sectionState = sectionStatesRef.current.get(sectionId);
      return sectionState?.languageName || '';
    }
    
    // If no specific section, get the first section's language or default
    const firstSection = Array.from(sectionStatesRef.current.values())[0];
    return firstSection?.languageName || (languages.length > 0 ? languages[0].name : '');
  }, [languages]);

  return (
    <LanguageContext.Provider value={{
      languages,
      isLoading,
      registerSection,
      updateSectionLanguage,
      getSectionLanguage,
      getActiveLanguageName
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
