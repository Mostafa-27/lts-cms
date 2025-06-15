import { Users, Clock, Globe, Award } from 'lucide-react';

// About sections default data
export const aboutDefaultData = {
  AboutHero: {
    heroImage: "/aboutus-hero2.jfif",
    title: "LTS",
    desc: "<p>Core focus on tourism with unmatched flexibility and expertise</p>",
    stats: [
      { icon: "Users", label: "Team Members", value: "350+" },
      { icon: "Clock", label: "Available", value: "24/7/365" },
      { icon: "Globe", label: "Countries", value: "Multiple" },
      { icon: "Award", label: "Years Experience", value: "10+" },
    ],
  },

  AboutMission: {
    title: "Our Mission & Vision",
    teamTitle: "Our Team",
    teamDescription:
      "Together with our 350 highly skilled employees, it is our mission to provide best-in-class service with greatest flexibility in a constantly changing environment.",
    supportTitle: "24/7 Support",
    supportDescription:
      "From friendly and knowledgeable customer care agents, to accountants and IT experts - we are here 24/7/365 to provide the perfect solution for your demand.",
    whyChooseTitle: "Why Choose LTS?",
    benefits: [
      {
        title: "Tourism Expertise",
        description: "Specialized knowledge in tourism and hospitality sector",
      },
      {
        title: "Flexible Solutions",
        description: "Adaptable services that grow with your business needs",
      },
      {
        title: "Quality Assurance",
        description: "Rigorous quality control and continuous improvement",
      },
    ],
  },

  AboutLeadership: {
    title: "Leadership Team",
    description:
      "Meet the experienced professionals leading our organization to success",
    managers: [
      {
        avatar: "/lukas.png",
        name: "Lukas Hirschl",
        position: "Director Call Center",
        description:
          "<p>Lukas Hirschl was born on July 16th 1991. Traveling is my passion – I was lucky that my father traveled the world with me</p>",
      },
    ],
  },

  AboutTeams: {
    title: "Our Global Presence",
    description:
      "Talented teams across multiple locations delivering excellence worldwide",
    teams: [
      {
        location: "Tirana",
        people: [
          {
            avatar: "/avatar1.png",
            name: "Leonard Ferazini",
            position: "Director Call Center",
          },
          {
            avatar: "/avatar2.png",
            name: "Sarah Johnson",
            position: "Operations Manager",
          },
          {
            avatar: "/avatar3.png",
            name: "Michael Chen",
            position: "Quality Assurance Lead",
          },
        ],
      },
      {
        location: "Kosovo",
        people: [
          {
            avatar: "/avatar4.png",
            name: "Elena Rodriguez",
            position: "Regional Manager",
          },
          {
            avatar: "/avatar4.png",
            name: "David Thompson",
            position: "Customer Success Lead",
          },
          {
            avatar: "/avatar4.png",
            name: "Anna Petrov",
            position: "Training Coordinator",
          },
        ],
      },
    ],
  },

  AboutCertificates: {
    title: "Certifications & Standards",
    description:
      "Committed to excellence through internationally recognized standards",
    certificates: [
      {
        logo: "",
        title: "ISO 9001:2015 Quality Management",
      },
      {
        logo: "",
        title: "ISO 27001 Information Security",
      },
      {
        logo: "",
        title: "GDPR Compliance Certification",
      },
    ],
  },

  AboutCTA: {
    title: "Ready to Experience the LTS Difference?",
    description:
      "Join hundreds of satisfied clients who trust us with their BPO needs",
  },
};
