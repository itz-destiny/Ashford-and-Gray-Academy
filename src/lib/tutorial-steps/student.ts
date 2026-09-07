import type { TourStep } from "@/components/tutorial/PortalTutorial";

export const studentTourSteps: TourStep[] = [
    {
        target: '[data-tour="nav-home"]',
        title: 'Welcome to the Academy',
        content: "This is your dashboard — a quick look at your progress, upcoming classes, and recent activity every time you sign in.",
        skipBeacon: true,
        placement: 'right',
    },
    {
        target: '[data-tour="nav-my-courses"]',
        title: 'My Courses',
        content: 'View every programme you\'re enrolled in, track your progress, and jump into course content here.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-tests"]',
        title: 'Tests & Exams',
        content: 'Take assigned tests and exams here — results are scored automatically the moment you submit.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-schedule"]',
        title: 'My Schedule',
        content: 'See your upcoming live classes and events. When it\'s time, join directly from here — no separate app needed.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-grades"]',
        title: 'My Grades',
        content: 'Track your course completion and test scores across every programme you\'re enrolled in.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-messages"]',
        title: 'My Messages',
        content: 'Message your instructors directly, and get notified the moment they reply.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-resources"]',
        title: 'Study Materials',
        content: 'Download readings, slides, and recordings your instructors have shared for your courses.',
        placement: 'right',
    },
    {
        target: '[data-tour="header-notifications"]',
        title: 'Stay Notified',
        content: 'New messages, grades, and class reminders show up here. You can replay this tutorial anytime from the sidebar\'s "Replay Tutorial" link.',
        placement: 'bottom',
    },
];
