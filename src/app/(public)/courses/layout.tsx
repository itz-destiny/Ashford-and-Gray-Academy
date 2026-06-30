export const metadata = {
    title: "All Courses — Hospitality, Events & Business Training | Nigeria",
    description:
        "Browse all courses at Ashford & Gray Fusion Academy — hospitality management, housekeeping, event planning, domestic service, executive assistance, protocol, and business innovation. Fully online. Available to students in Nigeria and worldwide.",
    keywords: [
        "hospitality courses Nigeria",
        "online hospitality training",
        "housekeeping courses Nigeria",
        "event planning courses Nigeria",
        "domestic service courses",
        "butler training Nigeria",
        "protocol courses Nigeria",
        "online courses hospitality Africa",
    ],
    alternates: { canonical: "https://www.ashfordandgrayfusionacademy.com/courses" },
    openGraph: {
        title: "All Courses — Ashford & Gray Fusion Academy",
        description: "Browse all hospitality, events, domestic service, and business courses — fully online, Nigeria and worldwide.",
        url: "https://www.ashfordandgrayfusionacademy.com/courses",
    },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

import React from "react";
