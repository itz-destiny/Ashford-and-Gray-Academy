import type { TourStep } from "@/components/tutorial/PortalTutorial";

export const financeTourSteps: TourStep[] = [
    {
        target: '[data-tour="nav-fin-home"]',
        title: 'Welcome to the Financial Office',
        content: "This is your dashboard for tuition, transactions, and payouts across the academy.",
        skipBeacon: true,
        placement: 'right',
    },
    {
        target: '[data-tour="nav-fin-transactions"]',
        title: 'Transactions',
        content: 'Every real payment made on the platform, in one place.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-fin-tuition"]',
        title: 'Tuition',
        content: 'Track tuition status across every enrolled student.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-fin-payouts"]',
        title: 'Payouts',
        content: 'Review and approve payouts to instructors and staff.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-fin-scholarships"]',
        title: 'Scholarships',
        content: "See every student's sponsor and manage scholarship assignments.",
        placement: 'right',
    },
    {
        target: '[data-tour="nav-fin-reports"]',
        title: 'Reports',
        content: 'Real financial analytics and revenue trends for the academy.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-fin-tickets"]',
        title: 'Support Tickets',
        content: 'Handle billing and finance-related support requests here.',
        placement: 'right',
    },
    {
        target: '[data-tour="nav-fin-communications"]',
        title: 'Messages',
        content: 'Message students or staff directly. You can replay this tutorial anytime from here.',
        placement: 'right',
    },
];
