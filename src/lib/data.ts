import type { Course, AppEvent } from './types';

// This data is now used for seeding the database, not for direct display.
export const coursesToSeed: Omit<Course, 'id' | 'progress'>[] = [
    {
    title: 'Protocol and Crown Control Training Etiquette',
    description: 'Master the art of etiquette for formal and professional settings.',
    category: 'Hospitality',
    instructor: { name: 'Dr. Emily Post', avatarUrl: 'https://picsum.photos/seed/ins1/100/100', verified: true },
    rating: 4.9,
    reviews: 1530,
    duration: 4,
    level: 'All Levels',
    price: 150,
    originalPrice: 200,
    imageUrl: '/course1.jpeg',
    imageHint: 'formal dining setup',
  },
  {
    title: 'Cleaning and Maintenance Fundamentals',
    description: 'Learn industry standards for commercial and residential cleaning.',
    category: 'Facilities Management',
    instructor: { name: 'Mr. Don Aslett', avatarUrl: 'https://picsum.photos/seed/ins2/100/100', verified: false },
    rating: 4.7,
    reviews: 890,
    duration: 6,
    level: 'Beginner',
    price: 99,
    originalPrice: 149,
    imageUrl: '/course2.jpeg',
    imageHint: 'cleaning supplies',
  },
  {
    title: 'Book Keeping and Inventory Management',
    category: 'Business',
    description: 'Essential skills for managing finances and stock for small businesses.',
    instructor: { name: 'Ms. Rachel Cruz', avatarUrl: 'https://picsum.photos/seed/ins3/100/100', verified: true },
    rating: 4.8,
    reviews: 2100,
    duration: 8,
    level: 'Intermediate',
    price: 220,
    originalPrice: 280,
    imageUrl: '/course3.jpeg',
    imageHint: 'ledger and calculator',
  },
  {
    title: 'Fine Dining Etiquette & Service',
    category: 'Hospitality',
    description: 'Advanced techniques for fine dining service and guest experience.',
    instructor: { name: 'Mr. Will Guidara', avatarUrl: 'https://picsum.photos/seed/ins4/100/100', verified: true },
    rating: 4.9,
    reviews: 1800,
    duration: 5,
    level: 'Advanced',
    price: 350,
    originalPrice: 420,
    imageUrl: '/course4.jpeg',
    imageHint: 'fine dining restaurant',
  },
  {
    title: 'Professional House-Keeping',
    category: 'Facilities Management',
    description: 'Comprehensive training for professional housekeeping in the hotel industry.',
    instructor: { name: 'Ms. Marie Kondo', avatarUrl: 'https://picsum.photos/seed/ins5/100/100', verified: false },
    rating: 4.8,
    reviews: 1250,
    duration: 10,
    level: 'Intermediate',
    price: 180,
    imageUrl: '/course5.jpeg',
    imageHint: 'hotel room cleaning',
  },
  {
    title: 'Advanced Cleaning and Maintenance',
    category: 'Facilities Management',
    description: 'Specialized techniques for floor care, restoration, and sanitation.',
    instructor: { name: 'Mr. Don Aslett', avatarUrl: 'https://picsum.photos/seed/ins6/100/100', verified: false },
    rating: 4.6,
    reviews: 750,
    duration: 12,
    level: 'Advanced',
    price: 250,
    originalPrice: 300,
    imageUrl: '/course6.jpeg',
    imageHint: 'industrial cleaning machine',
  },
   {
    title: 'Customer Service Excellence',
    category: 'Business',
    description: 'Develop key skills for providing outstanding customer service.',
    instructor: { name: 'Mr. Shep Hyken', avatarUrl: 'https://picsum.photos/seed/ins7/100/100', verified: true },
    rating: 4.8,
    reviews: 2500,
    duration: 4,
    level: 'Beginner',
    price: 120,
    imageUrl: '/course7.jpeg',
    imageHint: 'customer service representative',
  },
];


export const eventsToSeed: Omit<AppEvent, 'id'>[] = [
  {
    title: 'Protocol and Crown Control Training Etiquette',
    category: 'Workshop',
    date: '2024-11-15',
    location: 'Virtual',
    price: 150,
    imageUrl: '/course1.jpeg',
    imageHint: 'formal dining setup',
    organizer: 'Etiquette Experts'
  },
  {
    title: 'Cleaning and Maintenance Fundamentals',
    category: 'Seminar',
    date: '2024-12-02',
    location: 'New York, NY',
    price: 99,
    imageUrl: '/course2.jpeg',
    imageHint: 'cleaning supplies',
    organizer: 'CleanCo'
  },
  {
    title: 'Book Keeping and Inventory Management',
    category: 'Webinar',
    date: '2024-11-20',
    location: 'Online',
    price: 220,
    imageUrl: '/course3.jpeg',
    imageHint: 'ledger and calculator',
    organizer: 'Biz Solutions'
  },
  {
    title: 'Fine Dining Etiquette & Service',
    category: 'Workshop',
    date: '2024-12-10',
    location: 'San Francisco, CA',
    price: 350,
    imageUrl: '/course4.jpeg',
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
