import React, { useEffect, useState } from 'react';
import { Controller, useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { fetchLanguages, type Language } from '../../../../../services/languageService';
import { HTMLEditor } from '../../../../molecules/HTMLEditor';
import { TextInput } from '../../../../molecules/textinput';
import { ImagePicker } from '../../../../molecules/imagePicker';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { aboutDefaultData } from '../../../../../utils/aboutDefaultData';
import { Plus, Trash2, Award } from 'lucide-react';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';

interface ImageData {
  imageUrl: string;
  imageAlt: string;
}

interface Certificate {
  logo: string;
  title: string;
}

interface AboutCertificatesFormData {
  title: string;
  description: string;
  certificates: Certificate[];
}

const SECTION_ID = 24; // About Certificates section ID

const AboutCertificates: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<AboutCertificatesFormData>({
    defaultValues: {
      title: '',
      description: '',
      certificates: [],
    },
  });

  const { fields: certificateFields, append: appendCertificate, remove: removeCertificate } = useFieldArray({
    control,
    name: "certificates",
  });

  const watchedCertificates = watch("certificates");

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
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        if (content) {
          reset(content);
        } else {
          reset(aboutDefaultData.AboutCertificates);
        }
      } catch (error) {
        console.error('Failed to load about certificates content:', error);
        reset(aboutDefaultData.AboutCertificates);
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

  const onSubmit: SubmitHandler<AboutCertificatesFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('About Certificates section updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update about certificates content:', error);
      toast.error('Failed to update About Certificates section.');
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
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                      <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Title is required' }}
                        render={({ field }) => <TextInput {...field} placeholder="Certifications & Standards" />}
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

                    {/* Certificates Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Certificates ({certificateFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => appendCertificate({ 
                            logo: '',
                            title: ''
                          })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Certificate
                        </Button>
                      </div>
                      
                      {certificateFields.length > 0 ? (
                        <div className="space-y-4">
                          {certificateFields.map((item, index) => (
                            <div key={item.id} className="border rounded-lg p-4 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">
                                    {watchedCertificates?.[index]?.title || `Certificate #${index + 1}`}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  onClick={async () => {
                                    const confirmed = await confirmDialog({
                                      title: 'Delete Certificate',
                                      description: 'Are you sure you want to delete this certificate?',
                                      confirmButtonText: 'Delete',
                                      confirmButtonVariant: 'destructive'
                                    });
                                    if (confirmed) {
                                      removeCertificate(index);
                                    }
                                  }}
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="space-y-4">
                                {/* <div>
                                  <Controller
                                    name={`certificates.${index}.logo` as const}
                                    control={control}
                                    render={({ field }) => (
                                      <ImagePicker
                                        label="Certificate Logo"
                                        value={field.value}
                                        onImageChange={(imageData: ImageData) => field.onChange(imageData.imageUrl)}
                                      />
                                    )}
                                  />
                                </div> */}
                                
                                <div>
                                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Certificate Title</label>
                                  <Controller
                                    name={`certificates.${index}.title` as const}
                                    control={control}
                                    rules={{ required: 'Certificate title is required' }}
                                    render={({ field }) => <TextInput {...field} placeholder="ISO 9001:2015 Quality Management" />}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Award className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p>No certificates added yet. Click "Add Certificate" to get started.</p>
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

export default AboutCertificates;
