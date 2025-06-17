import { Loader2 } from 'lucide-react';
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

 

interface SustainabilityFormData {
  title: string;
  subtitle: string;
  description: string;
}

const SECTION_ID = 8; // Sustainability section ID

const HomeSustainabilitySection: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { refreshPreview } = useSplitLayout();
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('8');
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SustainabilityFormData>({
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
    };

    loadContent();  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<SustainabilityFormData> = async data => {
    if (selectedLangId === null) return;

    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Sustainability section content updated successfully!');
      refreshPreview(); // Refresh the preview after successful save
    } catch (error) {
      console.error('Failed to update sustainability content:', error);
      toast.error('Failed to update content.');
    }
  };return (
    <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
      <div className="p-4 border rounded-md shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700">
        {/* <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Sustainability Section</h2>
            </div>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CollapsibleTrigger> */}

        <CollapsibleContent className="space-y-4 mt-4">
          {languages.length > 0 && selectedLangId !== null ? (
            <Tabs              defaultValue={languages.find(l => l.id === selectedLangId)?.code}
              onValueChange={handleTabChange}
              className="w-full mb-6"
            >
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1">
                {languages.map(lang => (
                  <TabsTrigger 
                    key={lang.id} 
                    value={lang.code}
                    className="text-xs sm:text-sm px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {lang.code.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>

              {languages.map(lang => (
                <TabsContent key={lang.id} value={lang.code}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
                    
                    {/* Title and Subtitle */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Title is required' }}
                        render={({ field }) => (
                          <TextInput 
                            label={`Title for ${lang.name}`}
                            {...field} 
                            id={`sustainability-title-${lang.name}`} 
                            error={errors.title?.message}
                          />
                        )}
                      />
                      
                      <Controller
                        name="subtitle"
                        control={control}
                        rules={{ required: 'Subtitle is required' }}
                        render={({ field }) => (
                          <TextInput 
                            label={`Subtitle for ${lang.name}`}
                            {...field} 
                            id={`sustainability-subtitle-${lang.name}`} 
                            error={errors.subtitle?.message}
                          />
                        )}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor={`sustainability-description-${lang.name}`} className="block text-sm font-medium mb-2 dark:text-gray-200">
                        Description for {lang.name}
                      </label>
                      <Controller
                        name="description"
                        control={control}
                        rules={{ required: 'Description is required' }}
                        render={({ field }) => (
                          <HTMLEditor 
                            id={`sustainability-description-${lang.name}`} 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        )}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-2">{errors.description.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Save Changes for {lang.code.toUpperCase()}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="dark:text-gray-300">Loading languages...</p>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default HomeSustainabilitySection;

