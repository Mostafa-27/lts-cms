import { Loader2, Star, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { fetchLanguages, type Language } from "../../../../../services/languageService";
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Collapsible, CollapsibleContent } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../ui/tabs";
import { Textarea } from '../../../../ui/textarea';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';

interface TestimonialItem {
  id?: number;
  quote: string;
  author: string;
  position: string;
  company: string;
  rating?: number;
}

interface TestimonialsFormData {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

// Removed local Language interface

const SECTION_ID = 6; // Example ID for Testimonials section

const HomeTestimonialsSection: React.FC = () => {
  const [nextItemId, setNextItemId] = useState<number>(1);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { refreshPreview } = useSplitLayout();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TestimonialsFormData>({
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

  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLangId, setSelectedLangId] = useState<number | null>(null);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const { languages: fetchedLanguages, defaultLangId } = await fetchLanguages(); // Changed
        if (fetchedLanguages.length > 0) {
          setLanguages(fetchedLanguages);
          setSelectedLangId(defaultLangId ?? fetchedLanguages[0].id); // Changed
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      }
    };
    loadLanguages();
  }, []);
  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        if (content) {
          const items = content.items || [];
          // Ensure all items have IDs and find the next available ID
          const itemsWithIds = items.map((item: TestimonialItem, index: number) => ({
            ...item,
            id: item.id || index + 1
          }));
          
          // Set next ID to be higher than any existing ID
          const maxId = itemsWithIds.length > 0 
            ? Math.max(...itemsWithIds.map((item: TestimonialItem) => item.id || 0))
            : 0;
          setNextItemId(maxId + 1);
          
          reset({
            title: content.title || '',
            subtitle: content.subtitle || '',
            items: itemsWithIds
          });
        } else {
          setNextItemId(1);
          reset({ 
            title: '', 
            subtitle: '', 
            items: [] 
          });
        }
      } catch (error) {
        console.error('Failed to load testimonials content:', error);
        setNextItemId(1);
        reset({ 
          title: '', 
          subtitle: '', 
          items: [] 
        });
      }
    };
    loadContent();
  }, [selectedLangId, reset]);

  const handleTabChange = (value: string) => {
    const lang = languages.find(l => l.name === value);
    if (lang) {
      setSelectedLangId(lang.id);
    }
  };  const onSubmit: SubmitHandler<TestimonialsFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Testimonials section updated successfully!');
      refreshPreview(); // Refresh the preview after successful save
    } catch (error) {
      console.error('Failed to update testimonials content:', error);
      toast.error('Failed to update testimonials section.');
    }
  };return (
    <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
      <div className="p-4 border rounded-md shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700">
        <ConfirmDialog />
        {/* <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold dark:text-gray-200">Testimonials Section</h2>
            </div>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CollapsibleTrigger> */}
        
        <CollapsibleContent className="space-y-4 mt-4">
          {languages.length > 0 && selectedLangId !== null && (
            <Tabs defaultValue={languages.find(l => l.id === selectedLangId)?.name} onValueChange={handleTabChange} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1">
                {languages.map((lang) => (
                  <TabsTrigger 
                    key={lang.id} 
                    value={lang.name}
                    className="text-xs sm:text-sm px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {lang.name.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
              {languages.map((lang) => (
                <TabsContent key={lang.id} value={lang.name}>
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
                            id={`testimonials-title-${lang.name}`} 
                            placeholder="Enter testimonials title" 
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
                            id={`testimonials-subtitle-${lang.name}`} 
                            placeholder="Enter testimonials subtitle" 
                            error={errors.subtitle?.message}
                          />
                        )}
                      />
                    </div>

                    {/* Testimonials Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <span className="text-lg">Testimonial Items for {lang.name} ({fields.length})</span>
                          <Button
                            type="button"
                            onClick={() => {
                              append({ 
                                id: nextItemId,
                                quote: '', 
                                author: '', 
                                position: '',
                                company: '',
                                rating: 5
                              });
                              setNextItemId(prev => prev + 1);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Add Testimonial
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {fields.length > 0 ? (
                          <Tabs defaultValue={fields[0] ? `item-tab-${fields[0].id}` : undefined} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 h-auto p-1">
                              {fields.map((item, index) => (
                                <TabsTrigger 
                                  key={item.id} 
                                  value={`item-tab-${item.id}`}
                                  className="text-xs sm:text-sm px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  #{index + 1}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                            
                            {fields.map((item, index) => (
                              <TabsContent key={item.id} value={`item-tab-${item.id}`} className="mt-4">
                                <div className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 space-y-4 relative">
                                  <Button 
                                    type="button" 
                                    onClick={async () => {
                                      const confirmed = await confirmDialog({
                                        title: "Remove Testimonial",
                                        description: `Are you sure you want to remove this testimonial? This action cannot be undone.`,
                                        confirmButtonText: "Remove",
                                        confirmButtonVariant: "destructive"
                                      });
                                      if (confirmed) {
                                        remove(index);
                                      }
                                    }} 
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                                    <Controller
                                      name={`items.${index}.author` as const}
                                      control={control}
                                      rules={{ required: 'Author is required' }}
                                      render={({ field }) => (
                                        <TextInput 
                                          label="Author"
                                          {...field} 
                                          id={`testimonial-author-${lang.name}-${index}`} 
                                          placeholder="Author name" 
                                          error={errors.items?.[index]?.author?.message}
                                        />
                                      )}
                                    />
                                    
                                    <Controller
                                      name={`items.${index}.position` as const}
                                      control={control}
                                      rules={{ required: 'Position is required' }}
                                      render={({ field }) => (
                                        <TextInput 
                                          label="Position"
                                          {...field} 
                                          id={`testimonial-position-${lang.name}-${index}`} 
                                          placeholder="Job title" 
                                          error={errors.items?.[index]?.position?.message}
                                        />
                                      )}
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                      name={`items.${index}.company` as const}
                                      control={control}
                                      rules={{ required: 'Company is required' }}
                                      render={({ field }) => (
                                        <TextInput 
                                          label="Company"
                                          {...field} 
                                          id={`testimonial-company-${lang.name}-${index}`} 
                                          placeholder="Company name" 
                                          error={errors.items?.[index]?.company?.message}
                                        />
                                      )}
                                    />
                                    
                                    <Controller
                                      name={`items.${index}.rating` as const}
                                      control={control}
                                      render={({ field }) => (
                                        <TextInput 
                                          label="Rating (1-5)"
                                          {...field} 
                                          type="number" 
                                          min="1" 
                                          max="5" 
                                          id={`testimonial-rating-${lang.name}-${index}`} 
                                          placeholder="5" 
                                          error={errors.items?.[index]?.rating?.message}
                                        />
                                      )}
                                    />
                                  </div>

                                  <Controller
                                    name={`items.${index}.quote` as const}
                                    control={control}
                                    rules={{ required: 'Quote is required' }}
                                    render={({ field }) => (
                                      <div>
                                        <label htmlFor={`testimonial-quote-${lang.name}-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          Quote
                                        </label>
                                        <Textarea 
                                          {...field} 
                                          id={`testimonial-quote-${lang.name}-${index}`} 
                                          placeholder="Testimonial quote" 
                                          className="dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100 min-h-[100px]" 
                                        />
                                        {errors.items?.[index]?.quote && (
                                          <p className="text-red-500 text-xs mt-1">{errors.items?.[index]?.quote?.message}</p>
                                        )}
                                      </div>
                                    )}
                                  />
                                </div>
                              </TabsContent>
                            ))}
                          </Tabs>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No testimonials added yet. Click "Add Testimonial" to get started.
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
          {languages.length === 0 && (
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

export default HomeTestimonialsSection;
