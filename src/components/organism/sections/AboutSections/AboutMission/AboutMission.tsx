import React, { useEffect, useState } from 'react';
import { Controller, useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';
import { HTMLEditor } from '../../../../molecules/HTMLEditor';
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { aboutDefaultData } from '../../../../../utils/aboutDefaultData';
import { Plus, Trash2, Target } from 'lucide-react';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';

interface Benefit {
  title: string;
  description: string;
}

interface AboutMissionFormData {
  title: string;
  teamTitle: string;
  teamDescription: string;
  supportTitle: string;
  supportDescription: string;
  whyChooseTitle: string;
  benefits: Benefit[];
}

const SECTION_ID = 21; // About Mission section ID (assuming next available ID)

const AboutMission: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  
  // Use section-specific language management
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('21');
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<AboutMissionFormData>({
    defaultValues: {
      title: '',
      teamTitle: '',
      teamDescription: '',
      supportTitle: '',
      supportDescription: '',
      whyChooseTitle: '',
      benefits: [],
    },
  });

  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
    control,
    name: "benefits",
  });

  const watchedBenefits = watch("benefits");

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
          reset(aboutDefaultData.AboutMission);
        }
      } catch (error) {
        console.error('Failed to load about mission content:', error);
        reset(aboutDefaultData.AboutMission);
      }
  };
    loadContent();
  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<AboutMissionFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('About Mission section updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update about mission content:', error);
      toast.error('Failed to update About Mission section.');
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
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Main Title</label>
                      <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Title is required' }}
                        render={({ field }) => <TextInput {...field} placeholder="Our Mission & Vision" />}
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Team Title</label>
                        <Controller
                          name="teamTitle"
                          control={control}
                          render={({ field }) => <TextInput {...field} placeholder="Our Team" />}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Support Title</label>
                        <Controller
                          name="supportTitle"
                          control={control}
                          render={({ field }) => <TextInput {...field} placeholder="24/7 Support" />}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Team Description</label>
                      <Controller
                        name="teamDescription"
                        control={control}
                        render={({ field }) => <HTMLEditor value={field.value} onChange={field.onChange} />}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Support Description</label>
                      <Controller
                        name="supportDescription"
                        control={control}
                        render={({ field }) => <HTMLEditor value={field.value} onChange={field.onChange} />}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Why Choose Title</label>
                      <Controller
                        name="whyChooseTitle"
                        control={control}
                        render={({ field }) => <TextInput {...field} placeholder="Why Choose LTS?" />}
                      />
                    </div>

                    {/* Benefits Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Benefits ({benefitFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => appendBenefit({ 
                            title: '', 
                            description: ''
                          })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Benefit
                        </Button>
                      </div>
                      
                      {benefitFields.length > 0 ? (
                        <div className="space-y-4">
                          {benefitFields.map((item, index) => (
                            <div key={item.id} className="border rounded-lg p-4 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">
                                    {watchedBenefits?.[index]?.title || `Benefit #${index + 1}`}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  onClick={async () => {
                                    const confirmed = await confirmDialog({
                                      title: 'Delete Benefit',
                                      description: 'Are you sure you want to delete this benefit?',
                                      confirmButtonText: 'Delete',
                                      confirmButtonVariant: 'destructive'
                                    });
                                    if (confirmed) {
                                      removeBenefit(index);
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
                                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Benefit Title</label>
                                  <Controller
                                    name={`benefits.${index}.title` as const}
                                    control={control}
                                    rules={{ required: 'Benefit title is required' }}
                                    render={({ field }) => <TextInput {...field} placeholder="Tourism Expertise" />}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Benefit Description</label>
                                  <Controller
                                    name={`benefits.${index}.description` as const}
                                    control={control}
                                    render={({ field }) => <TextInput {...field} placeholder="Specialized knowledge in tourism and hospitality sector" multiline rows={2} />}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p>No benefits added yet. Click "Add Benefit" to get started.</p>
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

export default AboutMission;
