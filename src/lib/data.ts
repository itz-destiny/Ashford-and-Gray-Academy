
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
    title: 'Intro to Biology',
    description: 'Master the basics of user experience research and prototyping.',
    category: 'BIO-101',
    instructor: { name: 'Sarah Johnson', avatarUrl: 'https://picsum.photos/seed/ins1/100/100', verified: true },
    rating: 4.8,
    reviews: 1234,
    duration: 12,
    level: 'Intermediate',
    price: 299,
    originalPrice: 399,
    imageUrl: '/biology.jpeg',
    imageHint: 'microscope plant',
  },
  {
    id: 'c2',
    title: 'Organic Chemistry',
    description: 'Learn Python, Pandas, and data visualization techniques.',
    category: 'CHM-202',
    instructor: { name: 'Emily Davis', avatarUrl: 'https://picsum.photos/seed/ins2/100/100', verified: true },
    rating: 4.9,
    reviews: 2852,
    duration: 10,
    level: 'Advanced',
    price: 349,
    originalPrice: 449,
    imageUrl: '/chemistry.jpeg',
    imageHint: 'chemistry beakers',
  },
  {
    id: 'c3',
    title: 'Digital Marketing Strategy & ROI',
    category: 'Marketing',
    description: 'A deep dive into marketing strategies.',
    instructor: { name: 'Michael Chen', avatarUrl: 'https://picsum.photos/seed/ins3/100/100', verified: true },
    rating: 4.7,
    reviews: 2154,
    duration: 8,
    level: 'Beginner',
    price: 199,
    originalPrice: 299,
    imageUrl: 'https://picsum.photos/seed/course3/600/400',
    imageHint: 'marketing strategy infographic',
  },
  {
    id: 'c4',
    title: 'UI/UX Design: From Concept to Prototype',
    category: 'Design',
    description: 'Everything about UI/UX design.',
    instructor: { name: 'Jessica Martinez', avatarUrl: 'https://picsum.photos/seed/ins4/100/100', verified: false },
    rating: 4.8,
    reviews: 1587,
    duration: 8,
    level: 'All Levels',
    price: 279,
    originalPrice: 379,
    imageUrl: 'https://picsum.photos/seed/course4/600/400',
    imageHint: 'ui design wireframe',
  },
  {
    id: 'c5',
    title: 'Project Management Professional (PMP)',
    category: 'Business',
    description: 'Become a certified project manager.',
    instructor: { name: 'David Wilson', avatarUrl: 'https://picsum.photos/seed/ins5/100/100', verified: true },
    rating: 4.9,
    reviews: 3012,
    duration: 6,
    level: 'Intermediate',
    price: 229,
    originalPrice: 329,
    imageUrl: 'https://picsum.photos/seed/course5/600/400',
    imageHint: 'project management board',
  },
  {
    id: 'c6',
    title: 'Machine Learning & AI Fundamentals',
    category: 'Data Science',
    description: 'The basics of machine learning.',
    instructor: { name: 'Dr. Anna Lee', avatarUrl: 'https://picsum.photos/seed/ins6/100/100', verified: true },
    rating: 4.9,
    reviews: 4201,
    duration: 14,
    level: 'Advanced',
    price: 399,
    originalPrice: 499,
    imageUrl: 'https://picsum.photos/seed/course6/600/400',
    imageHint: 'machine learning abstract',
  },
   {
    id: 'c7',
    title: 'Cloud Computing with AWS & Azure',
    category: 'Technology',
    description: 'Learn cloud computing from scratch.',
    instructor: { name: 'Robert Taylor', avatarUrl: 'https://picsum.photos/seed/ins7/100/100', verified: true },
    rating: 4.7,
    reviews: 986,
    duration: 11,
    level: 'Intermediate',
    price: 329,
    originalPrice: 429,
    imageUrl: 'https://picsum.photos/seed/course7/600/400',
    imageHint: 'cloud computing infrastructure',
  },
  {
    id: 'c8',
    title: 'Social Media Marketing Excellence',
    category: 'Marketing',
    description: 'Become a social media expert.',
    instructor: { name: 'Lisa Anderson', avatarUrl: 'https://picsum.photos/seed/ins8/100/100', verified: false },
    rating: 4.8,
    reviews: 1998,
    duration: 7,
    level: 'Beginner',
    price: 179,
    originalPrice: 249,
    imageUrl: 'https://picsum.photos/seed/course8/600/400',
    imageHint: 'social media feed',
  },
  {
    id: 'c9',
    title: 'Graphic Design & Brand Identity',
    category: 'Design',
    description: 'Build a strong brand identity.',
    instructor: { name: 'Chris Roberts', avatarUrl: 'https://picsum.photos/seed/ins9/100/100', verified: true },
    rating: 4.8,
    reviews: 1342,
    duration: 8,
    level: 'All Levels',
    price: 249,
    originalPrice: 349,
    imageUrl: 'https://picsum.photos/seed/course9/600/400',
    imageHint: 'graphic design tools',
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
    title: 'Global AI Conference 2024',
    category: 'Conference',
    date: '2024-11-15',
    location: 'Virtual',
    price: 99,
    imageUrl: 'https://picsum.photos/seed/event1/600/400',
    imageHint: 'tech conference stage',
    organizer: 'TechCon Inc.'
  },
  {
    id: 'ae2',
    title: 'Advanced React Patterns Workshop',
    category: 'Workshop',
    date: '2024-12-02',
    location: 'New York, NY',
    price: 249,
    imageUrl: 'https://picsum.photos/seed/event2/600/400',
    imageHint: 'people coding workshop',
    organizer: 'DevHub'
  },
  {
    id: 'ae3',
    title: 'The Future of Remote Work',
    category: 'Webinar',
    date: '2024-11-20',
    location: 'Online',
    imageUrl: 'https://picsum.photos/seed/event3/600/400',
    imageHint: 'person video call',
    organizer: 'Future Workforce Co.'
  },
  {
    id: 'ae4',
    title: 'Startup Founders Networking Night',
    category: 'Networking',
    date: '2024-12-10',
    location: 'San Francisco, CA',
    price: 25,
    imageUrl: 'https://picsum.photos/seed/event4/600/400',
    imageHint: 'people networking event',
    organizer: 'ConnectSphere'
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

    