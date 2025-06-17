import React, { useEffect, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';

interface CTAFormData {
  title: string;
}

const SECTION_ID = 9; // CTA section ID

const HomeCTASection: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('9');
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }  } = useForm<CTAFormData>({
    defaultValues: {
      title: ''
    }  });

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        // console.log('Fetched CTA content:', content);     
           if (content) {
          // Check if content is already an object or needs to be parsed
          let parsedContent: any;
          if (typeof content === 'string') {
            parsedContent = JSON.parse(content);
          } else {
            parsedContent = content;
          }
          
          // Handle both old nested structure and new flat structure
          const title = parsedContent?.cta?.title || parsedContent?.title || 'LTS. Powering a world that works';
          
          reset({
            title: title
          });
        } else {
          reset({
            title: 'LTS. Powering a world that works'
          });
        }} catch (error) {
        console.error('Failed to load CTA content:', error);
        reset({
          title: 'LTS. Powering a world that works'
        });
      }
    };

    loadContent();  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<CTAFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }

    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('CTA section content updated successfully!');
      refreshPreview(); // Refresh the preview after successful save
    } catch (error) {
      console.error('Failed to update CTA content:', error);
      toast.error('Failed to update content.');
    }
  };return (
    <div className="p-4 border rounded-md shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700">
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        {/* <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
          <div className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold dark:text-gray-100">CTA Section</h2>
          </div>
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </CollapsibleTrigger> */}

        <CollapsibleContent className="space-y-4 mt-4">
          {languages.length > 0 && selectedLangId !== null ? (
            <Tabs
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
                    {/* CTA Title */}
                    <div>
                      <label htmlFor={`cta-title-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                        CTA Title
                      </label>                      <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'CTA title is required' }}
                        render={({ field }) => (
                          <TextInput 
                            id={`cta-title-${lang.name}`} 
                            {...field} 
                            placeholder="LTS. Powering a world that works"
                          />
                        )}
                      />
                      {errors.title && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
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
            <p className="dark:text-gray-300">Loading languages...</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default HomeCTASection;

