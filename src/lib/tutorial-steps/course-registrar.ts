import type { TourStep } from "@/components/tutorial/PortalTutorial";

export const courseRegistrarTourSteps: TourStep[] = [
    {
        target: '[data-tour="nav-cr-home"]',
        title: 'Welcome to the Programme Office',
        content: "This is your home base for managing the academy's programmes — approvals, students, and performance.",
        skipBeacon: true,
        placement: 'right',
    },
    {
        target: '[data-tour="nav-cr-courses"]',
        title: 'Academy Programmes',
        content: 'Review, approve, and manage every course offered at the academy.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-cr-students"]',
        title: 'Student List',
        content: 'See every enrolled student and which programme they belong to.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-cr-communications"]',
        title: 'My Messages',
        content: 'Message students or staff directly from here.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-cr-analytics"]',
        title: 'Performance',
        content: 'Real enrollment and grading analytics across every programme.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-cr-settings"]',
        title: 'Account Settings',
        content: 'Manage your profile and preferences. You can replay this tutorial anytime from here.',
        placement: 'right',
    },
];
