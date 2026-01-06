
import type { Course, User, Resource, CalendarEvent, AppEvent, Assignment, Enrollment, InstructorMessage } from './types';

export const mockUser: User = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
  role: 'Student',
};

export const mockCourses: Course[] = [
  {
    id: 'c1',
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
    id: 'c2',
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
    id: 'c3',
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
    id: 'c4',
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
    id: 'c5',
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
    id: 'c6',
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
    id: 'c7',
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


export const mockResources: Resource[] = [
  {
    id: 'r1',
    title: 'ES2022 Feature Overview',
    type: 'PDF',
    course: 'Advanced JavaScript',
    dateAdded: '2024-05-10',
    imageUrl: 'https://picsum.photos/seed/pdf1/200/200',
    imageHint: 'document icon',
  },
  {
    id: 'r2',
    title: 'Data Wrangling with Pandas',
    type: 'Video',
    course: 'Python for Data Analysis',
    dateAdded: '2024-05-08',
    imageUrl: 'https://picsum.photos/seed/video1/200/200',
    imageHint: 'video play',
  },
  {
    id: 'r3',
    title: 'Figma Prototyping Workshop',
    type: 'Slides',
    course: 'Principles of UX/UI Design',
    dateAdded: '2024-05-12',
    imageUrl: 'https://picsum.photos/seed/slides1/200/200',
    imageHint: 'presentation file',
  },
  {
    id: 'r4',
    title: 'Introduction to S3',
    type: 'PDF',
    course: 'Cloud Computing with AWS',
    dateAdded: '2024-05-14',
    imageUrl: 'https://picsum.photos/seed/pdf2/200/200',
    imageHint: 'document abstract',
  },
];

export const mockEvents: CalendarEvent[] = [
    {
        id: 'e1',
        title: 'Live Q&A Session',
        course: 'Advanced JavaScript',
        type: 'Live Class',
        startTime: '14:00',
        endTime: '15:00',
    },
    {
        id: 'e2',
        title: 'Module 4 Quiz',
        course: 'Python for Data Analysis',
        type: 'Quiz Due',
        startTime: '23:59',
        endTime: '',
    },
    {
        id: 'e3',
        title: 'Wireframe Peer Review',
        course: 'Principles of UX/UI Design',
        type: 'Assignment',
        startTime: '18:00',
        endTime: '',
    },
];

export const mockAppEvents: AppEvent[] = [
  {
    id: 'ae1',
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
    id: 'ae2',
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
    id: 'ae3',
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
    id: 'ae4',
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


export const mockLiveClassTranscript = `Instructor: Welcome everyone to our class on "The Art of Storytelling in Data Visualization". Today, we're going to explore how to turn dry data into compelling narratives. Let's start with a basic principle: every chart should tell a story. Can anyone give me an example?

Student A: Like using a line chart to show a company's growth over time?

Instructor: Exactly! The story there is one of progress, or perhaps decline. The y-axis movement creates a natural narrative arc. Now, let's consider color. Color shouldn't be just decorative; it should be functional. Using a contrasting color, like our academy's vibrant orange, can highlight a key data point. For example, in a bar chart of regional sales, you could make your region's bar orange to immediately draw the viewer's eye. This is a powerful tool.

Student B: What about choosing the right chart type? I sometimes get confused between a bar chart and a histogram.

Instructor: Great question. It boils down to the type of data. Bar charts are for comparing discrete categories, like sales per product. Histograms, on the other hand, show the distribution of continuous data, like the ages of your customers. Choosing the wrong one can mislead your audience. The key insight here is that the chart type itself is part of the grammar of your data story.

Instructor: To wrap up, I want you to remember three things. First, start with a question you want to answer. Second, choose the simplest possible visualization to answer it. Third, use elements like color and labels to guide your audience to the main insight. For further study, I recommend reading "Storytelling with Data" by Cole Nussbaumer Knaflic. It's a fantastic resource. Any final questions?

Student A: No, that was very clear. Thanks!

Instructor: Wonderful. Your assignment is to take a dataset of your choice and create a one-page visual story. See you all next week.`;

export const mockAssignments: Assignment[] = [
    {
        id: 'a1',
        course: 'Design History',
        title: 'Essay: Evolution of Bauhaus',
        dueDate: 'Due Tomorrow'
    },
    {
        id: 'a2',
        course: 'Data Science',
        title: 'Python Quiz 2',
        dueDate: 'In 3 days'
    }
];

export const mockRecentEnrollments: Enrollment[] = [
    {
        id: 'en1',
        student: { name: 'Liam Johnson', avatarUrl: 'https://picsum.photos/seed/liam/100/100' },
        course: 'Intro to Biology',
        date: 'Oct 24, 2023',
        status: 'Pending'
    },
    {
        id: 'en2',
        student: { name: 'Emma Wilson', avatarUrl: 'https://picsum.photos/seed/emma/100/100' },
        course: 'Organic Chemistry',
        date: 'Oct 23, 2023',
        status: 'Approved'
    },
    {
        id: 'en3',
        student: { name: 'Noah Brown', avatarUrl: 'https://picsum.photos/seed/noah/100/100' },
        course: 'Intro to Biology',
        date: 'Oct 22, 2023',
        status: 'Approved'
    }
];

export const mockInstructorMessages: InstructorMessage[] = [
    {
        id: 'im1',
        student: { name: 'Sarah Jenkins', avatarUrl: 'https://picsum.photos/seed/sarah/100/100' },
        message: 'Question about the assignment...',
        time: '2m ago'
    },
    {
        id: 'im2',
        student: { name: 'Mike Ross', avatarUrl: 'https://picsum.photos/seed/mike/100/100' },
        message: 'Can I get an extension on...',
        time: '1h ago'
    },
    {
        id: 'im3',
        student: { name: 'Jessica Day', avatarUrl: 'https://picsum.photos/seed/jessica/100/100' },
        message: 'Thank you for the feedback!',
        time: '3h ago'
    }
];
