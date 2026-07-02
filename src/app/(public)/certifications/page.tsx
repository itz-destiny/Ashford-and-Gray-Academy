import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function CertificationsPage() {
  const certificationCourseIds = [
    "664f3a8b2d1c9e8a7f0e0001", // Housekeeping & Domestic Management
    "664f3a8b2d1c9e8a7f0e0002", // Hospitality Management
    "664f3a8b2d1c9e8a7f0e0003", // Events & Protocol Management
    "664f3a8b2d1c9e8a7f0e0004", // Executive Assistant Management
    "664f3a8b2d1c9e8a7f0e0005", // Hospitality & Global Relationship Management
    "664f3a8b2d1c9e8a7f0e0011", // Certificate in Business Innovation & Entrepreneurship
    "664f3a8b2d1c9e8a7f0e0012", // Certificate in Food & Beverage Management
    "664f3a8b2d1c9e8a7f0e0013", // Certificate in Hospitality Labour Management
    "664f3a8b2d1c9e8a7f0e0014", // Certificate in Restaurant & Bar Service
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
