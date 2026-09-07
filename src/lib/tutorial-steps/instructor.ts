import type { TourStep } from "@/components/tutorial/PortalTutorial";

export const instructorTourSteps: TourStep[] = [
    {
        target: '[data-tour="nav-instructor-overview"]',
        title: 'Welcome, Faculty',
        content: "This is your teaching dashboard — a quick look at your courses, upcoming classes, and student activity every time you sign in.",
        skipBeacon: true,
        placement: 'right',
    },
    {
        target: '[data-tour="nav-instructor-courses"]',
        title: 'My Teaching',
        content: 'View every course you teach, manage content, and track completion here.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-instructor-schedule"]',
        title: 'Class Schedule',
        content: 'See your upcoming live classes. Start a session directly from here — no separate app needed.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-instructor-live-history"]',
        title: 'Live Class History',
        content: 'Review past live sessions, including attendance and recordings where available.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-instructor-students"]',
        title: 'My Students',
        content: 'See every student enrolled in your courses and their progress.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-instructor-tests"]',
        title: 'Tests & Exams',
        content: 'Author tests with multiple-choice, true/false, and short-answer questions, publish them, and grade results — auto-scored the moment a student submits.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-instructor-communications"]',
        title: 'My Messages',
        content: 'Message your students directly and get notified the moment they reply.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-instructor-performance"]',
        title: 'Performance',
        content: 'Track how your courses and students are performing over time.',
        placement: 'right',
    },
    {
        target: '[data-tour="header-notifications"]',
        title: 'Stay Notified',
        content: 'New messages, submissions, and class reminders show up here. You can replay this tutorial anytime from the sidebar.',
        placement: 'bottom',
    },
];
