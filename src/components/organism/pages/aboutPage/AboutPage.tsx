import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../ui/accordion';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { SplitLayout } from '../../layouts/SplitLayout';
import { FullscreenModal } from '../../../molecules/FullscreenModal';
import { useFullscreen } from '../../../../hooks/useFullscreen';

// Import About Sections
import AboutHero from '../../sections/AboutSections/AboutHero/AboutHero';
import AboutMission from '../../sections/AboutSections/AboutMission/AboutMission';
import AboutLeadership from '../../sections/AboutSections/AboutLeadership/AboutLeadership';
import AboutTeams from '../../sections/AboutSections/AboutTeams/AboutTeams';
import AboutCertificates from '../../sections/AboutSections/AboutCertificates/AboutCertificates';
import AboutCTA from '../../sections/AboutSections/AboutCTA/AboutCTA';

import { Settings, Target, Users, MapPin, Award, Maximize2 } from 'lucide-react';

// Define sections for better organization
const sections = [
  { 
    id: '20', 
    name: 'Hero', 
    component: AboutHero, 
    anchor: 'about-hero',
    hasTabs: false,
    icon: Target,
  },
  { 
    id: '21', 
    name: 'Mission & Vision', 
    component: AboutMission, 
    anchor: 'about-mission',
    hasTabs: false,
    icon: Target,
  },
  { 
    id: '22', 
    name: 'Leadership', 
    component: AboutLeadership, 
    anchor: 'about-leadership',
    hasTabs: false,
    icon: Users,
  },
  { 
    id: '23', 
    name: 'Teams', 
    component: AboutTeams, 
    anchor: 'about-teams',
    hasTabs: false,
    icon: MapPin,
  },
  { 
    id: '24', 
    name: 'Certificates', 
    component: AboutCertificates, 
    anchor: 'about-certificates',
    hasTabs: false,
    icon: Award,
  },
  { 
    id: '25', 
    name: 'CTA', 
    component: AboutCTA, 
    anchor: 'about-cta',
    hasTabs: false,
    icon: Settings,
  },
];

const AboutPageContent: React.FC = () => {
  const { 
    fullscreenSection, 
    isExiting, 
    isLoading, 
    enterFullscreen, 
    exitFullscreen 
  } = useFullscreen();

  // If in fullscreen mode, render only the fullscreen section
  if (fullscreenSection) {
    const { section, SectionComponent } = fullscreenSection;
    return (
      <FullscreenModal
        isOpen={!!fullscreenSection}
        isExiting={isExiting}
        isLoading={isLoading}
        section={section}
        onClose={exitFullscreen}
      >
        <SplitLayout 
          previewUrl={`https://gh-website-nu.vercel.app/sections/${section.id}`}
          focusSection={section.anchor}
          exitFullscreen={exitFullscreen}
          fullscreenSection={!!fullscreenSection}
        >
          <SectionComponent />
        </SplitLayout>
      </FullscreenModal>
    );
  }

  return (    
    <div className="flex-grow bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6 mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-4">About Page Content Management</h1>
        </Card>       
         
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={[sections[0].id]} // Only first section open by default
        >
          {sections.map((section) => {
            const SectionComponent = section.component;
            const IconComponent = section.icon;
            return (
              <AccordionItem key={section.id} value={section.id} className="bg-white dark:bg-gray-800 rounded-lg mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div className="text-left">
                        <span className="text-lg font-medium dark:text-gray-200">{section.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mr-4">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          enterFullscreen(section, SectionComponent);
                        }}
                        className="rounded-full h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title="Open in fullscreen (press ESC to exit)"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-1 py-2">
                    <SplitLayout 
                      previewUrl={`https://gh-website-nu.vercel.app/sections/${section.id}`}
                      focusSection={section.anchor}
                      exitFullscreen={exitFullscreen}
                      fullscreenSection={!!fullscreenSection}
                    >
                      <SectionComponent />
                    </SplitLayout>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default AboutPageContent;
