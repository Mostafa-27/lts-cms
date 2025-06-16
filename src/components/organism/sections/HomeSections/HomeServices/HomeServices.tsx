import { ChevronDown, Plus, Trash2, Wrench } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';
import { HTMLEditor } from '../../../../molecules/HTMLEditor';
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';

interface ServiceItem {
  id?: number;
  title: string;
  description: string;
}

interface ServicesFormData {
  title: string;
  subtitle: string;
  items: ServiceItem[];
}

const SECTION_ID = 7; // Services section ID

const HomeServicesSection: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('7');
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<ServicesFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      items: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        if (content) {
          reset({
            title: content.title || '',
            subtitle: content.subtitle || '',
            items: content.items || []
          });
        } else {
          reset({
            title: '',
            subtitle: '',
            items: []
          });
        }
      } catch (error) {
        console.error('Failed to load services content:', error);
        reset({
          title: '',
          subtitle: '',
          items: []
        });
      }
    };
    loadContent();  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<ServicesFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Services section updated successfully!');
      refreshPreview(); // Refresh the preview after successful save
    } catch (error) {
      console.error('Failed to update services content:', error);
      toast.error('Failed to update Services section.');
    }
  };
  return (
    <div className="p-4 border rounded-md shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700">
      <ConfirmDialog />
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        {/* <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Services Section</h2>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
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
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
                    {/* Main Title */}
                    <div>
                      <label htmlFor={`services-title-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Section Title
                      </label>
                      <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Title is required' }}
                        render={({ field }) => <TextInput id={`services-title-${lang.name}`} {...field} />}
                      />
                      {errors.title && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label htmlFor={`services-subtitle-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Subtitle
                      </label>
                      <Controller
                        name="subtitle"
                        control={control}
                        rules={{ required: 'Subtitle is required' }}
                        render={({ field }) => <TextInput id={`services-subtitle-${lang.name}`} {...field} multiline rows={3} />}
                      />
                      {errors.subtitle && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.subtitle.message}</p>
                      )}
                    </div>                    {/* Service Items */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Service Items ({fields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => append({ 
                            title: '', 
                            description: ''
                          })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </div>
                      
                      {fields.length > 0 ? (
                        <div className="space-y-4">
                          {fields.map((item, index) => (
                            <Collapsible key={item.id} defaultOpen={index === 0}>
                                <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Wrench className="h-4 w-4 text-purple-500" />
                                      <span className="font-medium">
                                        {watchedItems?.[index]?.title || `Service #${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        type="button" 
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const confirmed = await confirmDialog({
                                            title: "Remove Service",
                                            description: `Are you sure you want to remove "${watchedItems?.[index]?.title || 'this service'}"? This action cannot be undone.`,
                                            confirmButtonText: "Remove",
                                            confirmButtonVariant: "destructive"
                                          });
                                          if (confirmed) {
                                            remove(index);
                                          }
                                        }} 
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                      <ChevronDown className="h-4 w-4 text-gray-500 ui-open:rotate-180 transition-transform" />
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <div className="px-4 pb-4 space-y-4 border-t dark:border-gray-600">
                                    <div className="pt-4">
                                      {/* Service Title */}
                                      <div className="mb-4">
                                        <label htmlFor={`service-title-${lang.name}-${index}`} className="block text-sm font-medium mb-1 dark:text-gray-300">
                                          Service Title
                                        </label>
                                        <Controller
                                          name={`items.${index}.title` as const}
                                          control={control}
                                          rules={{ required: 'Service title is required' }}
                                          render={({ field }) => <TextInput id={`service-title-${lang.name}-${index}`} {...field} placeholder="Enter service title" />}
                                        />
                                        {errors.items?.[index]?.title && (
                                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.items?.[index]?.title?.message}</p>
                                        )}
                                      </div>

                                      {/* Service Description */}
                                      <div>
                                        <label htmlFor={`service-description-${lang.name}-${index}`} className="block text-sm font-medium mb-1 dark:text-gray-300">
                                          Service Description
                                        </label>
                                        <Controller
                                          name={`items.${index}.description` as const}
                                          control={control}
                                          rules={{ required: 'Service description is required' }}
                                          render={({ field }) => (
                                            <HTMLEditor 
                                              id={`service-description-${lang.name}-${index}`}
                                              value={field.value}
                                              onChange={field.onChange}
                                            
                                            />
                                          )}
                                        />
                                        {errors.items?.[index]?.description && (
                                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.items?.[index]?.description?.message}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p>No services added yet. Click "Add Service" to get started.</p>
                        </div>
                      )}
                    </div>

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

export default HomeServicesSection;
