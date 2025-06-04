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
import { HomeAboutusSection } from '../../sections/HomeSections/HomeAboutusSection';
import HomeAnalyticsSection from '../../sections/HomeSections/HomeAnalytics/HomeAnalytics';
import { HomeCTASection } from '../../sections/HomeSections/HomeCTAsection';
import HomeCustomersSection from '../../sections/HomeSections/homeCustomers/HomeCustomers';
import { HomeHeroSection } from '../../sections/HomeSections/HomeHerosection';
import { HomeServicesSection } from '../../sections/HomeSections/HomeServices';
import { HomeSustainabilitySection } from '../../sections/HomeSections/HomeSustainability';
import HomeTestimonialsSection from '../../sections/HomeSections/HomeTestimonials/HomeTestimonials';
import HomeTimelineSection from '../../sections/HomeSections/HomeTimeline/HomeTimeline';
import { useFullscreen } from '../../../../hooks/useFullscreen';

import { BarChart3, Clock, Heart, Layout, Lightbulb, Settings, Target, Users, Maximize2, X } from 'lucide-react';

// Define sections for better organization
const sections = [
  { 
    id: '1', 
    name: 'Hero', 
    component: HomeHeroSection, 
    anchor: 'hero',
    hasTabs: false,
    icon: Layout,
 
  },
  { 
    id: '2', 
    name: 'About Us', 
    component: HomeAboutusSection, 
    anchor: 'about',
    hasTabs: false,
    icon: Users,
 
  },
  { 
    id: '3', 
    name: 'Analytics', 
    component: HomeAnalyticsSection, 
    anchor: 'analytics',
    hasTabs: true,
    icon: BarChart3,
 
  },
  { 
    id: '4', 
    name: 'Timeline', 
    component: HomeTimelineSection, 
    anchor: 'timeline',
    hasTabs: true,
    icon: Clock,
 
  },
  { 
    id: '5', 
    name: 'Customers', 
    component: HomeCustomersSection, 
    anchor: 'customers',
    hasTabs: false,
    icon: Users,
 
  },
  { 
    id: '6', 
    name: 'Testimonials', 
    component: HomeTestimonialsSection, 
    anchor: 'testimonials',
    hasTabs: false,
    icon: Heart,
 
  },
  { 
    id: '7', 
    name: 'Services', 
    component: HomeServicesSection, 
    anchor: 'services',
    hasTabs: false,
    icon: Settings,
 
  },
  { 
    id: '8', 
    name: 'Sustainability', 
    component: HomeSustainabilitySection, 
    anchor: 'sustainability',
    hasTabs: false,
    icon: Lightbulb,
 
  },
  { 
    id: '9', 
    name: 'CTA', 
    component: HomeCTASection, 
    anchor: 'cta',
    hasTabs: false,
    icon: Target,
    
  },
];

const HomePageContent: React.FC = () => {
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
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-4">Home Page Content Management</h1>
          
          {/* <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select Section to Edit
            </label>
            <Select value={activeSection} onValueChange={handleSectionChange}>
              <SelectTrigger className="w-full md:w-[300px] border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}        </Card>       
         <Accordion
          type="multiple"
          className="w-full"
          defaultValue={[sections[0].id]} // Only first section open by default
        >          {sections.map((section) => {
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
                    </div>                    <div className="flex items-center gap-2 mr-4">
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

export default HomePageContent;
