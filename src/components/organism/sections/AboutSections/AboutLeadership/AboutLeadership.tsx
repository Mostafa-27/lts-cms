import React, { useEffect, useState } from 'react';
import { Controller, useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';
import { HTMLEditor } from '../../../../molecules/HTMLEditor';
import { TextInput } from '../../../../molecules/textinput';
import { ImagePicker } from '../../../../molecules/imagePicker';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { aboutDefaultData } from '../../../../../utils/aboutDefaultData';
import { Plus, Trash2, Users } from 'lucide-react';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';

interface ImageData {
  imageUrl: string;
  imageAlt: string;
}

interface Manager {
  avatar: string;
  name: string;
  position: string;
  description: string;
}

interface AboutLeadershipFormData {
  title: string;
  description: string;
  managers: Manager[];
}

const SECTION_ID = 22; // About Leadership section ID

const AboutLeadership: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  
  // Use shared language context
  // Use section-specific language management
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('22');
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<AboutLeadershipFormData>({
    defaultValues: {
      title: '',
      description: '',
      managers: [],
    },
  });

  const { fields: managerFields, append: appendManager, remove: removeManager } = useFieldArray({
    control,
    name: "managers",
  });

  const watchedManagers = watch("managers");
  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        if (content) {
          reset(content);
        } else {
          reset(aboutDefaultData.AboutLeadership);
        }
      } catch (error) {
        console.error('Failed to load about leadership content:', error);
        reset(aboutDefaultData.AboutLeadership);
      }
  };
    loadContent();
  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<AboutLeadershipFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('About Leadership section updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update about leadership content:', error);
      toast.error('Failed to update About Leadership section.');
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700">
      <ConfirmDialog />
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <CollapsibleContent className="space-y-4 mt-4">
          {languages.length > 0 && selectedLangId !== null && (
            <Tabs defaultValue={languages.find(l => l.id === selectedLangId)?.code} onValueChange={handleTabChange} className="w-full mb-6">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1">
                {languages.map((lang) => (
                  <TabsTrigger 
                    key={lang.id} 
                    value={lang.code}
                    className="text-xs sm:text-sm px-2 py-2 min-w-0 truncate"
                  >
                    {lang.code.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {languages.map((lang) => (
                <TabsContent key={lang.id} value={lang.code}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                      <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Title is required' }}
                        render={({ field }) => <TextInput {...field} placeholder="Leadership Team" />}
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => <HTMLEditor value={field.value} onChange={field.onChange} />}
                      />
                    </div>

                    {/* Managers Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Managers ({managerFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => appendManager({ 
                            avatar: '/lukas.png',
                            name: '', 
                            position: '',
                            description: ''
                          })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Manager
                        </Button>
                      </div>
                      
                      {managerFields.length > 0 ? (
                        <div className="space-y-4">
                          {managerFields.map((item, index) => (
                            <div key={item.id} className="border rounded-lg p-4 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">
                                    {watchedManagers?.[index]?.name || `Manager #${index + 1}`}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  onClick={async () => {
                                    const confirmed = await confirmDialog({
                                      title: 'Delete Manager',
                                      description: 'Are you sure you want to delete this manager?',
                                      confirmButtonText: 'Delete',
                                      confirmButtonVariant: 'destructive'
                                    });
                                    if (confirmed) {
                                      removeManager(index);
                                    }
                                  }}
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <Controller
                                    name={`managers.${index}.avatar` as const}
                                    control={control}
                                    render={({ field }) => (
                                      <ImagePicker
                                        label="Manager Avatar"
                                        value={field.value}
                                        onImageChange={(imageData: ImageData) => field.onChange(imageData.imageUrl)}
                                      />
                                    )}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                                    <Controller
                                      name={`managers.${index}.name` as const}
                                      control={control}
                                      rules={{ required: 'Name is required' }}
                                      render={({ field }) => <TextInput {...field} placeholder="Lukas Hirschl" />}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Position</label>
                                    <Controller
                                      name={`managers.${index}.position` as const}
                                      control={control}
                                      rules={{ required: 'Position is required' }}
                                      render={({ field }) => <TextInput {...field} placeholder="Director Call Center" />}
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                  <Controller
                                    name={`managers.${index}.description` as const}
                                    control={control}
                                    render={({ field }) => <HTMLEditor value={field.value} onChange={field.onChange} />}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p>No managers added yet. Click "Add Manager" to get started.</p>
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full">
                      Save Changes for {lang.code.toUpperCase()}
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

export default AboutLeadership;

