import React, { useState } from "react";
import { Settings,  Globe,  } from "lucide-react";
import LanguageManagement from "../organism/sections/SettingsSections/LanguageManagement/LanguageManagement";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

// Settings sections configuration
const settingsSections = [
  {
    id: 'language-management',
    title: 'Language Management',
    description: 'Manage application languages and localization settings',
    icon: Globe,
    status: 'active',
    component: LanguageManagement,
  }
  // ,
  // {
  //   id: 'user-management',
  //   title: 'User Management',
  //   description: 'Manage user accounts, roles, and permissions',
  //   icon: Users,
  //   status: 'coming-soon',
  //   component: null,
  // },
  // {
  //   id: 'security-settings',
  //   title: 'Security Settings',
  //   description: 'Configure authentication, authorization, and security policies',
  //   icon: Shield,
  //   status: 'coming-soon',
  //   component: null,
  // },
  // {
  //   id: 'system-configuration',
  //   title: 'System Configuration',
  //   description: 'General system settings and preferences',
  //   icon: Server,
  //   status: 'coming-soon',
  //   component: null,
  // },
  // {
  //   id: 'notification-settings',
  //   title: 'Notification Settings',
  //   description: 'Configure email notifications and alerts',
  //   icon: Bell,
  //   status: 'coming-soon',
  //   component: null,
  // },
  // {
  //   id: 'appearance-settings',
  //   title: 'Appearance & Themes',
  //   description: 'Customize the application appearance and themes',
  //   icon: Palette,
  //   status: 'coming-soon',
  //   component: null,
  // },
  // {
  //   id: 'database-settings',
  //   title: 'Database Settings',
  //   description: 'Database connections and backup configurations',
  //   icon: Database,
  //   status: 'coming-soon',
  //   component: null,
  // },
];

const SettingsPage: React.FC = () => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-8 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold dark:text-gray-100">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your application settings and configurations
            </p>
          </div>
        </div>

        {/* Settings Overview */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{settingsSections.length}</div>
              <p className="text-xs text-muted-foreground">Configuration areas</p>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {settingsSections.filter(s => s.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">Ready to use</p>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {settingsSections.filter(s => s.status === 'coming-soon').length}
              </div>
              <p className="text-xs text-muted-foreground">In development</p>
            </CardContent>
          </Card>
        </div> */}

        {/* Settings Sections */}
        <div className="space-y-4">
          {settingsSections.map((section) => {
            const IconComponent = section.icon;
            const isCollapsed = collapsedSections.has(section.id);
            const isActive = section.status === 'active';
            
            return (
              <Card key={section.id} className="dark:bg-gray-800 dark:border-gray-700">
                <Collapsible open={!isCollapsed} onOpenChange={() => toggleSection(section.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {section.title}
                              <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                                {section.status === 'active' ? 'Active' : 'Coming Soon'}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {section.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Settings className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent>
                      {isActive && section.component ? (
                        <section.component />
                      ) : (
                        <div className="py-8 text-center">
                          <div className="mx-auto flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                            <IconComponent className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {section.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            This feature is currently under development and will be available in a future update.
                          </p>
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

