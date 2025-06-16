import React, { useEffect, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { HTMLEditor } from '../../../../molecules/HTMLEditor';
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';

 

interface HeroFormData {
  title: string;
  subtitle: string;
  description: string;
}

const SECTION_ID = 1;

const HomeHeroSection: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  
  // Use section-specific language management
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('1');
  
  const {
    control,
    handleSubmit,
    reset,
   // Added setValue
    formState: { errors }  } = useForm<HeroFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      description: ''
    }
  });

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
console.log('Fetched content:', content);        if (content) {
          reset({
            title: content.title || '',
            description: content.description || '',
            subtitle: content.subtitle || ''
          });
        } else {
          reset({
            title: '',
            description: '',
            subtitle: ''
          });
        }
      } catch (error) {
        console.error('Failed to load hero content:', error);        reset({
          title: '',
          description: '',
          subtitle: ''
        });
      }
    };    loadContent();
  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<HeroFormData> = async data => {
    if (selectedLangId === null) return;

    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Hero section content updated successfully!');
      refreshPreview(); // Refresh the preview after successful save
    } catch (error) {
      console.error('Failed to update hero content:', error);
      toast.error('Failed to update content.');
    }
  };return (
    <div className="p-0 dark:bg-gray-900">
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        {/* <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-100">Hero Section</h2>
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-gray-500" />
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </CollapsibleTrigger> */}
        
        <CollapsibleContent className="space-y-4 mt-1">
          {languages.length > 0 && selectedLangId !== null ? (
            <Tabs
              defaultValue={languages.find(l => l.id === selectedLangId)?.name}
              onValueChange={handleTabChange}
              className="w-full mb-6"
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1">
                {languages.map(lang => (
                  <TabsTrigger 
                    key={lang.id} 
                    value={lang.name}
                    className="text-xs sm:text-sm px-2 py-2 min-w-0 truncate"
                  >
                    {lang.name.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>

              {languages.map(lang => (
                <TabsContent key={lang.id} value={lang.name}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
                    {/* Title */}
                    <div>
                      <label htmlFor={`hero-title-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Title
                      </label>
                      <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Title is required' }}
                        render={({ field }) => <TextInput id={`hero-title-${lang.name}`} {...field} />}
                      />                      {errors.title && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor={`hero-subtitle-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Subtitle
                      </label>
                      <Controller
                        name="subtitle"
                        control={control}
                        rules={{ required: 'Subtitle is required' }}
                        render={({ field }) => <TextInput id={`hero-subtitle-${lang.name}`} {...field} />}
                      />                      {errors.subtitle && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.subtitle.message}</p>
                      )}
                    </div>

                    {/* Description */}
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
                      )}                    </div>

                    <Button type="submit" className="w-full">
                      Save Changes for {lang.name.toUpperCase()}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="dark:text-gray-300">Loading languages...</p>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default HomeHeroSection;
