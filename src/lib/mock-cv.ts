import { type ResumeData } from "./resume-types";

export const mockParsedResume = (): ResumeData => ({
  contact: {
    fullName: "Alex Morgan",
    title: "Aspiring Data Analyst",
    email: "alex.morgan@university.edu",
    phone: "+44 7700 900123",
    location: "London, UK",
    linkedin: "linkedin.com/in/alexmorgan",
    website: "alexmorgan.dev",
    github: "",
    portfolio: "",
    picture: "",
  },
  summary:
    "Final-year Computer Science student with hands-on experience in data analytics, dashboard design, and collaborative engineering projects. Seeking a graduate role to apply analytical thinking and product instincts.",
  experiences: [
    {
      id: "e1",
      jobTitle: "Data Analyst Intern",
      employer: "Bright Labs",
      location: "London, UK",
      startDate: "2024-06",
      endDate: "2024-09",
      current: false,
      bullets: [
        "Built reporting dashboards used by the operations team.",
        "Cleaned and modelled survey data from over 1,200 customers.",
        "Presented weekly findings to the product team.",
      ],
    },
    {
      id: "e2",
      jobTitle: "Research Assistant",
      employer: "University of London",
      location: "London, UK",
      startDate: "2023-09",
      endDate: "2024-05",
      current: false,
      bullets: [
        "Supported a research project on machine learning fairness.",
        "Co-authored a literature review and ran experiments in Python.",
      ],
    },
    {
      id: "e3",
      jobTitle: "Student Ambassador",
      employer: "University of London",
      location: "London, UK",
      startDate: "2022-09",
      endDate: "2023-06",
      current: false,
      bullets: [
        "Led campus tours and answered questions from prospective students and parents.",
      ],
    },
  ],
  education: [
    {
      id: "ed1",
      degree: "BSc Computer Science",
      institution: "University of London",
      location: "London, UK",
      startDate: "2022-09",
      endDate: "2025-06",
      details:
        "Expected first-class honours. Modules: Data Structures, ML, Databases, Software Engineering.",
      highlights: [
        "Expected first-class honours.",
        "Modules: Data Structures, ML, Databases, Software Engineering.",
      ],
    },
    {
      id: "ed2",
      degree: "A-Levels: Maths, Physics, Economics",
      institution: "King Edward School",
      location: "Birmingham, UK",
      startDate: "2020-09",
      endDate: "2022-06",
      details: "A*AA",
      highlights: ["A*AA"],
    },
  ],
  skillGroups: [
    {
      id: "skills-technical",
      name: "Technical tools",
      skills: [
        "Python",
        "SQL",
        "JavaScript",
        "TypeScript",
        "React",
        "Tableau",
        "Power BI",
        "Pandas",
        "NumPy",
        "Excel",
        "Git",
        "Linux",
      ],
    },
    {
      id: "skills-professional",
      name: "Professional strengths",
      skills: ["Agile", "Stakeholder communication", "Public speaking"],
    },
  ],
  projects: [
    {
      id: "p1",
      name: "Campus Energy Dashboard",
      description:
        "Built a public dashboard visualising energy consumption across university buildings. Used by the sustainability team to identify high-usage hours.",
      bullets: [],
      technologies: "Python, Pandas, Plotly, Streamlit",
      link: "github.com/alexmorgan/campus-energy",
    },
    {
      id: "p2",
      name: "StudyBuddy",
      description:
        "A peer study-matching web app with 200+ users in the first term.",
      bullets: [],
      technologies: "React, Node.js, PostgreSQL",
      link: "studybuddy.app",
    },
  ],
  achievements: [],
  certifications: [],
});

export const exampleResume = (): ResumeData => ({
  contact: {
    fullName: "Praveen Binoy",
    title: "Business Analytics Graduate",
    email: "praveenbinoy70@gmail.com",
    phone: "+44 7438366052",
    location: "Southampton, United Kingdom",
    linkedin: "https://www.linkedin.com/in/praveen-binoy/",
    website: "https://praveenbinoy.my.canva.site/",
    github: "",
    portfolio: "",
    picture: "",
  },
  summary:
    "MSc Business Analytics & Management Science graduate (Distinction, University of Southampton) with experience in data-driven performance analysis, KPI tracking, and optimisation across ESG, maritime analytics, and financial modelling projects in collaboration with Roke Manor Research and Northrop Grumman. Skilled in Python and Power BI to generate actionable insights, improve decision-making, and support business and marketing performance. Strong interest in campaign analytics, customer insights, and data-driven growth strategies.",
  skillGroups: [
    {
      id: "example-skills-tools",
      name: "Technical Tools",
      skills: ["Python", "Power BI", "Excel", "Word", "PowerPoint"],
    },
    {
      id: "example-skills-analytics",
      name: "Analytics & Modelling",
      skills: [
        "Data Analysis",
        "Forecasting",
        "Optimisation",
        "Machine Learning",
        "Risk Analysis",
      ],
    },
    {
      id: "example-skills-business",
      name: "Business & Marketing",
      skills: [
        "KPI Tracking",
        "Campaign Analysis",
        "Customer Insights",
        "Market Research",
        "Performance Analysis",
      ],
    },
  ],
  experiences: [
    {
      id: "example-experience-action-hampshire",
      jobTitle: "ESG & Sustainability Intern",
      employer: "Action Hampshire",
      location: "United Kingdom",
      startDate: "2025-06",
      endDate: "2025-11",
      current: false,
      bullets: [
        "Analysed organisational and impact data to improve reporting accuracy by 25%, enabling more effective performance tracking and decision-making.",
        "Built Power BI dashboards to monitor KPIs and organisational performance, improving visibility and stakeholder insights by 20%.",
        "Consolidated cost and policy data, increasing transparency by 30% and supporting data-driven strategic planning.",
        "Translated complex data into actionable insights for stakeholders, supporting reporting, planning, and performance evaluation.",
      ],
    },
    {
      id: "example-experience-roke",
      jobTitle: "Maritime Data Analytics Intern",
      employer: "Roke Manor Research",
      location: "United Kingdom",
      startDate: "2025-05",
      endDate: "2025-09",
      current: false,
      bullets: [
        "Developed Python-based analytics pipelines to identify behavioural patterns and anomalies in large datasets, enabling insight generation for decision-making.",
        "Automated data processing and modelling workflows, reducing analysis time by 40% and improving efficiency.",
        "Improved model performance and reduced false positives by 30% through validation and optimisation techniques.",
        "Aligned analytical outputs with KPI tracking frameworks and stakeholder reporting requirements.",
      ],
    },
  ],
  education: [
    {
      id: "example-education-southampton",
      degree: "MSc Business Analytics and Management Science",
      institution: "University of Southampton",
      location: "United Kingdom",
      startDate: "2024-09",
      endDate: "2025-09",
      details:
        "Grade: Distinction (Dean's List - 74%)\nModules: Optimisation and Decision Modelling, Financial Portfolio Theory, Risk Management, Revenue Management\nDissertation: Anomaly Detection in the Maritime Domain using AIS and Multi-Objective Optimisation",
      highlights: [
        "Grade: Distinction (Dean's List - 74%)",
        "Modules: Optimisation and Decision Modelling, Financial Portfolio Theory, Risk Management, Revenue Management",
        "Dissertation: Anomaly Detection in the Maritime Domain using AIS and Multi-Objective Optimisation",
      ],
    },
    {
      id: "example-education-tkm",
      degree: "B.Tech Electrical and Electronics Engineering",
      institution: "TKM College of Engineering",
      location: "India",
      startDate: "2018-09",
      endDate: "2022-06",
      details:
        "Modules: Industrial Psychology, Business Economics, Probability and Numerical Methods\nDissertation: Fourier Ptychography Microscopy for Cancer Detection",
      highlights: [
        "Modules: Industrial Psychology, Business Economics, Probability and Numerical Methods",
        "Dissertation: Fourier Ptychography Microscopy for Cancer Detection",
      ],
    },
  ],
  projects: [
    {
      id: "example-project-sentiment",
      name: "Customer Sentiment & Engagement Analytics",
      description:
        "Analysed 10,000+ customer reviews using NLP (BERT, Transformers) to generate customer insights, enabling improved engagement strategies and data-driven decision-making.",
      bullets: [],
      technologies: "NLP, BERT, Transformers",
      link: "",
    },
    {
      id: "example-project-sales",
      name: "Store Sales & Returns Analytics",
      description:
        "Designed Power BI dashboards analysing customer behaviour, sales, and return trends, reducing losses by 12% and improving inventory and performance decisions.",
      bullets: [],
      technologies: "Power BI",
      link: "",
    },
    {
      id: "example-project-cruise",
      name: "Cruise Revenue Optimisation & Demand Forecasting",
      description:
        "Built forecasting and optimisation models to support pricing and demand strategies, improving revenue by 15% and forecast accuracy by 28%.",
      bullets: [],
      technologies: "Forecasting, Optimisation",
      link: "",
    },
    {
      id: "example-project-portfolio",
      name: "Financial Portfolio Optimisation",
      description:
        "Applied data-driven modelling to balance risk and return, improving portfolio stability by 20% and supporting strategic investment decisions.",
      bullets: [],
      technologies: "Financial Modelling, Optimisation",
      link: "",
    },
  ],
  achievements: [
    {
      id: "example-achievement-cormsis",
      title: "CORMSIS Excellence Award",
      description:
        "Sponsored by Boeing for outstanding MSc dissertation research.",
    },
    {
      id: "example-achievement-northrop",
      title: "1st Place - Northrop Grumman Innovation Challenge",
      description:
        "For a Ministry of Defence asset decommissioning consultancy project.",
    },
  ],
  certifications: [],
});
