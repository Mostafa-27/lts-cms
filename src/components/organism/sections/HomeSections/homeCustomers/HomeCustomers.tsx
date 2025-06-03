import { ChevronDown, Loader2, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { fetchLanguages, type Language } from "../../../../../services/languageService";
import { ImagePicker } from '../../../../molecules/imagePicker';
import { TextInput } from '../../../../molecules/textinput';
import { Button } from '../../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../ui/tabs";

interface ImageData {
  imageUrl: string;
  imageAlt: string;
}

interface CustomerLogo {
  id?: number;
  name: string;
  logo: {
    src: string;
    alt: string;
  };
}

interface CustomerStat {
  id?: number;
  number: string;
  label: string;
  description: string;
}

interface CustomersFormData {
  title: string;
  subtitle: string;
  logos: CustomerLogo[];
  stats: CustomerStat[];
}

const SECTION_ID = 5 // Example ID for Customers section

const HomeCustomersSection: React.FC = () => {
  const [nextLogoId, setNextLogoId] = useState<number>(1);
  const [nextStatId, setNextStatId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CustomersFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      logos: [],
      stats: [],
    },
  });
  
  const { fields: logoFields, append: appendLogo, remove: removeLogo } = useFieldArray({
    control,
    name: "logos",
    keyName: "fieldId", // Use a different key name to avoid conflicts
  });
  
  const { fields: statFields, append: appendStat, remove: removeStat } = useFieldArray({
    control,
    name: "stats",
    keyName: "fieldId", // Use a different key name to avoid conflicts
  });

  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLangId, setSelectedLangId] = useState<number | null>(null);

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
      setIsLoading(true);
      try {        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        console.log('Fetched content:', content);
        if (content && content) {
          // Check if content is already an object or needs to be parsed
          let formData: CustomersFormData;
          if (typeof content === 'string') {
            formData = JSON.parse(content) as CustomersFormData;
          } else {
            formData = content as CustomersFormData;
          }          console.log('Parsed form data:', formData);
          
          // Ensure arrays exist and have default values
          const logos = formData.logos || [];
          const stats = formData.stats || [];
          
          // Assign IDs to existing items that don't have them
          let logoIdCounter = logos.length > 0 ? Math.max(...logos.map(l => l.id || 0), 0) + 1 : 1;
          let statIdCounter = stats.length > 0 ? Math.max(...stats.map(s => s.id || 0), 0) + 1 : 1;
          
          const logosWithIds = logos.map((logo) => ({
            ...logo,
            id: logo.id || logoIdCounter++,
          }));
          
          const statsWithIds = stats.map((stat) => ({
            ...stat,
            id: stat.id || statIdCounter++,
          }));
          
          setNextLogoId(logoIdCounter);
          setNextStatId(statIdCounter);
          
          reset({
            ...formData,
            logos: logosWithIds,
            stats: statsWithIds,
          });
        } else {
          reset({ 
            title: '', 
            subtitle: '', 
            logos: [], 
            stats: [] 
          });
        }
      } catch (error) {
        console.error('Failed to load customers content:', error);
        reset({ 
          title: '', 
          subtitle: '', 
          logos: [], 
          stats: [] 
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, [selectedLangId, reset]);
  const handleTabChange = (value: string) => {
    const lang = languages.find(l => l.name === value);
    if (lang) {
      setSelectedLangId(lang.id);
    }
  };

  const onSubmit: SubmitHandler<CustomersFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Customers content updated successfully!');
    } catch (error) {
      console.error('Failed to update customers content:', error);
      toast.error('Failed to update content.');
    }
  };
  const addLogo = () => {
    const newLogo = {
      id: nextLogoId,
      name: '',
      logo: {
        src: '',
        alt: '',
      },
    };
    appendLogo(newLogo);
    setNextLogoId(prev => prev + 1);
  };

  const addStat = () => {
    const newStat = {
      id: nextStatId,
      number: '',
      label: '',
      description: '',
    };
    appendStat(newStat);
    setNextStatId(prev => prev + 1);
  };

  return (
    <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
      <div className="p-4 border rounded-md shadow-md mt-1 dark:bg-gray-800 dark:border-gray-700">
        <ConfirmDialog />
        {/* <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold dark:text-gray-200">Our Customers</h2>
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
                            id={`customers-title-${lang.name}`}
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
                            id={`customers-subtitle-${lang.name}`}
                            error={errors.subtitle?.message}
                          />
                        )}
                      />
                    </div>                    {/* Customer Logos Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <span className="text-lg">Customer Logos for {lang.name} ({logoFields.length})</span>
                          <Button type="button" onClick={addLogo} variant="outline" size="sm">
                            Add Logo
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <p className="text-gray-500">Loading logos...</p>
                          </div>
                        ) : (
                          <>
                            {logoFields.length > 0 ? (
                              <div className="space-y-4">
                                {logoFields.map((field, index) => (
                                  <Collapsible key={field.fieldId} defaultOpen={index === 0}>
                                    <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                      <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                          <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium">
                                              Company #{index + 1}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button 
                                              type="button" 
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                const confirmed = await confirmDialog({
                                                  title: "Remove Customer Logo",
                                                  description: "Are you sure you want to remove this logo? This action cannot be undone.",
                                                  confirmButtonText: "Remove",
                                                  confirmButtonVariant: "destructive"
                                                });
                                                if (confirmed) {
                                                  removeLogo(index);
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
                                            <Controller
                                              name={`logos.${index}.name`}
                                              control={control}
                                              rules={{ required: 'Company name is required' }}
                                              render={({ field }) => (
                                                <TextInput 
                                                  label="Company Name" 
                                                  {...field} 
                                                  error={errors.logos?.[index]?.name?.message}
                                                />
                                              )}
                                            />
                                          </div>
                                          
                                          <Controller
                                            name={`logos.${index}.logo.src`}
                                            control={control}
                                            rules={{ required: 'Logo image is required' }}
                                            render={({ field }) => (
                                              <ImagePicker
                                                id={`logo-${lang.name}-${index}`}
                                                label="Logo Image"
                                                value={field.value}
                                                onImageChange={(imageData: ImageData) => {
                                                  field.onChange(imageData.imageUrl);
                                                  setValue(`logos.${index}.logo.alt`, imageData.imageAlt);
                                                }}
                                              />
                                            )}
                                          />
                                        </div>
                                      </CollapsibleContent>
                                    </div>
                                  </Collapsible>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No customer logos added yet. Click "Add Logo" to get started.</p>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>                    {/* Customer Stats Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <span className="text-lg">Customer Statistics for {lang.name} ({statFields.length})</span>
                          <Button type="button" onClick={addStat} variant="outline" size="sm">
                            Add Statistic
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <p className="text-gray-500">Loading statistics...</p>
                          </div>
                        ) : (
                          <>
                            {statFields.length > 0 ? (
                              <div className="space-y-4">
                                {statFields.map((field, index) => (
                                  <Collapsible key={field.fieldId} defaultOpen={index === 0}>
                                    <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                      <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                          <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-green-500" />
                                            <span className="font-medium">
                                              Statistic #{index + 1}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button 
                                              type="button" 
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                const confirmed = await confirmDialog({
                                                  title: "Remove Customer Statistic",
                                                  description: "Are you sure you want to remove this statistic? This action cannot be undone.",
                                                  confirmButtonText: "Remove",
                                                  confirmButtonVariant: "destructive"
                                                });
                                                if (confirmed) {
                                                  removeStat(index);
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
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                                            <Controller
                                              name={`stats.${index}.number`}
                                              control={control}
                                              rules={{ required: 'Number is required' }}
                                              render={({ field }) => (
                                                <TextInput 
                                                  label="Number" 
                                                  {...field} 
                                                  placeholder="100+"
                                                  error={errors.stats?.[index]?.number?.message}
                                                />
                                              )}
                                            />
                                            
                                            <Controller
                                              name={`stats.${index}.label`}
                                              control={control}
                                              rules={{ required: 'Label is required' }}
                                              render={({ field }) => (
                                                <TextInput 
                                                  label="Label" 
                                                  {...field} 
                                                  placeholder="Happy Customers"
                                                  error={errors.stats?.[index]?.label?.message}
                                                />
                                              )}
                                            />
                                            
                                            <Controller
                                              name={`stats.${index}.description`}
                                              control={control}
                                              rules={{ required: 'Description is required' }}
                                              render={({ field }) => (
                                                <TextInput 
                                                  label="Description" 
                                                  {...field} 
                                                  placeholder="Satisfied with our service"
                                                  error={errors.stats?.[index]?.description?.message}
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
                              <p className="text-gray-500 text-center py-8">No customer statistics added yet. Click "Add Statistic" to get started.</p>
                            )}
                          </>
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

export default HomeCustomersSection;
