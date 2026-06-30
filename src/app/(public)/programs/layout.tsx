export const metadata = {
    title: "Diploma Programs — Hospitality, Events & Business | Nigeria",
    description:
        "Six-month professional diploma programmes in Hospitality Management, Business Innovation & Entrepreneurship, Professional Development & Global Relations, and Event & Protocol Management. Fully online. Enrol at Ashford & Gray Fusion Academy.",
    keywords: [
        "diploma hospitality Nigeria",
        "hospitality diploma programme",
        "event management diploma Nigeria",
        "business innovation diploma Nigeria",
        "online hospitality diploma",
        "professional diploma courses Nigeria",
    ],
    alternates: { canonical: "https://www.ashfordandgrayfusionacademy.com/programs" },
    openGraph: {
        title: "Diploma Programs — Ashford & Gray Fusion Academy",
        description: "Six-month online diploma programmes in hospitality, events, business innovation, and professional development.",
        url: "https://www.ashfordandgrayfusionacademy.com/programs",
    },
};

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

import React from "react";
