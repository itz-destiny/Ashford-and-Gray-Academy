import type { TourStep } from "@/components/tutorial/PortalTutorial";

export const registrarTourSteps: TourStep[] = [
    {
        target: '[data-tour="nav-reg-home"]',
        title: 'Welcome to the Enrolment Office',
        content: "This is your dashboard for student records, audit history, and academy-wide reports.",
        skipBeacon: true,
        placement: 'right',
    },
    {
        target: '[data-tour="nav-reg-users"]',
        title: 'Student Records',
        content: 'View and manage every student account on the platform.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-reg-audit"]',
        title: 'System History',
        content: 'A full audit trail of key actions taken across the platform.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-reg-communications"]',
        title: 'My Messages',
        content: 'Message students or staff directly from here.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-reg-reports"]',
        title: 'Academy Reports',
        content: 'Real enrollment and records reporting for the academy.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-reg-settings"]',
        title: 'Account Settings',
        content: 'Manage institution-wide settings, including the WhatsApp community link Admissions uses. You can replay this tutorial anytime from here.',
        placement: 'right',
    },
];
