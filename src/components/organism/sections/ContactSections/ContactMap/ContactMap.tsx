import { ChevronDown, Plus, Trash2, Settings, MapPin } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { fetchLanguages, type Language } from '../../../../../services/languageService';
import { TextInput } from '../../../../molecules/textinput';
import MapSelector from '../../../../molecules/MapSelector';
import MapPreview from '../../../../molecules/MapPreview/MapPreview';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { contactDefaultData } from '../../../../../utils/contactDefaultData';

interface MapBranch {
  id: number;
  name: string;
  mapLocation: string;
}

interface ContactMapFormData {
  title: string;
  subTitle: string;
  branches: MapBranch[];
}

const SECTION_ID = 18; // Contact Map section ID

const ContactMap: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number | null>(null);
  const { refreshPreview } = useSplitLayout();
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<ContactMapFormData>({
    defaultValues: {
      title: '',
      subTitle: '',
      branches: [],
    },
  });

  const { fields: branchFields, append: appendBranch, remove: removeBranch } = useFieldArray({
    control,
    name: "branches",
  });

  const watchedBranches = watch("branches");

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
          reset(contactDefaultData.ContactMap);
        }
      } catch (error) {
        console.error('Failed to load contact map content:', error);
        reset(contactDefaultData.ContactMap);
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
  const onSubmit: SubmitHandler<ContactMapFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Contact Map section updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update contact map content:', error);
      toast.error('Failed to update Contact Map section.');
    }
  };

  // Map selector functions
  const openMapSelector = (branchIndex: number) => {
    setSelectedBranchIndex(branchIndex);
    setIsMapSelectorOpen(true);
  };
  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    if (selectedBranchIndex !== null) {
      // Generate a standardized URL format that can be easily parsed by MapPreview
      // Include coordinates in the URL for easy extraction
      const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
      
      // Update the form field with the selected location
      const currentValues = watch();
      const updatedBranches = [...currentValues.branches];
      updatedBranches[selectedBranchIndex] = {
        ...updatedBranches[selectedBranchIndex],
        mapLocation: embedUrl
      };
      
      reset({
        ...currentValues,
        branches: updatedBranches
      });
      
      const branchName = updatedBranches[selectedBranchIndex].name || 'branch';
      const locationInfo = address ? ` at ${address}` : ` at coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      toast.success(`Location selected for ${branchName}${locationInfo}`);
    }
    setIsMapSelectorOpen(false);
    setSelectedBranchIndex(null);
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => <TextInput {...field} placeholder="Enter section title" />}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Subtitle</label>
                        <Controller
                          name="subTitle"
                          control={control}
                          render={({ field }) => <TextInput {...field} placeholder="Enter section subtitle" />}
                        />
                      </div>
                    </div>

                    {/* Branch Maps */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Branch Maps ({branchFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => appendBranch({ 
                            id: Date.now(),
                            name: 'New Office',
                            mapLocation: ''
                          })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Branch Map
                        </Button>
                      </div>
                      
                      {branchFields.length > 0 ? (
                        <div className="space-y-4">
                          {branchFields.map((item, index) => (
                            <Collapsible key={item.id} defaultOpen={index === 0}>
                              <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Settings className="h-4 w-4 text-blue-500" />
                                      <span className="font-medium">
                                        {watchedBranches?.[index]?.name || `Branch Map #${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const confirmed = await confirmDialog({
                                            title: 'Delete Branch Map',
                                            description: 'Are you sure you want to delete this branch map?',
                                            confirmButtonText: 'Delete',
                                            confirmButtonVariant: 'destructive'
                                          });
                                          if (confirmed) {
                                            removeBranch(index);
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
                                    <div className="pt-4">
                                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Branch Name</label>
                                      <Controller
                                        name={`branches.${index}.name` as const}
                                        control={control}
                                        rules={{ required: 'Branch name is required' }}
                                        render={({ field }) => <TextInput {...field} placeholder="Enter branch name" />}
                                      />
                                    </div>                                    <div>
                                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Map Location</label>
                                      <div className="flex gap-2">
                                        <div className="flex-1">
                                          <Controller
                                            name={`branches.${index}.mapLocation` as const}
                                            control={control}
                                            render={({ field }) => <TextInput {...field} placeholder="Enter map embed URL or select location" />}
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          onClick={() => openMapSelector(index)}
                                          variant="outline"
                                          size="sm"
                                          className="whitespace-nowrap"
                                        >
                                          <MapPin className="h-4 w-4 mr-2" />
                                          Select on Map
                                        </Button>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        You can either paste a map embed URL or click "Select on Map" to choose a location interactively using OpenStreetMap
                                      </p>
                                    </div>                                    {watchedBranches?.[index]?.mapLocation && (
                                      <div className="mt-4">
                                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Map Preview</label>
                                        <MapPreview
                                          mapLocation={watchedBranches[index].mapLocation}
                                          branchName={watchedBranches[index].name || `Branch #${index + 1}`}
                                          height={200}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p>No branch maps added yet. Click "Add Branch Map" to get started.</p>
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
      
      {/* Map Selector Modal */}
      <MapSelector
        isOpen={isMapSelectorOpen}
        onClose={() => setIsMapSelectorOpen(false)}
        onLocationSelect={handleLocationSelect}
        branchName={selectedBranchIndex !== null ? watch(`branches.${selectedBranchIndex}.name`) : undefined}
      />
    </div>
  );
};

export default ContactMap;
