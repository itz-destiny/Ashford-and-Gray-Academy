export const metadata = {
    title: "Events — Hospitality & Business Events | Ashford & Gray",
    description:
        "Upcoming and past events from Ashford & Gray Fusion Academy — workshops, masterclasses, graduation ceremonies, and industry events in Nigeria and globally.",
    keywords: [
        "hospitality events Nigeria",
        "Ashford Gray events",
        "hospitality workshops Nigeria",
        "masterclass events Nigeria",
    ],
    alternates: { canonical: "https://www.ashfordandgrayfusionacademy.com/events" },
    openGraph: {
        title: "Events — Ashford & Gray Fusion Academy",
        description: "Workshops, masterclasses, graduation ceremonies, and industry events from Ashford & Gray Fusion Academy.",
        url: "https://www.ashfordandgrayfusionacademy.com/events",
    },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

import React from "react";
