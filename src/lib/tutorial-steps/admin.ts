import type { TourStep } from "@/components/tutorial/PortalTutorial";

export const adminTourSteps: TourStep[] = [
    {
        target: '[data-tour="nav-admin-overview"]',
        title: 'Welcome, Administrator',
        content: "This is Master Control — a real-time view of the entire academy: students, staff, courses, and finances.",
        skipBeacon: true,
        placement: 'right',
    },
    {
        target: '[data-tour="nav-admin-users"]',
        title: 'Members & Staff',
        content: 'Create and manage every account on the platform — students, instructors, and staff of any role.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-admin-courses"]',
        title: 'Course Catalog',
        content: 'Review and manage every course offered across the academy.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-admin-timetable"]',
        title: 'Timetable',
        content: 'See and manage the full schedule of live classes across every course.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-admin-events"]',
        title: 'Academy Events',
        content: 'Manage academy-wide events visible to students and staff.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-admin-payments"]',
        title: 'Payments',
        content: 'Track tuition payments and transactions across the academy.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-admin-communications"]',
        title: 'Messages',
        content: 'Message students or staff directly from here.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-admin-reports"]',
        title: 'Insights',
        content: 'Real academy-wide analytics — enrollment, performance, and revenue trends.',
        placement: 'right',
    },
    {
        target: '[data-tour="header-notifications"]',
        title: 'Stay Notified',
        content: 'New activity across the academy shows up here. You can replay this tutorial anytime from the sidebar.',
        placement: 'bottom',
    },
];
