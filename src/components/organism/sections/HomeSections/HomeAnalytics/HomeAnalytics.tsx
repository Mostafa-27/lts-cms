import { ChevronDown, Loader2, Trash2, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { fetchLanguages, type Language } from "../../../../../services/languageService";
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../ui/tabs";

interface AnalyticsStat {
  id?: number;
  number: string;
  title: string;
  subTitle: string;
  icon: string;
}

interface AnalyticsFormData {
  title: string;
  subtitle: string;
  stats: AnalyticsStat[];
}

// Removed local Language interface

const SECTION_ID = 3; // Example ID for Analytics section

const HomeAnalyticsSection: React.FC = () => {
  const [nextStatId, setNextStatId] = useState<number>(1);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<AnalyticsFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      stats: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stats",
  });

  const watchedStats = watch("stats");
  
  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  const [languagesState, setLanguagesState] = useState<Language[]>([]); // Renamed to avoid conflict with form field
  const [selectedLangId, setSelectedLangId] = useState<number | null>(null);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const { languages: fetchedLanguages, defaultLangId } = await fetchLanguages(); // Changed
        if (fetchedLanguages.length > 0) {
          setLanguagesState(fetchedLanguages);
          setSelectedLangId(defaultLangId ?? fetchedLanguages[0].id); // Changed
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      }
    };
    loadLanguages();
  }, []);  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        if (content) {
          const stats = content.stats || [];
          // Ensure all stats have IDs and find the next available ID
          const statsWithIds = stats.map((stat: AnalyticsStat, index: number) => ({
            ...stat,
            id: stat.id || index + 1
          }));
          
          // Set next ID to be higher than any existing ID
          const maxId = statsWithIds.length > 0 
            ? Math.max(...statsWithIds.map((stat: AnalyticsStat) => stat.id || 0))
            : 0;
          setNextStatId(maxId + 1);
          
          reset({
            title: content.title || '',
            subtitle: content.subtitle || '',
            stats: statsWithIds
          });
        } else {
          setNextStatId(1);
          reset({ 
            title: '',
            subtitle: '',
            stats: [] 
          });
        }
      } catch (error) {
        console.error('Failed to load analytics content:', error);
        setNextStatId(1);
        reset({ 
          title: '',
          subtitle: '',
          stats: [] 
        });
      }
    };
    loadContent();
  }, [selectedLangId, reset]);const onSubmit: SubmitHandler<AnalyticsFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Analytics section updated successfully!');
    } catch (error) {
      console.error('Failed to update analytics content:', error);
      toast.error('Failed to update Analytics section.');
    }
  };

  const handleTabChange = (langName: string) => { // Added
    const lang = languagesState.find(l => l.name === langName);
    if (lang) {
      setSelectedLangId(lang.id);
    }
  };  return (
    <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
      <div className="p-4 border rounded-md shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700">
        <ConfirmDialog />
       
        
        <CollapsibleContent className="space-y-4 mt-4">
          {languagesState.length > 0 && selectedLangId !== null && (
            <Tabs defaultValue={languagesState.find(l => l.id === selectedLangId)?.name} onValueChange={handleTabChange} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1">
                {languagesState.map((lang) => (
                  <TabsTrigger 
                    key={lang.id} 
                    value={lang.name}
                    className="text-xs sm:text-sm px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {lang.name.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>          {languagesState.map((lang) => (            <TabsContent key={lang.id} value={lang.name}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
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
                        id={`analytics-title-${lang.name}`} 
                        placeholder="Enter analytics title" 
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
                        id={`analytics-subtitle-${lang.name}`} 
                        placeholder="Enter analytics subtitle" 
                        error={errors.subtitle?.message}
                      />
                    )}
                  />
                </div>

                {/* Analytics Statistics Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="text-lg">Analytics Statistics for {lang.name} ({fields.length})</span>
                      <Button
                        type="button"
                        onClick={() => {
                          append({ 
                            id: nextStatId,
                            number: '', 
                            title: '', 
                            subTitle: '',
                            icon: ''
                          });
                          setNextStatId(prev => prev + 1);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Add Statistic
                      </Button>
                    </CardTitle>
                  </CardHeader>                  <CardContent>
                    {fields.length > 0 ? (
                      <div className="space-y-4">
                        {fields.map((item, index) => (
                          <Collapsible key={item.id} defaultOpen={index === 0}>
                            <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">
                                      {watchedStats?.[index]?.title || `Statistic #${index + 1}`}
                                    </span>
                                    {watchedStats?.[index]?.number && (
                                      <span className="text-sm text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                        {watchedStats[index].number}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      type="button" 
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const confirmed = await confirmDialog({
                                          title: "Remove Statistic",
                                          description: `Are you sure you want to remove this statistic (${watchedStats[index]?.title || index + 1})? This action cannot be undone.`,
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
                                <div className="px-4 pb-4 space-y-3 border-t dark:border-gray-600">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                                    <Controller
                                      name={`stats.${index}.number` as const}
                                      control={control}
                                      rules={{ required: 'Number is required' }}
                                      render={({ field }) => (
                                        <TextInput 
                                          label="Number"
                                          {...field} 
                                          id={`analytics-number-${lang.name}-${index}`} 
                                          placeholder="e.g., 350" 
                                          error={errors.stats?.[index]?.number?.message}
                                        />
                                      )}
                                    />
                                    
                                    <Controller
                                      name={`stats.${index}.title` as const}
                                      control={control}
                                      rules={{ required: 'Title is required' }}
                                      render={({ field }) => (
                                        <TextInput 
                                          label="Title"
                                          {...field} 
                                          id={`analytics-title-${lang.name}-${index}`} 
                                          placeholder="e.g., Employees" 
                                          error={errors.stats?.[index]?.title?.message}
                                        />
                                      )}
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Controller
                                      name={`stats.${index}.subTitle` as const}
                                      control={control}
                                      rules={{ required: 'Subtitle is required' }}
                                      render={({ field }) => (
                                        <TextInput 
                                          label="Subtitle"
                                          {...field} 
                                          id={`analytics-subtitle-${lang.name}-${index}`} 
                                          placeholder="e.g., Dedicated professionals" 
                                          error={errors.stats?.[index]?.subTitle?.message}
                                        />
                                      )}
                                    />
                                    
                                    <Controller
                                      name={`stats.${index}.icon` as const}
                                      control={control}
                                      rules={{ required: 'Icon is required' }}
                                      render={({ field }) => (
                                        <TextInput 
                                          label="Icon"
                                          {...field} 
                                          id={`analytics-icon-${lang.name}-${index}`} 
                                          placeholder="e.g., users" 
                                          error={errors.stats?.[index]?.icon?.message}
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
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No statistics added yet. Click "Add Statistic" to get started.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" size="lg">
                  Save Changes for {lang.name.toUpperCase()}
                </Button>
              </form>
            </TabsContent>
          ))}
        </Tabs>
      )}
      {languagesState.length === 0 && (
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

export default HomeAnalyticsSection;
