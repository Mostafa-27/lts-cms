import React, { useEffect, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';
import { HTMLEditor } from '../../../../molecules/HTMLEditor';
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { servicesDefaultData } from '../../../../../utils/servicesDefaultData';

interface ServicesHeroFormData {
  title: string;
  subtitle: string;
  description: string;
}

const SECTION_ID = 14; // Services Hero section ID

const ServicesHero: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('14');
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ServicesHeroFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      description: ''
    }  });

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        // console.log('Fetched content:', content);
        if (content) {
          reset({
            title: content.title || servicesDefaultData.ServicesHero.title,
            subtitle: content.subtitle || servicesDefaultData.ServicesHero.subtitle,
            description: content.description || servicesDefaultData.ServicesHero.description
          });
        } else {
          reset({
            title: servicesDefaultData.ServicesHero.title,
            subtitle: servicesDefaultData.ServicesHero.subtitle,
            description: servicesDefaultData.ServicesHero.description
          });
        }
      } catch (error) {
        console.error('Failed to load services hero content:', error);
        reset({
          title: servicesDefaultData.ServicesHero.title,
          subtitle: servicesDefaultData.ServicesHero.subtitle,
          description: servicesDefaultData.ServicesHero.description
        });
      }
    };

    loadContent();  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<ServicesHeroFormData> = async data => {
    if (selectedLangId === null) return;

    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Services Hero section content updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update services hero content:', error);
      toast.error('Failed to update content.');
    }
  };

  return (
    <div className="p-0 dark:bg-gray-900">
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <CollapsibleContent className="space-y-4 mt-1">
          {languages.length > 0 && selectedLangId !== null ? (            <Tabs
              defaultValue={languages.find(l => l.id === selectedLangId)?.code}
              onValueChange={handleTabChange}
              className="w-full mb-6"
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1">
                {languages.map(lang => (
                  <TabsTrigger 
                    key={lang.id} 
                    value={lang.code}
                    className="text-xs sm:text-sm px-2 py-2 min-w-0 truncate"
                  >
                    {lang.code.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>

              {languages.map(lang => (
                <TabsContent key={lang.id} value={lang.code}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
                    {/* Title */}
                    <div>
                      <label htmlFor={`services-hero-title-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Title
                      </label>
                      <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Title is required' }}
                        render={({ field }) => <TextInput id={`services-hero-title-${lang.name}`} {...field} />}
                      />
                      {errors.title && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label htmlFor={`services-hero-subtitle-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Subtitle
                      </label>
                      <Controller
                        name="subtitle"
                        control={control}
                        rules={{ required: 'Subtitle is required' }}
                        render={({ field }) => <TextInput id={`services-hero-subtitle-${lang.name}`} {...field} />}
                      />
                      {errors.subtitle && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.subtitle.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor={`services-hero-description-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Description
                      </label>
                      <Controller
                        name="description"
                        control={control}
                        rules={{ required: 'Description is required' }}
                        render={({ field }) => (
                          <HTMLEditor id={`services-hero-description-${lang.name}`} value={field.value} onChange={field.onChange} />
                        )}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full">
                      Save Changes for {lang.code.toUpperCase()}
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

export default ServicesHero;

