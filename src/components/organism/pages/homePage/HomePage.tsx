import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../ui/accordion';
import { Card } from '../../../ui/card';
import { SplitLayout } from '../../layouts/SplitLayout';
import { HomeAboutusSection } from '../../sections/HomeSections/HomeAboutusSection';
import HomeAnalyticsSection from '../../sections/HomeSections/HomeAnalytics/HomeAnalytics';
import { HomeCTASection } from '../../sections/HomeSections/HomeCTAsection';
import HomeCustomersSection from '../../sections/HomeSections/homeCustomers/HomeCustomers';
import { HomeHeroSection } from '../../sections/HomeSections/HomeHerosection';
import { HomeServicesSection } from '../../sections/HomeSections/HomeServices';
import { HomeSustainabilitySection } from '../../sections/HomeSections/HomeSustainability';
import HomeTestimonialsSection from '../../sections/HomeSections/HomeTestimonials/HomeTestimonials';
import HomeTimelineSection from '../../sections/HomeSections/HomeTimeline/HomeTimeline';

import { BarChart3, Clock, Heart, Layout, Lightbulb, Settings, Target, Users } from 'lucide-react';

// Define sections for better organization
const sections = [
  { 
    id: '1', 
    name: 'Hero', 
    component: HomeHeroSection, 
    anchor: 'hero',
    hasTabs: false,
    icon: Layout,
    description: 'Main landing section with primary messaging'
  },
  { 
    id: '2', 
    name: 'About Us', 
    component: HomeAboutusSection, 
    anchor: 'about',
    hasTabs: false,
    icon: Users,
    description: 'Company information and team details'
  },
  { 
    id: '3', 
    name: 'Analytics', 
    component: HomeAnalyticsSection, 
    anchor: 'analytics',
    hasTabs: true,
    icon: BarChart3,
    description: 'Statistics and performance metrics'
  },
  { 
    id: '4', 
    name: 'Timeline', 
    component: HomeTimelineSection, 
    anchor: 'timeline',
    hasTabs: true,
    icon: Clock,
    description: 'Company history and milestones'
  },
  { 
    id: '5', 
    name: 'Customers', 
    component: HomeCustomersSection, 
    anchor: 'customers',
    hasTabs: false,
    icon: Users,
    description: 'Customer testimonials and case studies'
  },
  { 
    id: '6', 
    name: 'Testimonials', 
    component: HomeTestimonialsSection, 
    anchor: 'testimonials',
    hasTabs: false,
    icon: Heart,
    description: 'Client feedback and reviews'
  },
  { 
    id: '7', 
    name: 'Services', 
    component: HomeServicesSection, 
    anchor: 'services',
    hasTabs: false,
    icon: Settings,
    description: 'Service offerings and capabilities'
  },
  { 
    id: '8', 
    name: 'Sustainability', 
    component: HomeSustainabilitySection, 
    anchor: 'sustainability',
    hasTabs: false,
    icon: Lightbulb,
    description: 'Environmental initiatives and goals'
  },
  { 
    id: '9', 
    name: 'CTA', 
    component: HomeCTASection, 
    anchor: 'cta',
    hasTabs: false,
    icon: Target,
    description: 'Call-to-action and contact information'
  },
];

const HomePageContent: React.FC = () => {
     return (    <div className="flex-grow bg-gray-50 dark:bg-gray-900 min-h-screen">
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
        >
          {sections.map((section) => {
            const SectionComponent = section.component;
            return (              <AccordionItem key={section.id} value={section.id} className="bg-white dark:bg-gray-800 rounded-lg mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
                  <span className="text-lg font-medium dark:text-gray-200">{section.name}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-1 py-2">
                    <SplitLayout 
                      previewUrl={`https://gh-website-nu.vercel.app/sections/${section.id}`}
                      focusSection={section.anchor}
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
