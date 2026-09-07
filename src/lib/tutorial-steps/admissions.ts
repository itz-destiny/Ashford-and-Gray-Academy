import type { TourStep } from "@/components/tutorial/PortalTutorial";

export const admissionsTourSteps: TourStep[] = [
    {
        target: '[data-tour="nav-admissions-home"]',
        title: 'Welcome to the Admissions Office',
        content: "This is your dashboard for managing every student account on the platform.",
        skipBeacon: true,
        placement: 'right',
    },
    {
        target: '[data-tour="admissions-search"]',
        title: 'Find a Student',
        content: 'Search any student by name or email — useful when someone reports trouble logging in.',
        placement: 'bottom',
    },
    {
        target: '[data-tour="admissions-add"]',
        title: 'Admit New Student',
        content: 'Create a brand-new student account. They receive their login by email immediately.',
        placement: 'bottom',
    },
    {
        target: '[data-tour="admissions-message"]',
        title: 'Message Students',
        content: 'Send a custom email to every student, or just the ones you select in the table below.',
        placement: 'bottom',
    },
    {
        target: '[data-tour="admissions-table"]',
        title: 'Manage Students',
        content: 'Open the "..." menu next to any student to resend their welcome email, send the WhatsApp invite, switch their department, or edit their profile. Tick the checkbox on the left of any row (or the one in the header to select everyone visible) to message just a group at once.',
        placement: 'top',
    },
];
