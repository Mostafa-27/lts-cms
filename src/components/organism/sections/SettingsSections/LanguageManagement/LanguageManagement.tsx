import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import type { Language } from '@/services/languageService';
import { languageManagementService } from '@/services/languageManagementService';
import { getImageUrl } from '@/utils/env';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
 
const LanguageManagement: React.FC = () => {
  const [notAddedLanguages, setNotAddedLanguages] = useState<Language[]>([]);
  const [addedLanguages, setAddedLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [activeStatusChanges, setActiveStatusChanges] = useState<Record<string, boolean>>({});
  const [ConfirmDialog, confirmDialog] = useConfirmDialog();

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    setIsLoading(true);
    try {
      const [notAdded, added] = await Promise.all([
        languageManagementService.getNotAddedLanguages(),
        languageManagementService.getAddedLanguages()
      ]);
      
      setNotAddedLanguages(notAdded);
      setAddedLanguages(added);
      
      // Initialize active status changes with current values
      const initialActiveStatus: Record<string, boolean> = {};
      added.forEach(lang => {
        if (lang.code) {
          initialActiveStatus[lang.code] = !!lang.active;
        }
      });
      setActiveStatusChanges(initialActiveStatus);
    } catch (error) {
      toast.error('Failed to load languages');
      console.error('Error loading languages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelection = (code: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleAddSelectedLanguages = async () => {
    if (selectedLanguages.length === 0) {
      toast.error('Please select at least one language to add');
      return;
    }

    try {
      setIsLoading(true);
      const promises = selectedLanguages.map(code => 
        languageManagementService.updateLanguageAddedStatus(code, true)
      );
      await Promise.all(promises);
      
      toast.success(`Successfully added ${selectedLanguages.length} language(s)`);
      setSelectedLanguages([]);
      loadLanguages();
    } catch (error) {
      toast.error('Failed to add selected languages');
      console.error('Error adding languages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLanguage = async (language: Language) => {
    if (!language.code) {
      toast.error('Cannot remove language without a code');
      return;
    }

    const confirmed = await confirmDialog({
      title: 'Remove Language',
      description: `Are you sure you want to remove "${language.name}" from your added languages? This will not delete the language from the system.`,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
      confirmButtonVariant: 'destructive',
    });

    if (confirmed) {
      try {
        await languageManagementService.updateLanguageAddedStatus(language.code, false);
        toast.success(`Language "${language.name}" removed successfully`);
        loadLanguages();
      } catch (error) {
        toast.error('Failed to remove language');
        console.error('Error removing language:', error);
      }
    }
  };

  const handleActiveStatusChange = (code: string, isActive: boolean) => {
    setActiveStatusChanges(prev => ({
      ...prev,
      [code]: isActive
    }));
  };

  const saveActiveStatusChanges = async () => {
    try {
      setIsLoading(true);
      const promises = Object.entries(activeStatusChanges).map(([code, active]) => 
        languageManagementService.updateLanguageActiveStatus(code, active)
      );
      await Promise.all(promises);
      
      toast.success('Language status updated successfully');
      loadLanguages();
    } catch (error) {
      toast.error('Failed to update language status');
      console.error('Error updating language status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold dark:text-gray-200">Language Management</h3>
      </div>

      {/* Available Languages Section */}
      <div className="border rounded-md p-4 dark:border-gray-600">
        <h4 className="text-md font-semibold mb-4 dark:text-gray-200">Available Languages</h4>
        
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading languages...</p>
          </div>
        ) : (
          <>
            {notAddedLanguages.length === 0 ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">No available languages found</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {notAddedLanguages.map((language) => (
                    <div
                      key={language.id}
                      className={`border rounded-md p-3 flex items-center cursor-pointer transition-colors ${
                        selectedLanguages.includes(language.code) 
                          ? 'bg-blue-50 border-blue-300 dark:bg-gray-700 dark:border-blue-500' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600'
                      }`}
                      onClick={() => handleLanguageSelection(language.code)}
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <img
                          src={getImageUrl(language.icon)}
                          alt={language.name}
                          className="w-6 h-6 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div>
                          <p className="font-medium dark:text-gray-200">{language.name}</p>
                          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            {language.code}
                          </span>
                        </div>
                      </div>
                      <Checkbox 
                        checked={selectedLanguages.includes(language.code)}
                        onCheckedChange={() => {}}
                        className="ml-2"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddSelectedLanguages}
                    disabled={selectedLanguages.length === 0 || isLoading}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Selected Languages
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Added Languages Section */}
      <div className="border rounded-md p-4 dark:border-gray-600">
        <h4 className="text-md font-semibold mb-4 dark:text-gray-200">Added Languages</h4>
        
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading languages...</p>
          </div>
        ) : (
          <>
            {addedLanguages.length === 0 ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">No added languages found</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="text-left p-3 border-b dark:border-gray-600">Language</th>
                        <th className="text-left p-3 border-b dark:border-gray-600">Code</th>
                        <th className="text-center p-3 border-b dark:border-gray-600">Active</th>
                        <th className="text-right p-3 border-b dark:border-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addedLanguages.map((language) => (
                        <tr key={language.id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-3 flex items-center gap-2">
                            {language.icon && (
                              <img
                                src={getImageUrl(language.icon)}
                                alt={language.name}
                                className="w-5 h-5 rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <span className="dark:text-gray-200">{language.name}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                              {language.code}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {language.code && (
                              <Checkbox 
                                checked={!!activeStatusChanges[language.code]}
                                onCheckedChange={(checked: boolean | "indeterminate") => 
                                  handleActiveStatusChange(language.code, checked === true)
                                }
                              />
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveLanguage(language)}
                              className="flex items-center gap-1"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={saveActiveStatusChanges}
                    className="flex items-center gap-2"
                    disabled={isLoading || addedLanguages.length === 0}
                  >
                    <Save className="h-4 w-4" />
                    Save Active Status
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LanguageManagement;
