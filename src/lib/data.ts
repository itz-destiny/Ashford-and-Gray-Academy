
import type { Course, AppEvent } from './types';

// This data is now used for seeding the database, not for direct display.
export const coursesToSeed: Omit<Course, 'id' | 'progress'>[] = [
  {
    title: 'Housekeeping and Domestic Management (Certificate)',
    description: 'A comprehensive certification covering all aspects of professional housekeeping and domestic management.',
    curriculum: [
      'Introduction to Housekeeping',
      'Cleaning Techniques & Sanitization',
      'Bed Making & Room Setup',
      'Deep Cleaning & Maintenance',
      'Inventory & Storage Management',
      'Hygiene Protocols',
      'Managing Household Staff',
      'Understanding Client Preferences',
      'Emergency Response',
      'Introduction to Wardrobe Management',
      'Fabric Care & Cleaning Techniques',
      'Luxury Garment Handling',
      'Ironing, Pressing & Folding',
      'Stain Removal & Dry Cleaning',
      'Organizing Closets',
      'Shoe & Leather Care',
      'Travel Wardrobe Management',
      'Budgeting & Inventory Management',
      'Final Assessment & Practical'
    ],
    category: 'Certification',
    instructor: { name: 'Sarah Ashford', avatarUrl: 'https://picsum.photos/seed/sarah/100/100', verified: true },
    rating: 4.8,
    reviews: 1250,
    duration: 12,
    level: 'Beginner',
    price: 350000,
    imageUrl: '/housekeeping_certificate.png',
    imageHint: 'professional housekeeping setup',
  },
  {
    title: 'Hospitality Management (Certificate)',
    description: 'Master the skills required for high-end hospitality management, from butler services to guest relations.',
    curriculum: [
      'Role of a Butler & Concierge',
      'Guest Services & Protocol',
      'Table Setting & Fine Dining',
      'Managing High-End Clients',
      'Confidentiality & Discretion',
      'Advanced Communication',
      'VIP Event Coordination',
      'Travel & Lifestyle Management',
      'Conflict Resolution',
      'Luxury Hospitality Foundations',
      'Cultural Sensitivity',
      'Personalised Guest Experience'
    ],
    category: 'Certification',
    instructor: { name: 'James Gray', avatarUrl: 'https://picsum.photos/seed/james/100/100', verified: true },
    rating: 4.9,
    reviews: 890,
    duration: 14,
    level: 'Advanced',
    price: 350000,
    imageUrl: '/hospitality_management_certificate.png',
    imageHint: 'luxury hospitality service',
  },
  {
    title: 'Events and Protocol Management (Certificate)',
    description: 'Expert training in planning and executing high-profile events with strict adherence to protocol.',
    curriculum: [
      'Introduction to Event Planning',
      'Venue Selection & Event Design',
      'Vendor Coordination & Contracts',
      'Budgeting & Finance',
      'VIP & Celebrity Event Management',
      'Security & Risk Management',
      'Intro to Protocol & Etiquette',
      'Crisis Communication',
      'Cultural Sensitivities',
      'Marketing & Promotion',
      'High-Profile Guest Management',
      'Event Execution & Coordination',
      'Post-Event Evaluation',
      'Official Documentation',
      'International Protocol'
    ],
    category: 'Certification',
    instructor: { name: 'Eleanor Vance', avatarUrl: 'https://picsum.photos/seed/eleanor/100/100', verified: true },
    rating: 4.7,
    reviews: 2100,
    duration: 12,
    level: 'Intermediate',
    price: 350000,
    imageUrl: '/imagefx.png',
    imageHint: 'sophisticated event setup',
  },
  {
    title: 'Executive Assistant and Personal Assistant (Certificate)',
    description: 'The definitive guide to becoming a top-tier executive assistant for high-net-worth individuals.',
    curriculum: [
      'Professional Correspondence',
      'Scheduling & Time Management',
      'Business Travel Planning',
      'Managing Corporate Events',
      'Leadership Support & Decision-Making',
      'Data & File Management',
      'Presentation & Public Speaking',
      'Conflict Resolution',
      'Client Profiling & Communication',
      'Confidentiality & Discretion',
      'Personal Branding for Assistants'
    ],
    category: 'Certification',
    instructor: { name: 'Robert Sinclair', avatarUrl: 'https://picsum.photos/seed/robert/100/100', verified: true },
    rating: 4.8,
    reviews: 1800,
    duration: 10,
    level: 'Beginner',
    price: 350000,
    imageUrl: '/imagefx-5.png',
    imageHint: 'professional executive office',
  },
  {
    title: 'Global Relationship Management (Certificate)',
    description: 'Navigate the complex world of global business and diplomacy within the hospitality sector.',
    curriculum: [
      'Leadership Theories & Styles',
      'Emotional Intelligence',
      'Team Leadership',
      'Conflict Resolution',
      'Global Business Ethics',
      'Introduction to Global Business',
      'Trade Policies & Agreements',
      'Diplomatic Protocols & Etiquette',
      'International Negotiation Strategies',
      'Handling Difficult People',
      'Business Contract Negotiation'
    ],
    category: 'Certification',
    instructor: { name: 'Ambassador Linda Thomas', avatarUrl: 'https://picsum.photos/seed/linda/100/100', verified: true },
    rating: 5.0,
    reviews: 1250,
    duration: 16,
    level: 'Advanced',
    price: 350000,
    imageUrl: '/imagefx-2.png',
    imageHint: 'international diplomatic summit',
  },
  {
    title: 'Diploma in Hospitality Management',
    description: 'Our most comprehensive hospitality program, covering housekeeping, standards, butler services, and advanced relations strategy.',
    curriculum: [
      'Module 1: Housekeeping Operations (Cleaning, Sanitization, Bed Making, Deep Cleaning, Inventory)',
      'Module 2: Standards & Protocols (Hygiene, Managing Staff, Client Preferences, Emergency Response)',
      'Module 3: Butler & Concierge Services (Guest Services, Protocol, Fine Dining, Managing VIPs, Confidentiality)',
      'Module 4: Advanced Hospitality (Advanced Communication, VIP Event Coordination, Travel & Lifestyle, Conflict Resolution)',
      'Module 5: Guest Relations & Strategy (Luxury Foundations, Cultural Sensitivity, Personalized Experience, Retention, Crisis Management)',
      'Module 6: Wardrobe & Luxury Care (Wardrobe Management, Fabric Care, Garment Handling, Ironing, Stain Removal, Closet Organization)'
    ],
    category: 'Diploma',
    instructor: { name: 'James Gray', avatarUrl: 'https://picsum.photos/seed/james/100/100', verified: true },
    rating: 4.9,
    reviews: 210,
    duration: 36,
    level: 'Advanced',
    price: 1500000,
    imageUrl: '/imagefx-4.png',
    imageHint: 'comprehensive hospitality training',
  },
  {
    title: 'Diploma in Event and Protocol Management',
    description: 'A master-level program combining planning, operations, specialized management, and international etiquette.',
    curriculum: [
      'Module 1: Planning & Design (Intro to Events, Venue Selection, Event Design, Vendor Coordination)',
      'Module 2: Operations & Finance (Budgeting & Finance, Execution & Coordination, Post-Event Evaluation)',
      'Module 3: Specialized Management (VIP & Celebrity Events, Security & Risk, High-Profile Guest Management)',
      'Module 4: Protocol & Etiquette (International Protocol, Cultural Sensitivities, Case Studies)',
      'Module 5: Communication & Crisis (Crisis Communication, Marketing & Promotion, Official Documentation)'
    ],
    category: 'Diploma',
    instructor: { name: 'Eleanor Vance', avatarUrl: 'https://picsum.photos/seed/eleanor/100/100', verified: true },
    rating: 4.9,
    reviews: 180,
    duration: 32,
    level: 'Advanced',
    price: 1500000,
    imageUrl: '/imagefx-3.png',
    imageHint: 'advanced event and protocol setup',
  },
  {
    title: 'Diploma in Professional Development & Global Relations',
    description: 'Master higher-level leadership, global diplomacy, career advancement, and negotiation strategies.',
    curriculum: [
      'Module 1: Leadership Core (Theories & Styles, Emotional Intelligence, Team Leadership, Conflict Resolution, Ethics)',
      'Module 2: Global Business & Diplomacy (Global Business Intro, Trade Policies, Diplomatic Protocols, International Negotiation, Ethics)',
      'Module 3: Career Advancement (Planning & Goals, Resume Writing, Networking, Personal Branding, Interview Techniques)',
      'Module 4: Negotiation & Mediation (Fundamentals, Mediation Strategies, Handling Difficult People, Contract Negotiation)'
    ],
    category: 'Diploma',
    instructor: { name: 'Ambassador Linda Thomas', avatarUrl: 'https://picsum.photos/seed/linda/100/100', verified: true },
    rating: 5.0,
    reviews: 120,
    duration: 40,
    level: 'Advanced',
    price: 1500000,
    imageUrl: '/imagefx-1.png',
    imageHint: 'global relations and diplomacy',
  },
  {
    title: 'Diploma in Corporate Concierge, Innovation and Leadership',
    description: 'Designed for elite personal assistants and modern business leaders, covering lifestyle management and strategic innovation.',
    curriculum: [
      'Part A: Personal Assistant and Lifestyle Management',
      '- Foundations of Corporate Concierge (Ethics, Roles, History)',
      '- Client Management (Profiling, Cultural Awareness, Etiquette)',
      '- Lifestyle & Travel (Exclusive Planning, Personal Shopping)',
      '- Technology & Innovation (AI/Automation, Workflow Mgmt)',
      '- Service Excellence (Luxury Standards, Team Motivation)',
      'Part B: Business Innovation & Entrepreneurship',
      '- Business Administration (Strategic Planning, Org Structures, Financial Mgmt, Risk)',
      '- Entrepreneurial Skills (Opportunity ID, Model Development, Funding, Pitching)',
      '- Economics & Finance (Micro/Macro, Financial Markets, Crypto Trends)',
      '- Corporate Communication (Brand Strategies, Digital Branding, PR & Crisis Mgmt)'
    ],
    category: 'Diploma',
    instructor: { name: 'Robert Sinclair', avatarUrl: 'https://picsum.photos/seed/robert/100/100', verified: true },
    rating: 4.8,
    reviews: 155,
    duration: 24,
    level: 'Advanced',
    price: 1500000,
    imageUrl: '/academy_mentor_portrait.png',
    imageHint: 'executive leadership and concierge',
  },
  {
    title: 'Executive MBA in Hospitality and Tourism Management',
    description: 'The premier program for global leaders, integrating advanced management with specialized industry wisdom.',
    curriculum: [
      'Foundations of Business Leadership:',
      '- Global Business Environment and Strategy (HTM 500)',
      '- Managerial Economics & Decision Making (HTM 501)',
      '- Financial Accounting & Analysis (HTM 502)',
      '- Organizational Behavior & Leadership (HTM 503)',
      'Advanced Management & Innovation:',
      '- Corporate Finance & Investment Decisions (HTM 504)',
      '- Marketing Strategy & Digital Transformation (HTM 505)',
      '- Operations & Supply Chain Management (HTM 506)',
      '- Business Innovation & Entrepreneurship (HTM 507)',
      'Integration and Leadership Application:',
      '- Corporate Governance, Ethics & Legal Environment (HTM 508)',
      '- Strategic Human Resource Management (HTM 509)',
      '- Data Analytics and Business Intelligence (HTM 510)',
      'Areas of Specialization (Select One):',
      '- Hospitality & Tourism Leadership (Revenue Mgmt, Sustainability, Luxury)',
      '- Event Management & Protocol (Planning, VIP Protocol, Risk Mgmt)',
      '- Corporate Communications & Brand Strategy (Crisis Comm, Digital Brand)',
      '- Financial Intelligence & Wealth Management (Investment, Tax Planning)',
      '- Global Entrepreneurship & Innovation (Venture Capital, Social Impact)'
    ],
    category: 'Executive MBA',
    instructor: { name: 'Dr. Alistair Ashford', avatarUrl: 'https://picsum.photos/seed/alistair/100/100', verified: true },
    rating: 5.0,
    reviews: 28,
    duration: 104,
    level: 'Advanced',
    price: 2500000,
    imageUrl: '/academy_hero_students.png',
    imageHint: 'executive boardroom meeting',
  },
];


export const eventsToSeed: Omit<AppEvent, 'id'>[] = [
  {
    title: 'Protocol and Crown Control Training Etiquette',
    category: 'Workshop',
    date: '2024-11-15',
    location: 'Virtual',
    price: 150,
    imageUrl: '/imagefx-8.png',
    imageHint: 'formal dining setup',
    organizer: 'Etiquette Experts'
  },
  {
    title: 'Cleaning and Maintenance Fundamentals',
    category: 'Seminar',
    date: '2024-12-02',
    location: 'Lagos, Nigeria',
    price: 99,
    imageUrl: '/imagefx-6.png',
    imageHint: 'cleaning supplies',
    organizer: 'CleanCo'
  },
  {
    title: 'Book Keeping and Inventory Management',
    category: 'Webinar',
    date: '2024-11-20',
    location: 'Online',
    price: 220,
    imageUrl: '/imagefx-1.png',
    imageHint: 'ledger and calculator',
    organizer: 'Biz Solutions'
  },
  {
    title: 'Fine Dining Etiquette & Service',
    category: 'Workshop',
    date: '2024-12-10',
    location: 'Abuja, Nigeria',
    price: 350,
    imageUrl: '/imagefx-4.png',
    imageHint: 'fine dining restaurant',
    organizer: 'Hospitality Masters'
  },
];

export const mockLiveClassTranscript = `Instructor: Good morning, everyone. Welcome to Introduction to Quantum Physics. Today, we're going to start with the absolute basics, the foundational concepts that everything else is built upon. So, the first and most mind-bending concept is wave-particle duality.

Student 1: Uh, professor? What does that even mean?

Instructor: Great question! It means that tiny things, like electrons or photons, don't just behave like tiny billiard balls. They also behave like waves, spreading out in space. It's weird, I know. An electron can be in multiple places at once until you measure it.

Student 2: So, when we're not looking, it's a wave? And when we look, it's a particle?

Instructor: Exactly! The act of observation or measurement 'collapses' the wave function into a single, definite state. This is called the observer effect. Think of it like this: before you open the box, Schrödinger's cat is both alive and dead. The moment you look, it's one or the other. We'll be doing a lab on the double-slit experiment next week which demonstrates this perfectly.

Student 1: So this applies to everything? Like, is this desk also a wave?

Instructor: Technically, yes! Everything has a wavelength, it's called the de Broglie wavelength. But for large objects, the wavelength is so incredibly tiny that it's completely undetectable. You don't have to worry about walking through walls, even if your particles are waves. The probability is practically zero.

Student 3: You mentioned "quantized" states. What does that mean?

Instructor: Another excellent question. It means that certain properties, like the energy of an electron in an atom, can only have specific, discrete values. It can't be just any value. It's like a staircase, not a ramp. An electron can be on step one or step two, but never in between. This is a fundamental departure from classical physics.

Instructor: Alright, that's a lot to take in. The key takeaways for today are: wave-particle duality, the observer effect, and quantized energy levels. These are the pillars of quantum mechanics. Read Chapter 1 for a deeper dive. Any final questions?

Student 2: My brain hurts.

Instructor: (Chuckles) That's a very common side effect. It means you're starting to get it. Class dismissed.`;

export const mockUser = {
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  avatarUrl: 'https://picsum.photos/seed/user/100/100',
  role: 'student' as 'student' | 'admin' | 'instructor',
};

export const mockResources = [
  { id: '1', title: 'Quantum Mechanics 101', type: 'PDF', course: 'Physics 101', dateAdded: '2023-10-15' },
  { id: '2', title: 'Intro to UX Design', type: 'Video', course: 'UX Design', dateAdded: '2023-10-12' },
  { id: '3', title: 'Data Structures Cheatsheet', type: 'PDF', course: 'Data Science', dateAdded: '2023-10-10' },
  { id: '4', title: 'Bauhaus Movement', type: 'Slides', course: 'Design History', dateAdded: '2023-10-08' },
];

export const mockEvents = [
  { id: '1', title: 'Physics 101 Live', course: 'Quantum Physics', startTime: '10:00 AM', type: 'Live Class' },
  { id: '2', title: 'Python Quiz 2 Due', course: 'Data Science', startTime: '11:59 PM', type: 'Quiz Due' },
  { id: '3', title: 'Bauhaus Essay Due', course: 'Design History', startTime: '11:59 PM', type: 'Assignment' },
]

export const mockCourses = [
  ...coursesToSeed
]

export const mockAssignments = [
  { id: '1', course: 'Design History', title: 'Essay: Evolution of Bauhaus', dueDate: 'Tomorrow' },
  { id: '2', course: 'Data Science', title: 'Python Quiz 2', dueDate: 'In 3 days' },
];


export const mockRecentEnrollments = [
  { id: '1', student: { name: 'Alice', avatarUrl: 'https://picsum.photos/seed/s1/100' }, course: 'Biology 101', date: '2023-10-20', status: 'Approved' },
  { id: '2', student: { name: 'Bob', avatarUrl: 'https://picsum.photos/seed/s2/100' }, course: 'Chemistry 202', date: '2023-10-19', status: 'Approved' },
  { id: '3', student: { name: 'Charlie', avatarUrl: 'https://picsum.photos/seed/s3/100' }, course: 'Physics 101', date: '2023-10-22', status: 'Pending' },
];

export const mockInstructorMessages: any[] = [
  { id: '1', student: { name: 'Maria Garcia', avatarUrl: 'https://picsum.photos/seed/s4/100' }, message: 'I have a question about the final project deadline.', time: '2h ago' },
  { id: '2', student: { name: 'David Lee', avatarUrl: 'https://picsum.photos/seed/s5/100' }, message: 'Could you clarify the lecture notes from yesterday?', time: '5h ago' },
  { id: '3', student: { name: 'Sophia Chen', avatarUrl: 'https://picsum.photos/seed/s6/100' }, message: 'Thank you for the extension!', time: '1d ago' },
];

