export function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "Organization"],
    name: "Ashford & Gray Fusion Academy",
    alternateName: "Ashford and Gray Fusion Academy",
    url: "https://www.ashfordandgrayfusionacademy.com",
    logo: "https://www.ashfordandgrayfusionacademy.com/icon.png",
    description:
        "Nigeria's leading hospitality management and luxury service academy offering professional certifications, diplomas, and executive masterclass programmes in hospitality, domestic service, event management, and business leadership.",
    foundingDate: "2024",
    founder: {
        "@type": "Person",
        name: "Myne Wilfred",
        jobTitle: "Founder & President",
    },
    address: {
        "@type": "PostalAddress",
        addressCountry: "NG",
        addressRegion: "Rivers State",
    },
    contactPoint: [
        {
            "@type": "ContactPoint",
            telephone: "+234-8166918942",
            contactType: "admissions",
            availableLanguage: "English",
        },
        {
            "@type": "ContactPoint",
            telephone: "+234-8080971690",
            contactType: "customer support",
            availableLanguage: "English",
        },
        {
            "@type": "ContactPoint",
            email: "info@ashfordgrayacademy.com",
            contactType: "general enquiries",
        },
    ],
    sameAs: [
        "https://www.linkedin.com/in/ashford-gray-85b5a040a",
        "https://x.com/AshfordFusion",
        "https://www.instagram.com/ashfordgrayacademy",
        "https://www.facebook.com/share/1H8yi7mBSJ/",
        "https://youtube.com/@ashfordgray",
    ],
    hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Hospitality & Business Programmes",
        itemListElement: [
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Course",
                    name: "Professional Certifications in Hospitality",
                    description:
                        "Certifications in housekeeping, hospitality management, event planning, executive assistance, and global relations.",
                    provider: { "@type": "Organization", name: "Ashford & Gray Fusion Academy" },
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Course",
                    name: "Diploma Programmes",
                    description:
                        "Six-month diploma programmes in hospitality management, business innovation, professional development, and events.",
                    provider: { "@type": "Organization", name: "Ashford & Gray Fusion Academy" },
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Course",
                    name: "The Silent Standard Executive Master Class",
                    description:
                        "Signature executive-level leadership and operational excellence programme for senior hospitality and business professionals.",
                    provider: { "@type": "Organization", name: "Ashford & Gray Fusion Academy" },
                },
            },
        ],
    },
};
