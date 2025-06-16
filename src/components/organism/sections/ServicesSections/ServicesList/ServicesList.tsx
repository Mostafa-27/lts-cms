import { ChevronDown, Plus, Trash2, Settings } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';
import { HTMLEditor } from '../../../../molecules/HTMLEditor';
import { ImagePicker } from '../../../../molecules/imagePicker';
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { servicesDefaultData } from '../../../../../utils/servicesDefaultData';

interface ImageData {
  imageUrl: string;
  imageAlt: string;
}

interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  image: string;
  items: string[];
}

interface ServicesListFormData {
  services: ServiceItem[];
}

const SECTION_ID = 15; // Services List section ID

const ServicesList: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('15');
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<ServicesListFormData>({
    defaultValues: {
      services: [],
    },
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: "services",
  });
  const watchedServices = watch("services");

  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        if (content) {
          reset({
            services: content.services || servicesDefaultData.ServicesList
          });
        } else {
          reset({
            services: servicesDefaultData.ServicesList
          });
        }
      } catch (error) {
        console.error('Failed to load services list content:', error);
        reset({
          services: servicesDefaultData.ServicesList
        });
      }
    };
    loadContent();  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<ServicesListFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Services List section updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update services list content:', error);
      toast.error('Failed to update Services List section.');
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700">
      <ConfirmDialog />
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
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
                    {/* Services */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Services ({serviceFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => appendService({ 
                            id: `service-${Date.now()}`,
                            title: '', 
                            description: '',
                            image: '/service2.png',
                            items: []
                          })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </div>
                      
                      {serviceFields.length > 0 ? (
                        <div className="space-y-4">
                          {serviceFields.map((item, index) => (
                            <Collapsible key={item.id} defaultOpen={index === 0}>
                              <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Settings className="h-4 w-4 text-blue-500" />
                                      <span className="font-medium">
                                        {watchedServices?.[index]?.title || `Service #${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const confirmed = await confirmDialog({
                                            title: 'Delete Service',
                                            description: 'Are you sure you want to delete this service?',
                                            confirmButtonText: 'Delete',
                                            confirmButtonVariant: 'destructive'
                                          });
                                          if (confirmed) {
                                            removeService(index);
                                          }
                                        }}
                                        variant="destructive"
                                        size="sm"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                      <ChevronDown className="h-4 w-4" />
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-4 pb-4 space-y-4 border-t dark:border-gray-600">
                                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Service Title</label>
                                        <Controller
                                          name={`services.${index}.title` as const}
                                          control={control}
                                          rules={{ required: 'Service title is required' }}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter service title" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Service ID</label>
                                        <Controller
                                          name={`services.${index}.id` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="e.g., strategy-design" />}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                      <Controller
                                        name={`services.${index}.description` as const}
                                        control={control}
                                        render={({ field }) => <HTMLEditor value={field.value} onChange={field.onChange} />}
                                      />
                                    </div>                                    <div>
                                      <Controller
                                        name={`services.${index}.image` as const}
                                        control={control}
                                        render={({ field }) => (
                                          <ImagePicker
                                            label="Service Image"
                                            value={field.value}
                                            onImageChange={(imageData: ImageData) => field.onChange(imageData.imageUrl)}
                                          />
                                        )}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Service Items (comma-separated)</label>
                                      <Controller
                                        name={`services.${index}.items` as const}
                                        control={control}
                                        render={({ field }) => (
                                          <TextInput 
                                            value={field.value?.join(', ') || ''} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s))}
                                            placeholder="Customer Experience, Product Development, Digital Innovation" 
                                            multiline
                                            rows={3}
                                          />
                                        )}
                                      />
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
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

export default ServicesList;
