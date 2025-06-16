import { ChevronDown, Plus, Trash2, Award, Heart } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';
import { TextInput } from '../../../../molecules/textinput';
import IconPicker from '../../../../molecules/iconPicker/IconPicker';
import { getIconByName } from '../../../../../utils/iconLibrary';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { careerDefaultData } from '../../../../../utils/careerDefaultData';

interface Training {
  icon: string;
  title: string;
  description: string;
}

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface CareerBenefitsFormData {
  title: string;
  subTitle: string;
  trainings: Training[];
  benefits: Benefit[];
}

const SECTION_ID = 11; // Career Benefits section ID

const CareerBenefits: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('11');
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<CareerBenefitsFormData>({
    defaultValues: {
      title: '',
      subTitle: '',
      trainings: [],
      benefits: [],
    },
  });

  const { fields: trainingFields, append: appendTraining, remove: removeTraining } = useFieldArray({
    control,
    name: "trainings",
  });

  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
    control,
    name: "benefits",
  });
  const watchedTrainings = watch("trainings");
  const watchedBenefits = watch("benefits");

  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;        if (content) {
          reset({
            title: content.title || careerDefaultData.CareerBenefits.title,
            subTitle: content.subTitle || careerDefaultData.CareerBenefits.subTitle,
            trainings: content.trainings || careerDefaultData.CareerBenefits.trainings,
            benefits: content.benefits || careerDefaultData.CareerBenefits.benefits
          });
        } else {
          reset({
            title: careerDefaultData.CareerBenefits.title,
            subTitle: careerDefaultData.CareerBenefits.subTitle,
            trainings: careerDefaultData.CareerBenefits.trainings,
            benefits: careerDefaultData.CareerBenefits.benefits
          });
        }
      } catch (error) {
        console.error('Failed to load career benefits content:', error);
        reset({
          title: careerDefaultData.CareerBenefits.title,
          subTitle: careerDefaultData.CareerBenefits.subTitle,
          trainings: careerDefaultData.CareerBenefits.trainings,
          benefits: careerDefaultData.CareerBenefits.benefits
        });
      }
    };
    loadContent();  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<CareerBenefitsFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Career Benefits section updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update career benefits content:', error);
      toast.error('Failed to update Career Benefits section.');
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
                    {/* Main Title and Subtitle */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`benefits-title-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                          Section Title
                        </label>
                        <Controller
                          name="title"
                          control={control}
                          rules={{ required: 'Title is required' }}
                          render={({ field }) => <TextInput id={`benefits-title-${lang.name}`} {...field} />}
                        />
                        {errors.title && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`benefits-subtitle-${lang.name}`} className="block text-sm font-medium mb-1 dark:text-gray-200">
                          Subtitle
                        </label>
                        <Controller
                          name="subTitle"
                          control={control}
                          rules={{ required: 'Subtitle is required' }}
                          render={({ field }) => <TextInput id={`benefits-subtitle-${lang.name}`} {...field} multiline rows={2} />}
                        />
                        {errors.subTitle && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.subTitle.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Trainings */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Training Programs ({trainingFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => appendTraining({ 
                            icon: '', 
                            title: '', 
                            description: ''
                          })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Training
                        </Button>
                      </div>
                      
                      {trainingFields.length > 0 ? (
                        <div className="space-y-4">
                          {trainingFields.map((item, index) => (
                            <Collapsible key={item.id} defaultOpen={index === 0}>
                              <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Award className="h-4 w-4 text-green-500" />
                                      <span className="font-medium">
                                        {watchedTrainings?.[index]?.title || `Training #${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const confirmed = await confirmDialog({
                                            title: 'Delete Training',
                                            description: 'Are you sure you want to delete this training?',
                                            confirmButtonText: 'Delete',
                                            confirmButtonVariant: 'destructive'
                                          });
                                          if (confirmed) {
                                            removeTraining(index);
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
                                    <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Icon Name</label>
                                        <Controller
                                          name={`trainings.${index}.icon` as const}
                                          control={control}
                                          rules={{ required: 'Icon is required' }}
                                          render={({ field }) => (
                                            <div className="space-y-2">
                                              <IconPicker
                                                value={field.value || "Award"}
                                                onValueChange={field.onChange}
                                                placeholder="Select an icon"
                                                className="w-full"
                                              />
                                              {field.value && (
                                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                                                  <div className="flex items-center gap-2">
                                                    {(() => {
                                                      const IconComponent = getIconByName(field.value);
                                                      return IconComponent ? (
                                                        <IconComponent className="w-5 h-5 text-blue-500" />
                                                      ) : (
                                                        <div className="w-5 h-5 bg-gray-300 rounded" />
                                                      );
                                                    })()}
                                                    <span className="font-medium">Selected:</span>
                                                    <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                                                      {field.value}
                                                    </code>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                        <Controller
                                          name={`trainings.${index}.title` as const}
                                          control={control}
                                          rules={{ required: 'Training title is required' }}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter training title" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                        <Controller
                                          name={`trainings.${index}.description` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter training description" />}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <Award className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                          <p>No trainings added yet. Click "Add Training" to get started.</p>
                        </div>
                      )}
                    </div>

                    {/* Benefits */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Employee Benefits ({benefitFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => appendBenefit({ 
                            icon: '', 
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
                            <Collapsible key={item.id} defaultOpen={index === 0}>
                              <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Heart className="h-4 w-4 text-red-500" />
                                      <span className="font-medium">
                                        {watchedBenefits?.[index]?.title || `Benefit #${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"                                        onClick={async (e) => {
                                          e.stopPropagation();
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
                                      <ChevronDown className="h-4 w-4" />
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-4 pb-4 space-y-4 border-t dark:border-gray-600">
                                    <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Icon Name</label>
                                        <Controller
                                          name={`benefits.${index}.icon` as const}
                                          control={control}
                                          rules={{ required: 'Icon is required' }}
                                          render={({ field }) => (
                                            <div className="space-y-2">
                                              <IconPicker
                                                value={field.value || "Heart"}
                                                onValueChange={field.onChange}
                                                placeholder="Select an icon"
                                                className="w-full"
                                              />
                                              {field.value && (
                                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                                                  <div className="flex items-center gap-2">
                                                    {(() => {
                                                      const IconComponent = getIconByName(field.value);
                                                      return IconComponent ? (
                                                        <IconComponent className="w-5 h-5 text-blue-500" />
                                                      ) : (
                                                        <div className="w-5 h-5 bg-gray-300 rounded" />
                                                      );
                                                    })()}
                                                    <span className="font-medium">Selected:</span>
                                                    <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                                                      {field.value}
                                                    </code>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                        <Controller
                                          name={`benefits.${index}.title` as const}
                                          control={control}
                                          rules={{ required: 'Benefit title is required' }}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter benefit title" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                        <Controller
                                          name={`benefits.${index}.description` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter benefit description" />}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                          <p>No benefits added yet. Click "Add Benefit" to get started.</p>
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

export default CareerBenefits;

