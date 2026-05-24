import { Course } from './types';

export const STATIC_COURSES: Course[] = [
  {
    id: "664f3a8b2d1c9e8a7f0e0001",
    title: "Housekeeping & Domestic Management (Certificate)",
    category: "Certification",
    instructor: {
      name: "Prof. Catherine Gray",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 4.8,
    reviews: 124,
    duration: 12, // 3 months
    level: "Intermediate",
    price: 350000,
    imageUrl: "/african_luxury_domestic.png",
    imageHint: "Housekeeping operations and domestic management systems.",
    description: "Equip yourself with practical, executive-level skills in housekeeping operations, domestic management, wardrobe coordination, and luxury service standards.",
    whoFor: [
      "Aspiring housekeepers and domestic professionals",
      "Hospitality and hotel operations personnel",
      "Estate and residence managers",
      "Personal assistants and executive aides",
      "Caregivers and home management professionals",
      "Individuals seeking international-standard domestic management skills",
      "Entrepreneurs interested in luxury cleaning or home service businesses",
      "Professionals looking to improve organization and household management expertise"
    ],
    learningOutcomes: [
      {
        module: "Module 1: Foundations of Housekeeping",
        topics: [
          "Introduction to Housekeeping",
          "Principles of Professional Cleaning",
          "Cleaning Techniques & Sanitization",
          "Bed Making & Room Setup",
          "Deep Cleaning Procedures",
          "Maintenance Coordination",
          "Inventory & Storage Management"
        ]
      },
      {
        module: "Module 2: Domestic Operations & Client Service",
        topics: [
          "Hygiene & Safety Protocols",
          "Managing Household Staff",
          "Understanding Client Preferences",
          "Professional Conduct & Confidentiality",
          "Emergency Response & Crisis Handling",
          "Household Organization Systems",
          "Final Practical Assessment"
        ]
      },
      {
        module: "Module 3: Wardrobe & Luxury Garment Management",
        topics: [
          "Introduction to Wardrobe Management",
          "Fabric Care & Cleaning Techniques",
          "Luxury Garment Handling",
          "Ironing, Pressing & Folding Standards",
          "Stain Removal Techniques",
          "Dry Cleaning Coordination"
        ]
      },
      {
        module: "Module 4: Personal Organization & Executive Wardrobe Systems",
        topics: [
          "Organizing Closets & Storage Spaces",
          "Shoe & Leather Care",
          "Travel Wardrobe Management",
          "Budgeting & Inventory Management",
          "Wardrobe Documentation Systems",
          "Final Practical & Competency Evaluation"
        ]
      }
    ],
    certificationDetails: [
      "Professional Certificate in Housekeeping & Domestic Management",
      "Practical Competency Assessment Report",
      "Executive Skills Development Recognition",
      "Ashford and Gray Fusion Academy Certification of Completion"
    ],
    careerOpportunities: [
      "Professional Housekeepers",
      "Executive Housekeepers",
      "Domestic Managers",
      "Residence or Estate Assistants",
      "Wardrobe Managers",
      "Hotel Housekeeping Supervisors",
      "Luxury Home Service Professionals",
      "Personal Household Coordinators",
      "Hospitality Support Executives",
      "Cleaning & Domestic Service Entrepreneurs"
    ]
  },
  {
    id: "664f3a8b2d1c9e8a7f0e0002",
    title: "Hospitality Management (Certificate)",
    category: "Certification",
    instructor: {
      name: "Myne Wilfred, CEO",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 4.9,
    reviews: 182,
    duration: 12, // 3 months
    level: "Intermediate",
    price: 450000,
    imageUrl: "/african_hospitality_management.png",
    imageHint: "Hospitality and luxury concierge services.",
    description: "Premium professional training designed to develop highly skilled hospitality professionals equipped to operate within luxury, corporate, executive, and international service environments.",
    whoFor: [
      "Aspiring hospitality professionals",
      "Hotel and guest service personnel",
      "Front office and concierge staff",
      "Butlers and executive service providers",
      "Event and protocol officers",
      "Personal assistants and lifestyle managers",
      "Customer service professionals",
      "Entrepreneurs in hospitality and luxury service industries",
      "Individuals seeking international-standard hospitality training",
      "Professionals aiming to improve executive-level guest experience delivery"
    ],
    learningOutcomes: [
      {
        module: "Module 1: Foundations of Hospitality & Executive Service",
        topics: [
          "Role of a Butler & Concierge",
          "Guest Services & Professional Protocol",
          "Table Setting & Fine Dining Standards",
          "Managing High-End Clients",
          "Confidentiality & Professional Discretion",
          "Luxury Service Etiquette",
          "Professional Appearance & Conduct"
        ]
      },
      {
        module: "Module 2: Communication, Coordination & Client Relations",
        topics: [
          "Advanced Communication Skills",
          "VIP Event Coordination",
          "Travel & Lifestyle Management",
          "Conflict Resolution Techniques",
          "Service Recovery Systems",
          "Managing Guest Expectations",
          "Final Practical Assessment"
        ]
      },
      {
        module: "Module 3: Luxury Hospitality Operations",
        topics: [
          "Luxury Hospitality Foundations",
          "Cultural Sensitivity & International Guest Relations",
          "Personalized Guest Experience Management",
          "Effective Hospitality Communication",
          "Handling Complaints Professionally",
          "Service Standards & Operational Excellence"
        ]
      },
      {
        module: "Module 4: Guest Retention & Crisis Management",
        topics: [
          "Customer Retention Strategies",
          "Upselling & Cross-Selling Techniques",
          "Case Studies in Guest Relations",
          "Hospitality Crisis Management",
          "Reputation & Brand Protection",
          "Certification & Final Competency Assessment"
        ]
      }
    ],
    certificationDetails: [
      "Professional Certificate in Hospitality Management",
      "Executive Hospitality Skills Recognition",
      "Practical Competency Assessment Report",
      "Ashford and Gray Fusion Academy Certification of Completion"
    ],
    careerOpportunities: [
      "Hospitality Managers",
      "Guest Relations Officers",
      "Concierge Professionals",
      "Executive Butlers",
      "Front Office Supervisors",
      "VIP Service Coordinators",
      "Protocol Officers",
      "Lifestyle & Travel Assistants",
      "Event Hospitality Coordinators",
      "Customer Experience Executives",
      "Luxury Hospitality Consultants"
    ]
  },
  {
    id: "664f3a8b2d1c9e8a7f0e0003",
    title: "Events & Protocol Management (Certificate)",
    category: "Certification",
    instructor: {
      name: "Academic Board",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 4.7,
    reviews: 96,
    duration: 12, // 3 months
    level: "Intermediate",
    price: 400000,
    imageUrl: "/african_events_protocol.png",
    imageHint: "Professional events and official protocol systems.",
    description: "Equip learners with the strategic, operational, and executive-level skills required to successfully manage events, ceremonies, corporate functions, VIP engagements, and protocol operations.",
    whoFor: [
      "Aspiring event planners and coordinators",
      "Hospitality and protocol professionals",
      "Corporate event managers",
      "Protocol officers and executive aides",
      "Wedding and social event planners",
      "Government and diplomatic support personnel",
      "Public relations and communications professionals",
      "Security and crowd management personnel",
      "Entrepreneurs in the events industry",
      "Individuals seeking international-standard event and protocol training"
    ],
    learningOutcomes: [
      {
        module: "Module 1: Foundations of Event Planning & Coordination",
        topics: [
          "Introduction to Event Planning",
          "Venue Selection & Event Design",
          "Vendor Coordination & Contract Management",
          "Event Budgeting & Financial Planning",
          "VIP & Celebrity Event Management",
          "Event Scheduling & Logistics",
          "Professional Event Documentation"
        ]
      },
      {
        module: "Module 2: Event Operations & Crisis Management",
        topics: [
          "Security & Risk Management",
          "Crisis Communication Strategies",
          "Event Marketing & Promotion",
          "Event Execution & Coordination",
          "Team Management During Events",
          "Post-Event Evaluation & Reporting",
          "Final Practical Assessment"
        ]
      },
      {
        module: "Module 3: Protocol, Etiquette & High-Profile Engagement",
        topics: [
          "Introduction to Protocol & Etiquette",
          "Cultural Sensitivities & International Standards",
          "High-Profile Guest Management",
          "Crowd Psychology & Behavioral Management",
          "Security & Emergency Protocols",
          "Executive Conduct & Professionalism"
        ]
      },
      {
        module: "Module 4: International Protocol & Strategic Coordination",
        topics: [
          "Official Documentation & Event Briefing",
          "Crisis Handling & Decision Making",
          "International Protocol Procedures",
          "Case Studies in Successful Protocol Management",
          "Reputation Protection & Stakeholder Relations",
          "Final Practical & Competency Assessment"
        ]
      }
    ],
    certificationDetails: [
      "Professional Certificate in Events & Protocol Management",
      "Executive Event Coordination Skills Recognition",
      "Practical Competency Assessment Report",
      "Ashford and Gray Fusion Academy Certification of Completion"
    ],
    careerOpportunities: [
      "Event Planners & Coordinators",
      "Protocol Officers",
      "Corporate Event Managers",
      "Wedding & Social Event Consultants",
      "VIP Liaison Officers",
      "Celebrity & Executive Event Coordinators",
      "Public Relations & Event Support Executives",
      "Government & Diplomatic Event Assistants",
      "Conference & Convention Coordinators",
      "Security & Crowd Management Supervisors",
      "Entrepreneurs in Event & Hospitality Services"
    ]
  },
  {
    id: "664f3a8b2d1c9e8a7f0e0004",
    title: "Executive Assistant Management (Certificate)",
    category: "Certification",
    instructor: {
      name: "Prof. Catherine Gray",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 4.8,
    reviews: 115,
    duration: 12, // 3 months
    level: "Intermediate",
    price: 420000,
    imageUrl: "/african_executive_assistant.png",
    imageHint: "Executive assistance, time management, and corporate operations.",
    description: "High-level professional training designed to prepare participants for strategic support roles within executive, corporate, diplomatic, hospitality, and luxury service environments.",
    whoFor: [
      "Aspiring executive assistants and personal assistants",
      "Administrative and office professionals",
      "Executive secretaries and coordinators",
      "Lifestyle and concierge professionals",
      "Corporate support staff",
      "Hospitality and protocol officers",
      "Entrepreneurs offering executive support services",
      "Individuals working with high-profile clients or executives",
      "Professionals seeking executive-level organizational and communication skills",
      "Individuals seeking international-standard executive assistant training"
    ],
    learningOutcomes: [
      {
        module: "Module 1: VIP Concierge & Lifestyle Management",
        topics: [
          "Understanding VIP Concierge Services",
          "Luxury Lifestyle Management",
          "Personal Assistant Duties & Responsibilities",
          "Exclusive Travel & Reservation Coordination",
          "Personal Styling & Image Management",
          "Professional Conduct & Service Excellence",
          "Managing Executive Expectations"
        ]
      },
      {
        module: "Module 2: High-Net-Worth Client Management",
        topics: [
          "Managing High-Net-Worth Clients",
          "Special Event Coordination",
          "Confidentiality in VIP Services",
          "Crisis Management in Executive Environments",
          "Executive Communication Systems",
          "Relationship Management & Client Retention",
          "Final Practical Assessment"
        ]
      },
      {
        module: "Module 3: Executive Assistance & Corporate Operations",
        topics: [
          "Introduction to Executive Assistance",
          "Professional Correspondence & Business Writing",
          "Scheduling & Time Management",
          "Business Travel Planning",
          "Managing Corporate Events",
          "Office Coordination & Administrative Systems",
          "Executive Reporting Procedures"
        ]
      },
      {
        module: "Module 4: Leadership Support & Strategic Administration",
        topics: [
          "Leadership Support & Decision-Making",
          "Data & File Management",
          "Presentation & Public Speaking Skills",
          "Conflict Resolution Techniques",
          "Workplace Professionalism & Ethics",
          "Final Project & Competency Evaluation"
        ]
      }
    ],
    certificationDetails: [
      "Professional Certificate in Executive Assistant Management",
      "Executive Administrative Skills Recognition",
      "Practical Competency Assessment Report",
      "Ashford and Gray Fusion Academy Certification of Completion"
    ],
    careerOpportunities: [
      "Executive Assistants",
      "Personal Assistants",
      "Executive Secretaries",
      "VIP Concierge Professionals",
      "Lifestyle Managers",
      "Administrative Coordinators",
      "Protocol & Executive Support Officers",
      "Corporate Office Managers",
      "Travel & Executive Logistics Coordinators",
      "Executive Event Support Professionals"
    ]
  },
  {
    id: "664f3a8b2d1c9e8a7f0e0005",
    title: "Hospitality & Global Relationship Management (Certificate)",
    category: "Certification",
    instructor: {
      name: "Myne Wilfred, CEO",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 4.9,
    reviews: 140,
    duration: 12, // 3 months
    level: "Intermediate",
    price: 480000,
    imageUrl: "/african_global_relationships.png",
    imageHint: "International relations, global business, and diplomatic protocol.",
    description: "Professionally designed training focused on developing globally minded professionals equipped with the skills required to navigate international business environments, diplomatic engagements, negotiation, and cross-cultural relationships.",
    whoFor: [
      "Hospitality and corporate professionals",
      "Diplomacy and protocol enthusiasts",
      "Executive assistants and administrators",
      "Business development professionals",
      "Entrepreneurs and business owners",
      "Government and public sector personnel",
      "Human resource and relationship managers",
      "Customer and client relations professionals",
      "Individuals seeking international business and negotiation skills",
      "Professionals aiming to improve cross-cultural communication and conflict management expertise"
    ],
    learningOutcomes: [
      {
        module: "Module 1: Global Business & International Relations",
        topics: [
          "Introduction to Global Business",
          "Trade Policies & International Agreements",
          "Diplomatic Protocols & Professional Etiquette",
          "International Negotiation Strategies",
          "Cross-Cultural Communication Skills",
          "Relationship Management in Global Environments",
          "International Business Communication"
        ]
      },
      {
        module: "Module 2: Diplomacy, Ethics & Crisis Management",
        topics: [
          "Case Studies in Diplomacy",
          "Global Business Ethics",
          "International Crisis Management",
          "Strategic Decision-Making in Global Relations",
          "Career Opportunities in Diplomacy & International Affairs",
          "Leadership in Multicultural Environments",
          "Final Project Assessment"
        ]
      },
      {
        module: "Module 3: Negotiation & Conflict Resolution",
        topics: [
          "Fundamentals of Negotiation",
          "Mediation Strategies & Techniques",
          "Conflict Resolution Frameworks",
          "Handling Difficult People Professionally",
          "Workplace Dispute Management",
          "Emotional Intelligence in Negotiation",
          "Communication During Conflict Situations"
        ]
      },
      {
        module: "Module 4: Advanced Negotiation & Global Engagement",
        topics: [
          "Cross-Cultural Negotiation",
          "Business Contract Negotiation",
          "Case Studies in Conflict Resolution",
          "Stakeholder & Relationship Management",
          "Final Negotiation Simulation",
          "Professional Assessment & Certification"
        ]
      }
    ],
    certificationDetails: [
      "Professional Certificate in Hospitality & Global Relationship Management",
      "Negotiation & Conflict Resolution Skills Recognition",
      "Practical Competency Assessment Report",
      "Ashford and Gray Fusion Academy Certification of Completion"
    ],
    careerOpportunities: [
      "Relationship Managers",
      "Hospitality & Guest Relations Executives",
      "Protocol & Diplomacy Officers",
      "Business Development Executives",
      "Corporate Communication Professionals",
      "Negotiation & Mediation Consultants",
      "Human Resource & Conflict Resolution Officers",
      "International Business Coordinators",
      "Customer Experience Managers",
      "Public Relations & Stakeholder Engagement Officers",
      "Executive Liaison Officers"
    ]
  },
  {
    id: "664f3a8b2d1c9e8a7f0e0006",
    title: "Diploma in Hospitality Management",
    category: "Diploma",
    instructor: {
      name: "Myne Wilfred, CEO",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 4.9,
    reviews: 210,
    duration: 24, // 6 months
    level: "Advanced",
    price: 750000,
    imageUrl: "/african_diploma_hospitality.png",
    imageHint: "Advanced hospitality systems and luxury operational administration.",
    description: "An advanced professional program designed to develop highly competent hospitality professionals equipped with practical expertise, leadership capacity, and global service standards.",
    whoFor: [
      "Aspiring hospitality professionals and managers",
      "Hotel and guest service personnel",
      "Executive housekeepers and supervisors",
      "Butlers and concierge professionals",
      "Estate and residence managers",
      "Event and protocol professionals",
      "Entrepreneurs in hospitality and luxury service industries",
      "Individuals seeking international-standard hospitality education",
      "Professionals looking to upgrade their leadership and operational hospitality skills",
      "Individuals preparing for executive-level hospitality and service careers"
    ],
    learningOutcomes: [
      {
        module: "Module 1: Housekeeping & Domestic Operations",
        topics: [
          "Introduction to Housekeeping",
          "Cleaning Techniques & Sanitization",
          "Bed Making & Room Setup",
          "Deep Cleaning & Maintenance Procedures",
          "Inventory & Storage Management",
          "Hygiene Protocols & Safety Standards",
          "Managing Household Staff",
          "Understanding Client Preferences",
          "Emergency Response Procedures",
          "Practical Assessment"
        ]
      },
      {
        module: "Module 2: Executive Hospitality & Guest Relations",
        topics: [
          "Role of a Butler & Concierge",
          "Guest Services & Professional Protocol",
          "Table Setting & Fine Dining Standards",
          "Managing High-End Clients",
          "Confidentiality & Professional Discretion",
          "Advanced Communication Skills",
          "VIP Event Coordination",
          "Travel & Lifestyle Management",
          "Conflict Resolution Techniques",
          "Final Practical Assessment"
        ]
      },
      {
        module: "Module 3: Luxury Hospitality & Customer Experience",
        topics: [
          "Luxury Hospitality Foundations",
          "Cultural Sensitivity & International Guest Relations",
          "Personalized Guest Experience Management",
          "Professional Communication Skills",
          "Handling Complaints Professionally",
          "Customer Retention Strategies",
          "Upselling & Cross-Selling Techniques",
          "Case Studies in Guest Relations",
          "Crisis Management in Hospitality",
          "Certification Assessment"
        ]
      },
      {
        module: "Module 4: Wardrobe & Executive Lifestyle Management",
        topics: [
          "Introduction to Wardrobe Management",
          "Fabric Care & Cleaning Techniques",
          "Luxury Garment Handling",
          "Ironing, Pressing & Folding Standards",
          "Stain Removal & Dry Cleaning Coordination",
          "Organizing Closets & Storage Systems",
          "Shoe & Leather Care",
          "Travel Wardrobe Management",
          "Budgeting & Inventory Management",
          "Final Practical Evaluation"
        ]
      }
    ],
    certificationDetails: [
      "Diploma in Hospitality Management",
      "Professional Hospitality Competency Certification",
      "Executive Service & Guest Relations Recognition",
      "Practical Skills Assessment Report",
      "Ashford and Gray Fusion Academy Diploma Certification"
    ],
    careerOpportunities: [
      "Hospitality Managers",
      "Executive Housekeepers",
      "Guest Relations Managers",
      "Concierge Professionals",
      "Executive Butlers",
      "Residence & Estate Managers",
      "Front Office Supervisors",
      "Luxury Hospitality Coordinators",
      "VIP Service Executives",
      "Lifestyle & Travel Managers",
      "Hospitality Consultants",
      "Customer Experience Managers",
      "Hospitality Entrepreneurs"
    ]
  },
  {
    id: "664f3a8b2d1c9e8a7f0e0007",
    title: "Diploma in Professional Development & Global Relations",
    category: "Diploma",
    instructor: {
      name: "Prof. Catherine Gray",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 4.8,
    reviews: 154,
    duration: 24, // 6 months
    level: "Advanced",
    price: 800000,
    imageUrl: "/african_professional_diplomacy.png",
    imageHint: "Leadership development, global relations, and career development.",
    description: "A comprehensive professional program designed to develop confident leaders, strategic communicators, globally minded professionals, and effective negotiators equipped to thrive in modern corporate, diplomatic, and international settings.",
    whoFor: [
      "Emerging and aspiring leaders",
      "Corporate professionals and administrators",
      "Human resource and relationship managers",
      "Diplomacy and international relations enthusiasts",
      "Entrepreneurs and business executives",
      "Executive assistants and protocol officers",
      "Public relations and communication professionals",
      "Individuals seeking career advancement and leadership development",
      "Professionals interested in negotiation and conflict resolution",
      "Individuals preparing for global business and multicultural work environments"
    ],
    learningOutcomes: [
      {
        module: "Module 1: Leadership Development & Professional Excellence",
        topics: [
          "Leadership Theories & Leadership Styles",
          "Emotional Intelligence & Self-Awareness",
          "Team Leadership & Team Dynamics",
          "Conflict Resolution Techniques",
          "Strategic Decision Making",
          "Time Management & Productivity",
          "Understanding Corporate Culture",
          "Leadership Case Studies",
          "Ethical Leadership Principles",
          "Leadership Simulation Exercises"
        ]
      },
      {
        module: "Module 2: Global Relations & International Engagement",
        topics: [
          "Introduction to Global Business",
          "Trade Policies & International Agreements",
          "Diplomatic Protocols & Professional Etiquette",
          "International Negotiation Strategies",
          "Cross-Cultural Communication Skills",
          "Case Studies in Diplomacy",
          "Global Business Ethics",
          "International Crisis Management",
          "Career Opportunities in Diplomacy & Global Relations",
          "Final Project Assessment"
        ]
      },
      {
        module: "Module 3: Career Development & Workplace Readiness",
        topics: [
          "Career Planning & Goal Setting",
          "Workplace Communication Skills",
          "Resume & Cover Letter Writing",
          "Professional Networking Strategies",
          "Personal Branding & Executive Presence",
          "Job Interview Techniques",
          "Office Politics & Workplace Conflict Management",
          "Ethics & Professional Conduct",
          "Work-Life Balance Strategies",
          "Final Career Plan Presentation"
        ]
      },
      {
        module: "Module 4: Negotiation, Mediation & Conflict Management",
        topics: [
          "Fundamentals of Negotiation",
          "Mediation Strategies & Techniques",
          "Conflict Resolution Frameworks",
          "Handling Difficult People Professionally",
          "Workplace Dispute Management",
          "Cross-Cultural Negotiation",
          "Business Contract Negotiation",
          "Case Studies in Conflict Resolution",
          "Final Negotiation Simulation",
          "Assessment & Certification"
        ]
      }
    ],
    certificationDetails: [
      "Diploma in Professional Development & Global Relations",
      "Leadership & Negotiation Competency Certification",
      "Professional Communication & Global Relations Recognition",
      "Practical Skills Assessment Report",
      "Ashford and Gray Fusion Academy Diploma Certification"
    ],
    careerOpportunities: [
      "Corporate Executives & Team Leaders",
      "Human Resource & Relationship Managers",
      "Diplomacy & Protocol Officers",
      "Negotiation & Conflict Resolution Specialists",
      "Corporate Communication Professionals",
      "Executive Administrators",
      "Leadership Development Coordinators",
      "Public Relations & Stakeholder Managers",
      "International Business Coordinators",
      "Professional Development Consultants"
    ]
  },
  {
    id: "664f3a8b2d1c9e8a7f0e0008",
    title: "Diploma in Business Innovation & Entrepreneurship",
    category: "Diploma",
    instructor: {
      name: "Myne Wilfred, CEO",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 4.9,
    reviews: 236,
    duration: 24, // 6 months
    level: "Advanced",
    price: 850000,
    imageUrl: "/african_business_innovation.png",
    imageHint: "Business administration, corporate branding, and economics.",
    description: "A modern, industry-driven professional program designed to develop innovative entrepreneurs, strategic business leaders, and globally competitive professionals capable of building sustainable businesses.",
    whoFor: [
      "Aspiring entrepreneurs and startup founders",
      "Business owners and executives",
      "Corporate professionals seeking leadership advancement",
      "Individuals interested in business innovation and digital entrepreneurship",
      "Marketing and branding professionals",
      "Business development and operations managers",
      "Financial management enthusiasts",
      "Students seeking practical business education",
      "Professionals transitioning into entrepreneurship",
      "Individuals interested in corporate communication and global branding"
    ],
    learningOutcomes: [
      {
        module: "Module 1: Business Administration & Strategic Leadership",
        topics: [
          "Fundamentals of Business Administration",
          "Strategic Planning & Organizational Development",
          "Organizational Structures & Management Systems",
          "Business Ethics & Professional Responsibility",
          "Financial Management Principles",
          "Competitive Analysis & Market Positioning",
          "Business Negotiation Techniques",
          "Risk Management Strategies",
          "Business Case Studies",
          "Final Project Assessment"
        ]
      },
      {
        module: "Module 2: Entrepreneurship & Business Development",
        topics: [
          "Introduction to Entrepreneurship",
          "Identifying Business Opportunities",
          "Business Model Development",
          "Funding & Investment Options",
          "Digital Entrepreneurship Strategies",
          "Legal Considerations in Business",
          "Pitching to Investors",
          "Scaling & Growing a Business",
          "Entrepreneurial Case Studies",
          "Final Business Pitch"
        ]
      },
      {
        module: "Module 3: Economics, Finance & Investment Management",
        topics: [
          "Introduction to Economics",
          "Microeconomics vs. Macroeconomics",
          "Financial Markets & Investment Systems",
          "Business Finance & Financial Decision-Making",
          "Financial Planning & Budgeting",
          "Economic Policies & Global Markets",
          "Cryptocurrency & Emerging Financial Trends",
          "Business & Financial Risk Management",
          "Economic Case Studies",
          "Assessment & Evaluation"
        ]
      },
      {
        module: "Module 4: Corporate Communication & Brand Development",
        topics: [
          "Basics of Corporate Communication",
          "Brand Development Strategies",
          "Social Media & Digital Branding",
          "Public Relations & Crisis Management",
          "Persuasive Business Writing",
          "Visual Identity & Design Principles",
          "Brand Case Studies & Market Analysis",
          "Internal & External Communication Systems",
          "Global Branding Strategies",
          "Final Branding & Communication Project"
        ]
      }
    ],
    certificationDetails: [
      "Diploma in Business Innovation & Entrepreneurship",
      "Entrepreneurship & Business Strategy Competency Certification",
      "Corporate Communication & Branding Recognition",
      "Practical Project Assessment Report",
      "Ashford and Gray Fusion Academy Diploma Certification"
    ],
    careerOpportunities: [
      "Entrepreneurs & Startup Founders",
      "Business Development Executives",
      "Brand & Communication Managers",
      "Corporate Strategists",
      "Business Consultants",
      "Innovation & Growth Managers",
      "Marketing & Digital Branding Specialists",
      "Financial & Investment Coordinators",
      "Public Relations Officers",
      "Corporate Communication Executives"
    ]
  },
  {
    id: "664f3a8b2d1c9e8a7f0e0009",
    title: "Diploma in Event & Protocol Management",
    category: "Diploma",
    instructor: {
      name: "Academic Board",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 4.8,
    reviews: 178,
    duration: 24, // 6 months
    level: "Advanced",
    price: 780000,
    imageUrl: "/african_diploma_events.png",
    imageHint: "Advanced VIP hospitality, events, and diplomatic protocol operations.",
    description: "Comprehensive professional program designed to develop highly skilled event professionals, protocol officers, executive coordinators, and VIP service specialists capable of managing high-level events.",
    whoFor: [
      "Aspiring event planners and coordinators",
      "Protocol and diplomatic service professionals",
      "Executive assistants and administrative coordinators",
      "Hospitality and concierge professionals",
      "Corporate event managers",
      "Public relations and communications professionals",
      "Individuals working with high-profile clients and executives",
      "Entrepreneurs in the event and luxury service industries",
      "Government and diplomatic support personnel",
      "Professionals seeking international-standard event and protocol training"
    ],
    learningOutcomes: [
      {
        module: "Module 1: Event Planning & Event Operations",
        topics: [
          "Introduction to Event Planning",
          "Venue Selection & Event Design",
          "Vendor Coordination & Contract Management",
          "Budgeting & Financial Planning for Events",
          "VIP & Celebrity Event Management",
          "Security & Risk Management",
          "Crisis Communication Strategies",
          "Event Marketing & Promotion",
          "Event Execution & Coordination",
          "Post-Event Evaluation & Reporting"
        ]
      },
      {
        module: "Module 2: Protocol, Etiquette & High-Profile Coordination",
        topics: [
          "Introduction to Protocol & Etiquette",
          "Cultural Sensitivities & International Standards",
          "High-Profile Guest Management",
          "Crowd Psychology & Behavioral Management",
          "Security & Emergency Protocols",
          "Official Documentation & Briefing Systems",
          "Crisis Handling & Decision-Making",
          "International Protocol Procedures",
          "Case Studies in Successful Protocol Management",
          "Final Practical Assessment"
        ]
      },
      {
        module: "Module 3: VIP Concierge & Lifestyle Management",
        topics: [
          "Understanding VIP Concierge Services",
          "Luxury Lifestyle Management",
          "Personal Assistant Duties & Responsibilities",
          "Exclusive Travel & Reservation Coordination",
          "Personal Styling & Image Management",
          "Managing High-Net-Worth Clients",
          "Special Event Coordination",
          "Confidentiality in VIP Services",
          "Crisis Management in VIP Environments",
          "Final Practical Evaluation"
        ]
      },
      {
        module: "Module 4: Executive Assistance & Leadership Support",
        topics: [
          "Introduction to Executive Assistance",
          "Professional Correspondence & Business Communication",
          "Scheduling & Time Management",
          "Business Travel Planning",
          "Managing Corporate Events",
          "Leadership Support & Strategic Decision-Making",
          "Data & File Management Systems",
          "Presentation & Public Speaking Skills",
          "Conflict Resolution Techniques",
          "Final Project Assessment"
        ]
      }
    ],
    certificationDetails: [
      "Diploma in Event & Protocol Management",
      "Executive Coordination & Protocol Competency Certification",
      "VIP Service & Event Management Recognition",
      "Practical Skills Assessment Report",
      "Ashford and Gray Fusion Academy Diploma Certification"
    ],
    careerOpportunities: [
      "Event Planners & Coordinators",
      "Protocol Officers",
      "Executive Assistants",
      "VIP Concierge Professionals",
      "Lifestyle & Travel Managers",
      "Corporate Event Managers",
      "Public Relations & Event Executives",
      "Celebrity & VIP Liaison Officers",
      "Conference & Convention Coordinators",
      "Executive Support Professionals"
    ]
  },
  {
    id: "664f3a8b2d1c9e8a7f0e0010",
    title: "The Silent Standard Certification Program",
    category: "Executive MBA",
    instructor: {
      name: "Myne Wilfred, CEO",
      avatarUrl: "/CEO Myne.jpg.jpeg",
      verified: true
    },
    rating: 5.0,
    reviews: 342,
    duration: 12, // 3 months
    level: "Advanced",
    price: 1200000,
    imageUrl: "/african_silent_standard_mba.png",
    imageHint: "The signature silent standard certification for elite operational authorities.",
    description: "Our ultra-premium executive-level professional development program designed to cultivate disciplined leaders, operational strategists, and institutional authorities.",
    whoFor: [
      "Hospitality and executive management professionals",
      "Estate and residence managers",
      "Executive assistants and protocol officers",
      "Corporate leaders and administrators",
      "Event and operations managers",
      "Entrepreneurs and institutional founders",
      "Professionals managing high-profile environments",
      "Individuals seeking leadership discipline and operational excellence",
      "Professionals aiming to build structured systems and executive authority",
      "Leaders interested in governance, accountability, and institutional growth"
    ],
    learningOutcomes: [
      {
        module: "Module 1: The Foundation of The Silent Standard",
        topics: [
          "Understanding Discipline as a System",
          "Structure vs. Effort",
          "Excellence vs. Performance",
          "Developing Operational Consistency",
          "Building Standards that Last",
          "Professional Responsibility & Accountability"
        ]
      },
      {
        module: "Module 2: Leadership & Emotional Discipline",
        topics: [
          "Pressure Control & Stability",
          "Decision-Making Under Stress",
          "Authority Without Noise",
          "Emotional Intelligence & Leadership Awareness",
          "Executive Presence & Self-Control",
          "Leadership Discipline Frameworks"
        ]
      },
      {
        module: "Module 3: The Architecture of Order",
        topics: [
          "Role Clarity & Organizational Alignment",
          "Reporting Systems & Operational Communication",
          "Command Structures & Leadership Flow",
          "Team Coordination & Accountability Systems",
          "Structured Operational Management",
          "Institutional Efficiency Models"
        ]
      },
      {
        module: "Module 4: Anticipation & Operational Intelligence",
        topics: [
          "Predictive Service Systems",
          "Risk Identification & Assessment",
          "Preventive Operational Systems",
          "Situational Awareness & Strategic Thinking",
          "Crisis Prevention & Response Planning",
          "Operational Intelligence Techniques"
        ]
      },
      {
        module: "Module 5: Estate & Executive Management",
        topics: [
          "Privacy Control & Executive Discretion",
          "Domestic Staff Systems & Coordination",
          "Protocol & Access Control",
          "Executive Environment Management",
          "Residence & Estate Operational Structure",
          "High-Profile Client Management"
        ]
      },
      {
        module: "Module 6: Hospitality Excellence Systems",
        topics: [
          "Guest Experience Engineering",
          "Service Consistency Frameworks",
          "Hospitality Service Refinement",
          "Luxury Service Delivery Principles",
          "Quality Assurance & Standards Control",
          "Reputation & Experience Management"
        ]
      },
      {
        module: "Module 7: Event Command & High-Profile Operations",
        topics: [
          "Event Structure & Operational Planning",
          "Vendor Discipline & Coordination",
          "Real-Time Event Control Systems",
          "VIP & High-Profile Event Operations",
          "Crisis Handling During Events",
          "Executive-Level Event Management"
        ]
      },
      {
        module: "Module 8: Institutional & Corporate Systems",
        topics: [
          "Governance & Organizational Structure",
          "Compliance & Professional Standards",
          "Accountability Systems & Reporting",
          "Policy Implementation Frameworks",
          "Corporate Leadership Systems",
          "Institutional Stability & Growth"
        ]
      },
      {
        module: "Module 9: From Practice to Principle",
        topics: [
          "Turning Experience into Authority",
          "Documentation & Knowledge Systems",
          "Legacy Framework Development",
          "Professional Positioning Through Experience",
          "Building Sustainable Operational Systems",
          "Thought Leadership Foundations"
        ]
      },
      {
        module: "Module 10: Global Positioning & Authority",
        topics: [
          "Building Professional Influence",
          "Executive Identity & Brand Positioning",
          "Institutional Growth Strategies",
          "Leadership Visibility & Credibility",
          "Global Standards & International Relevance",
          "Creating Long-Term Professional Impact"
        ]
      }
    ],
    certificationDetails: [
      "Certified Silent Standard Professional Certification",
      "Executive Leadership & Operational Excellence Recognition",
      "Professional Competency Assessment Report",
      "Ashford and Gray Fusion Academy Certification of Completion"
    ],
    careerOpportunities: [
      "Executive & Estate Managers",
      "Operations & Administrative Leaders",
      "Hospitality Excellence Consultants",
      "Protocol & Executive Coordination Officers",
      "Institutional Development Strategists",
      "Corporate Operations Managers",
      "Leadership & Systems Consultants",
      "High-Profile Event & Operations Coordinators",
      "Executive Service Professionals",
      "Organizational Structure & Compliance Managers"
    ]
  }
];
