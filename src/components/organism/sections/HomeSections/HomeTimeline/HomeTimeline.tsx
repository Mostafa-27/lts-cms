import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { TextInput } from '../../../../molecules/textinput';
import { HTMLEditor } from '../../../../molecules/HTMLEditor';
import { Button } from '../../../../ui/button';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { fetchLanguages, type Language } from "../../../../../services/languageService"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/collapsible";
import { ChevronDown, ChevronUp, Calendar,  Trophy } from "lucide-react";
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';

interface TimelineEvent {
  id?: number;
  year: string;
  title: string;
  description: string;
  milestone: string;
}

interface TimelineFormData {
  title: string;
  subtitle: string;
  events: TimelineEvent[];
}

const SECTION_ID = 4; // Example ID for Timeline section

const HomeTimelineSection: React.FC = () => {
  const [nextEventId, setNextEventId] = useState<number>(1);
  const [isCollapsedEvents, setIsCollapsedEvents] = useState<boolean[]>([]);

  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<TimelineFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      events: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "events",
  });

  const watchedEvents = watch("events");
  
  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLangId, setSelectedLangId] = useState<number | null>(null);
  // Initialize collapsed state for events - first one open, rest collapsed
  useEffect(() => {
    setIsCollapsedEvents(fields.map((_, index) => index !== 0));
  }, [fields.length]);

  const toggleEventCollapse = (index: number) => {
    setIsCollapsedEvents(prev => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const { languages: fetchedLanguages, defaultLangId } = await fetchLanguages();
        if (fetchedLanguages.length > 0) {
          setLanguages(fetchedLanguages);
          setSelectedLangId(defaultLangId ?? fetchedLanguages[0].id);
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
          const events = content.events || [];
          // Ensure all events have IDs and find the next available ID
          const eventsWithIds = events.map((event: TimelineEvent, index: number) => ({
            ...event,
            id: event.id || index + 1
          }));
          
          // Set next ID to be higher than any existing ID
          const maxId = eventsWithIds.length > 0 
            ? Math.max(...eventsWithIds.map((e: TimelineEvent) => e.id || 0))
            : 0;
          setNextEventId(maxId + 1);
          
          reset({
            title: content.title || '',
            subtitle: content.subtitle || '',
            events: eventsWithIds
          });
        } else {
          setNextEventId(1);
          reset({ 
            title: '', 
            subtitle: '', 
            events: [] 
          });
        }
      } catch (error) {
        console.error('Failed to load timeline content:', error);
        setNextEventId(1);
        reset({ 
          title: '', 
          subtitle: '', 
          events: [] 
        });
      }
    };
    loadContent();
  }, [selectedLangId, reset]);
  const onSubmit: SubmitHandler<TimelineFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId,  data );
      console.log(`Timeline section data updated for lang ${selectedLangId}:`, data);
      toast.success('Timeline section updated successfully!');
    } catch (error) {
      console.error('Failed to update timeline content:', error);
      toast.error('Failed to update Timeline section.');
    }
  };

  const handleTabChange = (langName: string) => {
    const lang = languages.find(l => l.name === langName);
    if (lang) {
      setSelectedLangId(lang.id);
    }
  };  return (
    <div className="p-4 lg:p-6 border rounded-lg shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700 max-w-full overflow-hidden">
      <ConfirmDialog />
      {/* <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-700 dark:text-gray-200">Timeline Section</h2> */}
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
            <TabsContent key={lang.id} value={lang.name} className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Fields Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`timeline-title-${lang.name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <Controller
                      name="title"
                      control={control}
                      rules={{ required: 'Title is required' }}
                      render={({ field }) => <TextInput id={`timeline-title-${lang.name}`} {...field} placeholder="Enter timeline title" className="w-full" />}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label htmlFor={`timeline-subtitle-${lang.name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                    <Controller
                      name="subtitle"
                      control={control}
                      rules={{ required: 'Subtitle is required' }}
                      render={({ field }) => <TextInput id={`timeline-subtitle-${lang.name}`} {...field} placeholder="Enter timeline subtitle" className="w-full" />}
                    />
                    {errors.subtitle && <p className="text-red-500 text-xs mt-1">{errors.subtitle.message}</p>}
                  </div>
                </div>

                {/* Timeline Events Section */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300">Timeline Events ({fields.length})</h3>
                    <Button
                      type="button"
                      onClick={() => {
                        append({ 
                          id: nextEventId,
                          year: '', 
                          title: '', 
                          description: '',
                          milestone: ''
                        });
                        setNextEventId(prev => prev + 1);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white shrink-0"
                      size="sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </div>

                  {fields.length > 0 ? (
                    <div className="space-y-3">
                      {fields.map((item, index) => (
                        <Collapsible 
                          key={item.id} 
                          open={!isCollapsedEvents[index]} 
                          onOpenChange={() => toggleEventCollapse(index)}
                          className="border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                          <CollapsibleTrigger className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  {isCollapsedEvents[index] ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronUp className="h-4 w-4 text-gray-500" />
                                  )}
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {watchedEvents?.[index]?.year || 'New Event'} - {watchedEvents?.[index]?.title || 'Untitled'}
                                    </span>
                                    {watchedEvents?.[index]?.milestone && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        <Trophy className="w-3 h-3 mr-1" />
                                        {watchedEvents[index].milestone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button 
                                type="button" 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const confirmed = await confirmDialog({
                                    title: "Remove Timeline Event",
                                    description: `Are you sure you want to remove this event (${watchedEvents[index]?.year || index + 1})? This action cannot be undone.`,
                                    confirmButtonText: "Remove",
                                    confirmButtonVariant: "destructive"
                                  });
                                  if (confirmed) {
                                    remove(index);
                                  }
                                }} 
                                variant="destructive"
                                size="sm"
                                className="shrink-0"
                              >
                                Remove
                              </Button>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 pt-0 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label htmlFor={`timeline-event-${lang.name}-${index}-year`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                                <Controller
                                  name={`events.${index}.year` as const}
                                  control={control}
                                  rules={{ required: 'Year is required' }}
                                  render={({ field }) => <TextInput id={`timeline-event-${lang.name}-${index}-year`} {...field} placeholder="e.g., 2013" className="w-full" />}
                                />
                                {errors.events?.[index]?.year && <p className="text-red-500 text-xs mt-1">{errors.events?.[index]?.year?.message}</p>}
                              </div>
                              <div>
                                <label htmlFor={`timeline-event-${lang.name}-${index}-title`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <Controller
                                  name={`events.${index}.title` as const}
                                  control={control}
                                  rules={{ required: 'Title is required' }}
                                  render={({ field }) => <TextInput id={`timeline-event-${lang.name}-${index}-title`} {...field} placeholder="Event title" className="w-full" />}
                                />
                                {errors.events?.[index]?.title && <p className="text-red-500 text-xs mt-1">{errors.events?.[index]?.title?.message}</p>}
                              </div>
                              <div className="sm:col-span-2 lg:col-span-1">
                                <label htmlFor={`timeline-event-${lang.name}-${index}-milestone`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Milestone</label>
                                <Controller
                                  name={`events.${index}.milestone` as const}
                                  control={control}
                                  rules={{ required: 'Milestone is required' }}
                                  render={({ field }) => <TextInput id={`timeline-event-${lang.name}-${index}-milestone`} {...field} placeholder="e.g., Foundation" className="w-full" />}
                                />
                                {errors.events?.[index]?.milestone && <p className="text-red-500 text-xs mt-1">{errors.events?.[index]?.milestone?.message}</p>}
                              </div>
                            </div>

                            <div>
                              <label htmlFor={`timeline-event-${lang.name}-${index}-description`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                              <Controller
                                name={`events.${index}.description` as const}
                                control={control}
                                rules={{ required: 'Description is required' }}
                                render={({ field }) => <HTMLEditor id={`timeline-event-${lang.name}-${index}-description`} value={field.value} onChange={field.onChange} />}
                              />
                              {errors.events?.[index]?.description && <p className="text-red-500 text-xs mt-1">{errors.events?.[index]?.description?.message}</p>}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No events added yet</p>
                      <p className="text-sm">Click "Add Event" to create your first timeline event.</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Save Changes for {lang.name.toUpperCase()}
                  </Button>
                </div>
              </form>
            </TabsContent>
          ))}
        </Tabs>
      )}
      {languages.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="dark:text-gray-300">Loading languages...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTimelineSection;
