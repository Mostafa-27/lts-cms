import React, { useEffect, useState } from 'react';
import { Controller, useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { fetchContent, updateSectionContent } from '../../../../../services/contentService';
import { useSectionLanguage } from '../../../../../contexts/LanguageContext';
import { HTMLEditor } from '../../../../molecules/HTMLEditor';
import { TextInput } from '../../../../molecules/textinput';
import { ImagePicker } from '../../../../molecules/imagePicker';
import { Button } from '../../../../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { useSplitLayout } from '../../../../../contexts/SplitLayoutContext';
import { aboutDefaultData } from '../../../../../utils/aboutDefaultData';
import { Plus, Trash2, MapPin, Users, ChevronDown } from 'lucide-react';
import { useConfirmDialog } from '../../../../../hooks/use-confirm-dialog';

interface ImageData {
  imageUrl: string;
  imageAlt: string;
}

interface Person {
  avatar: string;
  name: string;
  position: string;
}

interface Team {
  location: string;
  people: Person[];
}

interface AboutTeamsFormData {
  title: string;
  description: string;
  teams: Team[];
}

const SECTION_ID = 23; // About Teams section ID

const AboutTeams: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { refreshPreview } = useSplitLayout();
  
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<AboutTeamsFormData>({
    defaultValues: {
      title: '',
      description: '',
      teams: [],
    },
  });

  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({
    control,
    name: "teams",
  });

  const watchedTeams = watch("teams");  const [openTeams, setOpenTeams] = useState<{ [key: number]: boolean }>({});

  const [ConfirmDialog, confirmDialog] = useConfirmDialog();
  
  // Use shared language context
  // Use section-specific language management
  const { languages, selectedLangId, handleTabChange } = useSectionLanguage('23');

  useEffect(() => {
    const loadContent = async () => {
      if (selectedLangId === null) return;
      try {
        const data = await fetchContent(SECTION_ID, selectedLangId);
        const content = data?.content;
        if (content) {
          reset(content);
        } else {
          reset(aboutDefaultData.AboutTeams);
        }
      } catch (error) {
        console.error('Failed to load about teams content:', error);
        reset(aboutDefaultData.AboutTeams);
      }
    };
    loadContent();
  }, [selectedLangId, reset]);
  const toggleTeam = (teamId: number) => {
    setOpenTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const addPersonToTeam = (teamIndex: number) => {
    const currentTeam = watchedTeams[teamIndex];
    const updatedPeople = [
      ...currentTeam.people,
      { avatar: '/avatar1.png', name: '', position: '' }
    ];
    // Update the form with new person
    reset({
      ...watchedTeams,
      teams: watchedTeams.map((team, index) => 
        index === teamIndex ? { ...team, people: updatedPeople } : team
      )
    });
  };

  const removePersonFromTeam = async (teamIndex: number, personIndex: number) => {
    const confirmed = await confirmDialog({
      title: 'Remove Person',
      description: 'Are you sure you want to remove this person?',
      confirmButtonText: 'Remove',
      confirmButtonVariant: 'destructive'
    });

    if (confirmed) {
      const currentTeam = watchedTeams[teamIndex];
      const updatedPeople = currentTeam.people.filter((_, index) => index !== personIndex);
      reset({
        ...watchedTeams,
        teams: watchedTeams.map((team, index) => 
          index === teamIndex ? { ...team, people: updatedPeople } : team
        )
      });
    }
  };

  const onSubmit: SubmitHandler<AboutTeamsFormData> = async (data) => {
    if (selectedLangId === null) {
      toast.warning('Please select a language.');
      return;
    }
    try {
      await updateSectionContent(SECTION_ID, selectedLangId, data);
      toast.success('About Teams section updated successfully!');
      refreshPreview();
    } catch (error) {
      console.error('Failed to update about teams content:', error);
      toast.error('Failed to update About Teams section.');
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
                        render={({ field }) => <TextInput {...field} placeholder="Our Global Presence" />}
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

                    {/* Teams Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-200">Teams ({teamFields.length})</h3>
                        <Button
                          type="button"
                          onClick={() => {
                            appendTeam({ 
                              location: '', 
                              people: []
                            });
                            setOpenTeams(prev => ({ ...prev, [teamFields.length]: true }));
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Team
                        </Button>
                      </div>
                      
                      {teamFields.length > 0 ? (
                        <div className="space-y-4">
                          {teamFields.map((item, teamIndex) => (
                            <Card key={item.id} className="border">
                              <Collapsible open={openTeams[teamIndex]} onOpenChange={() => toggleTeam(teamIndex)}>
                                <CollapsibleTrigger asChild>
                                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                    <CardTitle className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                        <span>{watchedTeams?.[teamIndex]?.location || `Team #${teamIndex + 1}`}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            const confirmed = await confirmDialog({
                                              title: 'Delete Team',
                                              description: 'Are you sure you want to delete this team?',
                                              confirmButtonText: 'Delete',
                                              confirmButtonVariant: 'destructive'
                                            });
                                            if (confirmed) {
                                              removeTeam(teamIndex);
                                            }
                                          }}
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${openTeams[teamIndex] ? "rotate-180" : ""}`} />
                                      </div>
                                    </CardTitle>
                                  </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Location</label>
                                      <Controller
                                        name={`teams.${teamIndex}.location` as const}
                                        control={control}
                                        rules={{ required: 'Location is required' }}
                                        render={({ field }) => <TextInput {...field} placeholder="Tirana" />}
                                      />
                                    </div>

                                    <div>
                                      <div className="flex justify-between items-center mb-4">
                                        <label className="block text-sm font-medium dark:text-gray-300">Team Members</label>
                                        <Button
                                          type="button"
                                          onClick={() => addPersonToTeam(teamIndex)}
                                          variant="outline"
                                          size="sm"
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add Person
                                        </Button>
                                      </div>

                                      {watchedTeams?.[teamIndex]?.people?.map((person, personIndex) => (
                                        <div key={personIndex} className="border rounded-lg p-4 mb-4 bg-gray-100 dark:bg-gray-600">
                                          <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                              <Users className="h-4 w-4 text-green-500" />
                                              <span className="font-medium text-sm">
                                                {person.name || `Person #${personIndex + 1}`}
                                              </span>
                                            </div>
                                            <Button
                                              type="button"
                                              onClick={() => removePersonFromTeam(teamIndex, personIndex)}
                                              variant="ghost"
                                              size="sm"
                                              className="text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>

                                          <div className="space-y-4">
                                            <div>
                                              <Controller
                                                name={`teams.${teamIndex}.people.${personIndex}.avatar` as const}
                                                control={control}
                                                render={({ field }) => (
                                                  <ImagePicker
                                                    label="Avatar"
                                                    value={field.value}
                                                    onImageChange={(imageData: ImageData) => field.onChange(imageData.imageUrl)}
                                                  />
                                                )}
                                              />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-300">Name</label>
                                                <Controller
                                                  name={`teams.${teamIndex}.people.${personIndex}.name` as const}
                                                  control={control}
                                                  rules={{ required: 'Name is required' }}
                                                  render={({ field }) => <TextInput {...field} placeholder="Leonard Ferazini" />}
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-300">Position</label>
                                                <Controller
                                                  name={`teams.${teamIndex}.people.${personIndex}.position` as const}
                                                  control={control}
                                                  rules={{ required: 'Position is required' }}
                                                  render={({ field }) => <TextInput {...field} placeholder="Director Call Center" />}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                      {(!watchedTeams?.[teamIndex]?.people || watchedTeams?.[teamIndex]?.people?.length === 0) && (
                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400 border border-dashed rounded">
                                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                          <p className="text-sm">No team members added yet.</p>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </CollapsibleContent>
                              </Collapsible>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p>No teams added yet. Click "Add Team" to get started.</p>
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

export default AboutTeams;
