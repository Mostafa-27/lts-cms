import { ChevronDown, Plus, Trash2, Briefcase } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { careerDefaultData } from '../../../../../utils/careerDefaultData';

interface Position {
  id?: number;
  title: string;
  description: string;
  location: string;
  type: string;
  experience: string;
  skills: string[];
}

interface GuidelineField {
  value: string;
}

interface CareerPositionsFormData {
  title: string;
  subTitle: string;
  applicationGuidelines: GuidelineField[];
  positions: Position[];
}

const SECTION_ID = 13; // Career Positions section ID

const CareerPositions: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('13');
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<CareerPositionsFormData>({
    defaultValues: {
      title: '',
      subTitle: '',
      applicationGuidelines: [],
      positions: [],
    },
  });
  
  const { fields: positionFields, append: appendPosition, remove: removePosition } = useFieldArray({
    control,
    name: "positions",
  });
  const { fields: guidelineFields, append: appendGuideline, remove: removeGuideline } = useFieldArray({
    control,
    name: "applicationGuidelines",
  });
  const watchedPositions = watch("positions");

  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;        if (content) {
          reset({
            title: content.title || careerDefaultData.CareerPositions.title,
            subTitle: content.subTitle || careerDefaultData.CareerPositions.subTitle,
            applicationGuidelines: (content.applicationGuidelines || careerDefaultData.CareerPositions.applicationGuidelines).map((guideline: string) => ({ value: guideline })),
            positions: content.positions || careerDefaultData.CareerPositions.positions
          });
        } else {
          reset({
            title: careerDefaultData.CareerPositions.title,
            subTitle: careerDefaultData.CareerPositions.subTitle,
            applicationGuidelines: careerDefaultData.CareerPositions.applicationGuidelines.map((guideline: string) => ({ value: guideline })),
            positions: careerDefaultData.CareerPositions.positions
          });
        }
      } catch (error) {
        console.error('Failed to load career positions content:', error);
        reset({
          title: careerDefaultData.CareerPositions.title,
          subTitle: careerDefaultData.CareerPositions.subTitle,
          applicationGuidelines: careerDefaultData.CareerPositions.applicationGuidelines.map((guideline: string) => ({ value: guideline })),
          positions: careerDefaultData.CareerPositions.positions
        });
      }
    };
    loadContent();  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<CareerPositionsFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      // Convert GuidelineField[] back to string[]
      const formattedData = {
        ...data,
        applicationGuidelines: data.applicationGuidelines.map(item => item.value)
      };
      await updateSectionContent(SECTION_ID, selectedLangId, formattedData);
      toast.success('Career Positions section updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update career positions content:', error);
      toast.error('Failed to update Career Positions section.');
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
                    {/* Main Title and Subtitle */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`positions-title-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                          Section Title
                        </label>
                        <Controller
                          name="title"
                          control={control}
                          rules={{ required: 'Title is required' }}
                          render={({ field }) => <TextInput id={`positions-title-${lang.name}`} {...field} />}
                        />
                        {errors.title && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`positions-subtitle-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                          Subtitle
                        </label>
                        <Controller
                          name="subTitle"
                          control={control}
                          rules={{ required: 'Subtitle is required' }}
                          render={({ field }) => <TextInput id={`positions-subtitle-${lang.name}`} {...field} />}
                        />
                        {errors.subTitle && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.subTitle.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Application Guidelines */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Application Guidelines ({guidelineFields.length})</h3>                        <Button
                          type="button"
                          onClick={() => appendGuideline({ value: '' })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Guideline
                        </Button>
                      </div>
                      
                      {guidelineFields.length > 0 ? (
                        <div className="space-y-3">
                          {guidelineFields.map((item, index) => (
                            <div key={item.id} className="flex gap-2 items-center">                              <Controller
                                name={`applicationGuidelines.${index}.value` as const}
                                control={control}
                                render={({ field }) => <TextInput {...field} placeholder="Enter guideline" className="flex-1" />}
                              />                              <Button
                                type="button"
                                onClick={async () => {
                                  const confirmed = await confirmDialog({
                                    title: 'Delete Guideline',
                                    description: 'Are you sure you want to delete this guideline?',
                                    confirmButtonText: 'Delete',
                                    confirmButtonVariant: 'destructive'
                                  });
                                  if (confirmed) {
                                    removeGuideline(index);
                                  }
                                }}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <p>No guidelines added yet. Click "Add Guideline" to get started.</p>
                        </div>
                      )}
                    </div>

                    {/* Positions */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Open Positions ({positionFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => appendPosition({ 
                            title: '', 
                            description: '',
                            location: '',
                            type: '',
                            experience: '',
                            skills: []
                          })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Position
                        </Button>
                      </div>
                      
                      {positionFields.length > 0 ? (
                        <div className="space-y-4">
                          {positionFields.map((item, index) => (
                            <Collapsible key={item.id} defaultOpen={index === 0}>
                              <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Briefcase className="h-4 w-4 text-blue-500" />
                                      <span className="font-medium">
                                        {watchedPositions?.[index]?.title || `Position #${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const confirmed = await confirmDialog({
                                            title: 'Delete Position',
                                            description: 'Are you sure you want to delete this position?',
                                            confirmButtonText: 'Delete',
                                            confirmButtonVariant: 'destructive'
                                          });
                                          if (confirmed) {
                                            removePosition(index);
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
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Position Title</label>
                                        <Controller
                                          name={`positions.${index}.title` as const}
                                          control={control}
                                          rules={{ required: 'Position title is required' }}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter position title" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Location</label>
                                        <Controller
                                          name={`positions.${index}.location` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="e.g., Remote, Albania" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type</label>
                                        <Controller
                                          name={`positions.${index}.type` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="e.g., Full-time, Part-time" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Experience</label>
                                        <Controller
                                          name={`positions.${index}.experience` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="e.g., 2-4 years" />}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                      <Controller
                                        name={`positions.${index}.description` as const}
                                        control={control}
                                        render={({ field }) => <TextInput {...field} multiline rows={3} placeholder="Enter position description" />}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Skills (comma-separated)</label>
                                      <Controller
                                        name={`positions.${index}.skills` as const}
                                        control={control}
                                        render={({ field }) => (                                          <TextInput 
                                            value={field.value?.join(', ') || ''} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s))}
                                            placeholder="e.g., React, JavaScript, CSS, HTML" 
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
                          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p>No positions added yet. Click "Add Position" to get started.</p>
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

export default CareerPositions;
