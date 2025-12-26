import type { Course, User, Resource, CalendarEvent } from './types';

export const mockUser: User = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
  role: 'Student',
};

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'Advanced JavaScript',
    description: 'Deep dive into modern JS features, including async/await, modules, and performance optimization.',
    instructor: 'Dr. Evelyn Reed',
    duration: '8 Weeks',
    imageUrl: 'https://picsum.photos/seed/js/600/400',
    imageHint: 'javascript code',
    progress: 75,
  },
  {
    id: 'c2',
    title: 'Python for Data Analysis',
    description: 'Learn to use Pandas, NumPy, and Matplotlib for data manipulation and visualization.',
    instructor: 'Dr. Samuel Chen',
    duration: '6 Weeks',
    imageUrl: 'https://picsum.photos/seed/python/600/400',
    imageHint: 'python data',
    progress: 40,
  },
  {
    id: 'c3',
    title: 'Principles of UX/UI Design',
    description: 'A comprehensive guide to creating user-centric and aesthetically pleasing digital products.',
    instructor: 'Maria Garcia',
    duration: '10 Weeks',
    imageUrl: 'https://picsum.photos/seed/uidesign/600/400',
    imageHint: 'ux design',
    progress: 90,
  },
  {
    id: 'c4',
    title: 'Cloud Computing with AWS',
    description: 'Understand the fundamentals of cloud infrastructure and services with Amazon Web Services.',
    instructor: 'Ben Carter',
    duration: '12 Weeks',
    imageUrl: 'https://picsum.photos/seed/aws/600/400',
    imageHint: 'cloud server',
    progress: 15,
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

export const mockLiveClassTranscript = `Instructor: Welcome everyone to our class on "The Art of Storytelling in Data Visualization". Today, we're going to explore how to turn dry data into compelling narratives. Let's start with a basic principle: every chart should tell a story. Can anyone give me an example?

Student A: Like using a line chart to show a company's growth over time?

Instructor: Exactly! The story there is one of progress, or perhaps decline. The y-axis movement creates a natural narrative arc. Now, let's consider color. Color shouldn't be just decorative; it should be functional. Using a contrasting color, like our academy's vibrant orange, can highlight a key data point. For example, in a bar chart of regional sales, you could make your region's bar orange to immediately draw the viewer's eye. This is a powerful tool.

Student B: What about choosing the right chart type? I sometimes get confused between a bar chart and a histogram.

Instructor: Great question. It boils down to the type of data. Bar charts are for comparing discrete categories, like sales per product. Histograms, on the other hand, show the distribution of continuous data, like the ages of your customers. Choosing the wrong one can mislead your audience. The key insight here is that the chart type itself is part of the grammar of your data story.

Instructor: To wrap up, I want you to remember three things. First, start with a question you want to answer. Second, choose the simplest possible visualization to answer it. Third, use elements like color and labels to guide your audience to the main insight. For further study, I recommend reading "Storytelling with Data" by Cole Nussbaumer Knaflic. It's a fantastic resource. Any final questions?

Student A: No, that was very clear. Thanks!

Instructor: Wonderful. Your assignment is to take a dataset of your choice and create a one-page visual story. See you all next week.`;
