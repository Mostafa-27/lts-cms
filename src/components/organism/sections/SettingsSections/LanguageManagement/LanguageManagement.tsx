import React, { useEffect, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';
import { languageManagementService, type Language, type CreateLanguageData, type UpdateLanguageData } from '../../../../../services/languageManagementService';
import { Button } from '../../../../ui/button';
import { TextInput } from '../../../../molecules/textinput';
import { ImagePicker } from '../../../../molecules/imagePicker';
import { getImageUrl } from '../../../../../utils/env';

interface LanguageFormData {
  name: string;
  code: string;
  icon: string;
}

const LanguageManagement: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<LanguageFormData>({
    defaultValues: {
      name: '',
      code: '',
      icon: '',
    },
  });

  const { control: editControl, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { errors: editErrors } } = useForm<LanguageFormData>({
    defaultValues: {
      name: '',
      code: '',
      icon: '',
    },
  });

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    setIsLoading(true);
    try {
      const data = await languageManagementService.getLanguages();
      setLanguages(data);
    } catch (error) {
      toast.error('Failed to load languages');
      console.error('Error loading languages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateSubmit: SubmitHandler<LanguageFormData> = async (data) => {
    try {
      const createData: CreateLanguageData = {
        name: data.name,
        code: data.code,
        icon: data.icon,
      };
      
      await languageManagementService.createLanguage(createData);
      toast.success('Language created successfully');
      reset();
      setShowCreateForm(false);
      loadLanguages();
    } catch (error) {
      toast.error('Failed to create language');
      console.error('Error creating language:', error);
    }
  };

  const onEditSubmit: SubmitHandler<LanguageFormData> = async (data) => {
    if (!editingLanguage) return;

    try {
      const updateData: UpdateLanguageData = {
        name: data.name,
        icon: data.icon,
      };
      
      await languageManagementService.updateLanguage(editingLanguage.code, updateData);
      toast.success('Language updated successfully');
      setEditingLanguage(null);
      resetEdit();
      loadLanguages();
    } catch (error) {
      toast.error('Failed to update language');
      console.error('Error updating language:', error);
    }
  };
  const handleDelete = async (language: Language) => {
    const confirmed = await confirmDialog({
      title: 'Delete Language',
      description: `Are you sure you want to delete "${language.name}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonVariant: 'destructive',
    });

    if (confirmed) {
      try {
        await languageManagementService.deleteLanguage(language.code);
        toast.success('Language deleted successfully');
        loadLanguages();
      } catch (error) {
        toast.error('Failed to delete language');
        console.error('Error deleting language:', error);
      }
    }
  };

  const handleEdit = (language: Language) => {
    setEditingLanguage(language);
    resetEdit({
      name: language.name,
      code: language.code,
      icon: language.icon,
    });
  };

  const cancelEdit = () => {
    setEditingLanguage(null);
    resetEdit();
  };

  const cancelCreate = () => {
    setShowCreateForm(false);
    reset();
  };
  return (
    <div className="space-y-6">
      <ConfirmDialog />
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold dark:text-gray-200">Available Languages</h3>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
              disabled={showCreateForm}
            >
              <Plus className="h-4 w-4" />
              Add Language
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <h4 className="text-md font-semibold mb-4 dark:text-gray-200">Create New Language</h4>
              <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Language name is required' }}
                    render={({ field }) => (
                      <TextInput
                        label="Language Name"
                        placeholder="Enter language name"
                        error={errors.name?.message}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="code"
                    control={control}
                    rules={{ 
                      required: 'Language code is required',
                      pattern: {
                        value: /^[a-z]{2}$/,
                        message: 'Language code must be 2 lowercase letters (e.g., en, fr, es)'
                      }
                    }}
                    render={({ field }) => (
                      <TextInput
                        label="Language Code"
                        placeholder="e.g., en, fr, es"
                        error={errors.code?.message}
                        {...field}
                      />
                    )}
                  />
                </div>                <Controller
                  name="icon"
                  control={control}
                  rules={{ required: 'Language icon is required' }}
                  render={({ field }) => (
                    <div>
                      <ImagePicker
                        label="Language Icon"
                        value={{ imageUrl: field.value, imageAlt: 'Language icon' }}
                        onImageChange={(data) => field.onChange(data.imageUrl)}
                      />
                      {errors.icon && (
                        <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>
                      )}
                    </div>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Language
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelCreate}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Languages List */}
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading languages...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {languages.length === 0 ? (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">No languages found</p>
              ) : (
                languages.map((language) => (
                  <div
                    key={language.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {editingLanguage?.id === language.id ? (
                      <form onSubmit={handleEditSubmit(onEditSubmit)} className="flex-1 flex items-center gap-4">                        <div className="flex items-center gap-2">
                          <img
                            src={getImageUrl(language.icon)}
                            alt={language.name}
                            className="w-6 h-6 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            {language.code}
                          </span>
                        </div>
                        <div className="flex-1 flex gap-2">
                          <Controller
                            name="name"
                            control={editControl}
                            rules={{ required: 'Language name is required' }}
                            render={({ field }) => (
                              <TextInput
                                placeholder="Language name"
                                error={editErrors.name?.message}
                                {...field}
                              />
                            )}
                          />                          <Controller
                            name="icon"
                            control={editControl}
                            rules={{ required: 'Language icon is required' }}
                            render={({ field }) => (
                              <div>
                                <ImagePicker
                                  value={{ imageUrl: field.value, imageAlt: 'Language icon' }}
                                  onImageChange={(data) => field.onChange(data.imageUrl)}
                                />
                                {editErrors.icon && (
                                  <p className="text-red-500 text-sm mt-1">{editErrors.icon.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="flex items-center gap-1">
                            <Save className="h-3 w-3" />
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                            className="flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(language.icon)}
                            alt={language.name}
                            className="w-6 h-6 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div>
                            <span className="font-medium dark:text-gray-200">{language.name}</span>
                            <span className="ml-2 font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                              {language.code}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(language)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(language)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>                ))
              )}
            </div>
          )}
    </div>
  );
};

export default LanguageManagement;
