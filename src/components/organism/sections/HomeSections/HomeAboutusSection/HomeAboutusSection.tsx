import { HTMLEditor } from '@/components/molecules/HTMLEditor';
import React, { useEffect, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { fetchLanguages, type Language } from '../../../../../services/languageService';
import { ImagePicker } from '../../../../molecules/imagePicker';
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../ui/tabs";
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';

interface ImageData {
  imageUrl: string;
  imageAlt: string;
}

interface AboutUsFormData {
  title: string;
  image: ImageData;
  description: string;
}

const SECTION_ID = 2; // Example ID for About Us section

const HomeAboutusSection: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();

  const { control, handleSubmit, reset, formState: { errors }   } = useForm<AboutUsFormData>({
    defaultValues: {
      title: '',
      
      image: {
        imageUrl: '',
        imageAlt: ''
      },
      description: '',
    },
  });

  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLangId, setSelectedLangId] = useState<number | null>(null);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const { languages: fetchedLanguages, defaultLangId } = await fetchLanguages();
        if (fetchedLanguages.length > 0) {
          setLanguages(fetchedLanguages);
          setSelectedLangId(defaultLangId ?? fetchedLanguages[0].id); // Use defaultLangId or fallback to the first language
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      }
    };
    loadLanguages();
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
            const pageContent = data?.content;
        if (pageContent && pageContent) {
          // Handle case where content is already in the correct format
          reset(pageContent);
        } else if (pageContent) {
          // Handle case where content might be in old format and needs conversion
          const content = pageContent as AboutUsFormData;
          const formattedContent: AboutUsFormData = {
            title: content.title || '',
            description: content.description || '',
            image: {
              imageUrl: content.image.imageUrl || '',
              imageAlt: content.image.imageAlt || ''
            }
          };
          reset(formattedContent);
        } else {
          // Reset form if no content is found for the selected language
          reset({ 
            title: '', 
            image: { 
              imageUrl: '', 
              imageAlt: '' 
            }, 
            description: '' 
          });
        }
      } catch (error) {
        console.error('Failed to load about us content:', error);
        // Reset form in case of an error
        reset({ 
          title: '', 
          image: { 
            imageUrl: '', 
            imageAlt: '' 
          }, 
          description: '' 
        });
      }
    };
    loadContent();
  }, [selectedLangId, reset]);  const onSubmit: SubmitHandler<AboutUsFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {

      console.log('Submitting About Us section data:', data);
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      console.log(`About Us section data updated for lang ${selectedLangId}:`, data);
      toast.success(`About Us section updated successfully!`);
      refreshPreview(); // Refresh the preview after successful save
    } catch (error) {
      console.error('Failed to update about us content:', error);
      toast.error('Failed to update About Us section.');
    }
  };

  const handleTabChange = (langName: string) => {
    const lang = languages.find(l => l.name === langName);
    if (lang) {
      setSelectedLangId(lang.id);
    }
  };
  return (
    <div className="p-4 border rounded-md shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700">
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        {/* <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">About Us Section</h2>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-500" />
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </CollapsibleTrigger> */}
        
        <CollapsibleContent className="space-y-4 mt-4">
          {languages.length > 0 && selectedLangId !== null && (
            <Tabs defaultValue={languages.find(l => l.id === selectedLangId)?.name} onValueChange={handleTabChange} className="w-full mb-6">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1">
                {languages.map((lang) => (
                  <TabsTrigger 
                    key={lang.id} 
                    value={lang.name}
                    className="text-xs sm:text-sm px-2 py-2 min-w-0 truncate"
                  >
                    {lang.name.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
              {languages.map((lang) => (
                <TabsContent key={lang.id} value={lang.name}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => <TextInput label="Title" {...field} id={`title-${lang.name}`} />}
                    />
                  <div>
                      <label htmlFor={`hero-description-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Description
                      </label>
                      <Controller
                        name="description"
                        control={control}
                        rules={{ required: 'Description is required' }}
                        render={({ field }) => (
                          <HTMLEditor id={`hero-description-${lang.name}`} value={field.value} onChange={field.onChange} />
                        )}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                      )}                </div>            <Controller
                      name="image"
                      control={control}
                      render={({ field }) => (
                        <ImagePicker
                          id={`image-${lang.name}`}
                          label="Image"
                          value={field.value}
                          onImageChange={(imageData: ImageData) => {
                            field.onChange(imageData);
                          }}
                        />
                      )}
                    />
                                        <Button type="submit" className="w-full">
                                                            Save Changes for {lang.name.toUpperCase()}
                                                          </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>
          )}
          {languages.length === 0 && <p className="dark:text-gray-300">Loading languages...</p>}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default HomeAboutusSection;
