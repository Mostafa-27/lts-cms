import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { LanguageProvider, useLanguage } from '../../../../contexts/LanguageContext';

// Import Career Sections
import CareerHero from '../../sections/CareerSections/CareerHero/CareerHero';
import CareerIntro from '../../sections/CareerSections/CareerIntro/CareerIntro';
import CareerPositions from '../../sections/CareerSections/CareerPositions/CareerPositions';
import CareerBenefits from '../../sections/CareerSections/CareerBenefits/CareerBenefits';

import { Briefcase, Users, Award, Target, Maximize2 } from 'lucide-react';

// Define sections for better organization
const sections = [
  { 
    id: '10', 
    name: 'Hero', 
    component: CareerHero, 
    anchor: 'career-hero',
    hasTabs: false,
    icon: Target,
  },
  { 
    id: '12', 
    name: 'Intro', 
    component: CareerIntro, 
    anchor: 'career-intro',
    hasTabs: false,
    icon: Users,
  },
  { 
    id: '13', 
    name: 'Open Positions', 
    component: CareerPositions, 
    anchor: 'career-positions',
    hasTabs: false,
    icon: Briefcase,
  },
  { 
    id: '11', 
    name: 'Benefits', 
    component: CareerBenefits, 
    anchor: 'career-benefits',
    hasTabs: false,
    icon: Award,
  },
];

const CareerPageContent: React.FC = () => {
  const { 
    fullscreenSection, 
    isExiting, 
    isLoading, 
    enterFullscreen, 
    exitFullscreen 
  } = useFullscreen();  const { getActiveLanguageCode, languages } = useLanguage();
  const [languageUpdateKey, setLanguageUpdateKey] = useState(0);

  // Track language changes to force preview URL updates
  useEffect(() => {
    setLanguageUpdateKey(prev => prev + 1);
  }, [languages]);

   const buildPreviewUrl = (sectionId: string) => {
    const baseUrl = `https://gh-website-nu.vercel.app/sections/${sectionId}`;
    const languageCode = getActiveLanguageCode(sectionId);
    const url = languageCode ? `${baseUrl}?lang=${languageCode}` : baseUrl;
    return url;
  }; // Use languageUpdateKey to force updates

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
      >        <SplitLayout 
          previewUrl={buildPreviewUrl(section.id)}
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
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-4">Career Page Content Management</h1>
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
                  <div className="px-1 py-2">                    <SplitLayout 
                      previewUrl={buildPreviewUrl(section.id)}
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

const CareerPage: React.FC = () => {
  return (
    <LanguageProvider>
      <CareerPageContent />
    </LanguageProvider>
  );
};

export default CareerPage;
