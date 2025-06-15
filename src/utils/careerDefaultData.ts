// Career sections default data
export const careerDefaultData = {
  CareerHero: {
    title: "Join Our Team",
    subTitle: "Join our team and shape the future together.",
  },

  CareerIntro: {
    title: "Are you dedicated, hardworking and fun? Join us at LTS.!",
    desc: "<p>We have a corporate culture of a high performance work ethic, wonderful to corporate social responsibility...</p>",
  },

  CareerPositions: {
    title: "Open Positions",
    subTitle: "Find your perfect role and start your journey with us",
    applicationGuidelines: [
      "CV",
      "Testimonies",
      "Preferably all documents in one PDF file",
      "Alternatively, email us up to 3 attachments (maximum 4MB)",
      "Send us your documents to info@ghdialog.com",
      "We look forward to receiving your application",
    ],
    positions: [
      {
        id: 1,
        title: "Frontend Developer",
        description:
          "Responsible for building UI components and optimizing user experience.",
        location: "Remote/Hybrid",
        type: "Full-time",
        experience: "2-4 years",
        skills: ["React", "JavaScript", "CSS", "HTML"],
      },
      {
        id: 2,
        title: "Backend Developer",
        description: "Handles server-side logic and database architecture.",
        location: "Albania",
        type: "Full-time",
        experience: "3-5 years",
        skills: ["Node.js", "Python", "Database", "API"],
      },
      {
        id: 3,
        title: "DevOps Engineer",
        description: "Manages CI/CD pipelines and cloud infrastructure.",
        location: "Kosovo",
        type: "Full-time",
        experience: "4-6 years",
        skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      },
      {
        id: 4,
        title: "QA Engineer",
        description:
          "Ensures the quality and reliability of applications through testing.",
        location: "Remote",
        type: "Full-time",
        experience: "2-3 years",
        skills: ["Testing", "Automation", "QA Tools", "Bug Tracking"],
      },
      {
        id: 5,
        title: "UI/UX Designer",
        description:
          "Designs intuitive user interfaces and seamless user experiences.",
        location: "Albania",
        type: "Full-time",
        experience: "3-5 years",
        skills: ["Figma", "Adobe", "User Research", "Prototyping"],
      },
      {
        id: 6,
        title: "Product Manager",
        description:
          "Oversees product development and aligns team efforts with business goals.",
        location: "Kosovo",
        type: "Full-time",
        experience: "5-7 years",
        skills: ["Strategy", "Analytics", "Leadership", "Agile"],
      },
      {
        id: 7,
        title: "Data Analyst",
        description: "Analyzes data trends to support decision making.",
        location: "Remote",
        type: "Full-time",
        experience: "2-4 years",
        skills: ["SQL", "Python", "Tableau", "Statistics"],
      },
    ],
  },

  CareerBenefits: {
    title: "Why Join LTS.?",
    subTitle:
      "We invest in our people with comprehensive training and amazing benefits",
    trainings: [
      {
        icon: "Handshake",
        title: "Welcome Day",
        description: "Comprehensive onboarding program",
      },
      {
        icon: "Brain",
        title: "Soft Skills Training",
        description: "Communication and leadership development",
      },
      {
        icon: "Target",
        title: "Project Specific Training",
        description: "Technical skills for your role",
      },
      {
        icon: "UserCheck",
        title: "On the job coaching",
        description: "Continuous mentorship and support",
      },
    ],
    benefits: [
      {
        icon: "Heart",
        title: "Health Insurance",
        description: "Comprehensive health coverage",
      },
      {
        icon: "Clock",
        title: "Flexible Hours",
        description: "Work-life balance priority",
      },
      {
        icon: "TrendingUp",
        title: "Career Growth",
        description: "Clear advancement opportunities",
      },
      {
        icon: "Globe",
        title: "Remote Work",
        description: "Flexible work arrangements",
      },
    ],
  }
};

export default careerDefaultData;
