import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function CertificationsPage() {
  const certificationCourseIds = [
    "6a44e9f2bae728bb84e67624", // Housekeeping & Domestic Management
    "6a44e9f2bae728bb84e67629", // Hospitality Management
    "6a44e9f2bae728bb84e6762e", // Events & Protocol Management
    "6a44e9f2bae728bb84e67633", // Executive Assistant Management
    "6a44e9f2bae728bb84e67638", // Hospitality & Global Relationship Management
    "6a44e9f2bae728bb84e6763d", // Certificate in Business Innovation & Entrepreneurship
    "6a44e9f2bae728bb84e67644", // Certificate in Food & Beverage Management
    "6a44e9f2bae728bb84e6764b", // Hospitality Workforce Management (formerly Hospitality Labour Management)
    "6a44e9f2bae728bb84e67652", // Certificate in Restaurant & Bar Service
    "6a75aaad7cc19b6ca1a85f95", // Service Excellence (formerly The Silent Standard, split from the Executive Master Class)
  ];

  return (
    <CurriculumCatalog
      title="Professional Certifications"
      subtitle="Internationally recognised professional credentials in hospitality, domestic management, events, executive assistance, and global relations."
      badge="Professional Certifications"
      courseIds={certificationCourseIds}
      acceleration="12 Weeks"
    />
  );
}

export async function generateMetadata() {
  return {
    title: "Professional Certifications — Ashford & Gray Academy",
    description: "Internationally recognised professional credentials in hospitality, domestic management, events, executive assistance, and global relations.",
  };
}
