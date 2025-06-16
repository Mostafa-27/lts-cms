import { ChevronDown, Plus, Trash2, Settings } from "lucide-react";
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
import { contactDefaultData } from '../../../../../utils/contactDefaultData';

interface BusinessHours {
  weekdays: string;
  saturday: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  businessHours: BusinessHours;
}

interface ContactInfoFormData {
  title: string;
  description: string;
  branches: Branch[];
}

const SECTION_ID = 17; // Contact Info section ID

const ContactInfo: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('17');
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<ContactInfoFormData>({
    defaultValues: {
      title: '',
      description: '',
      branches: [],
    },
  });

  const { fields: branchFields, append: appendBranch, remove: removeBranch } = useFieldArray({
    control,
    name: "branches",
  });
  const watchedBranches = watch("branches");

  const [ConfirmDialog, confirmDialog] = useConfirmDialog();
  const [openBranches, setOpenBranches] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        if (content) {
          reset(content);
        } else {
          reset(contactDefaultData.ContactInfo);
        }
      } catch (error) {
        console.error('Failed to load contact info content:', error);
        reset(contactDefaultData.ContactInfo);
      }
    };
    loadContent();  }, [selectedLangId, reset]);

  const onSubmit: SubmitHandler<ContactInfoFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('Contact Info section updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update contact info content:', error);
      toast.error('Failed to update Contact Info section.');
    }
  };

  const toggleBranch = (branchId: number) => {
    setOpenBranches(prev => ({ ...prev, [branchId]: !prev[branchId] }));
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
                        render={({ field }) => <TextInput {...field} placeholder="Enter section title" />}
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => <TextInput {...field} placeholder="Enter section description" multiline rows={3} />}
                      />
                    </div>

                    {/* Branches */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Branches ({branchFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => appendBranch({ 
                            id: Date.now(),
                            name: 'New Office',
                            address: '',
                            phone: '',
                            email: '',
                            instagram: '',
                            facebook: '',
                            linkedin: '',
                            businessHours: {
                              weekdays: 'Mon - Fri: 9:00 AM - 6:00 PM',
                              saturday: 'Sat: 9:00 AM - 2:00 PM',
                            }
                          })}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Branch
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
                                        {watchedBranches?.[index]?.name || `Branch #${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const confirmed = await confirmDialog({
                                            title: 'Delete Branch',
                                            description: 'Are you sure you want to delete this branch?',
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
                                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Branch Name</label>
                                        <Controller
                                          name={`branches.${index}.name` as const}
                                          control={control}
                                          rules={{ required: 'Branch name is required' }}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter branch name" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Address</label>
                                        <Controller
                                          name={`branches.${index}.address` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter address" />}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                                        <Controller
                                          name={`branches.${index}.phone` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter phone number" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                                        <Controller
                                          name={`branches.${index}.email` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="Enter email address" />}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Instagram</label>
                                        <Controller
                                          name={`branches.${index}.instagram` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="Instagram URL" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Facebook</label>
                                        <Controller
                                          name={`branches.${index}.facebook` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="Facebook URL" />}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">LinkedIn</label>
                                        <Controller
                                          name={`branches.${index}.linkedin` as const}
                                          control={control}
                                          render={({ field }) => <TextInput {...field} placeholder="LinkedIn URL" />}
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Business Hours</label>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-xs font-medium mb-1 dark:text-gray-400">Weekdays</label>
                                          <Controller
                                            name={`branches.${index}.businessHours.weekdays` as const}
                                            control={control}
                                            render={({ field }) => <TextInput {...field} placeholder="Mon - Fri: 9:00 AM - 6:00 PM" />}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium mb-1 dark:text-gray-400">Saturday</label>
                                          <Controller
                                            name={`branches.${index}.businessHours.saturday` as const}
                                            control={control}
                                            render={({ field }) => <TextInput {...field} placeholder="Sat: 9:00 AM - 2:00 PM" />}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p>No branches added yet. Click "Add Branch" to get started.</p>
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

export default ContactInfo;
